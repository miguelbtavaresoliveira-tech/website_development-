/**
 * POST /api/auth/2fa/disable
 * Desativa o 2FA do usuário logado.
 * Recebe: { senha, codigo }
 *   - senha: senha atual do usuário (confirmação de identidade)
 *   - codigo: código 2FA atual (garante que o app autenticador ainda está acessível)
 */
import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth/require-auth';
import { verifyTOTP } from '@/lib/auth/totp';
import { verifyPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { senha, codigo } = body;

    if (!senha || !codigo) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'senha e codigo são obrigatórios' },
        { status: 400 }
      );
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(auth.sub) },
      select: {
        senha_hash: true,
        two_factor_enabled: true,
        two_factor_secret: true,
      },
    });

    if (!usuario) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    if (!usuario.two_factor_enabled || !usuario.two_factor_secret) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'O 2FA não está ativo para esta conta' },
        { status: 400 }
      );
    }

    // Validar a senha do usuário
    const senhaOk = await verifyPassword(String(senha), usuario.senha_hash);
    if (!senhaOk) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Senha incorreta' },
        { status: 401 }
      );
    }

    // Validar o código TOTP atual
    const totpOk = verifyTOTP(String(codigo), usuario.two_factor_secret);
    if (!totpOk) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Código 2FA inválido' },
        { status: 401 }
      );
    }

    // Desativar o 2FA e limpar o segredo
    await prisma.usuario.update({
      where: { id: Number(auth.sub) },
      data: {
        two_factor_secret: null,
        two_factor_enabled: false,
      },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Autenticação de dois fatores desativada.',
    });
  } catch {
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno ao desativar o 2FA' },
      { status: 500 }
    );
  }
}
