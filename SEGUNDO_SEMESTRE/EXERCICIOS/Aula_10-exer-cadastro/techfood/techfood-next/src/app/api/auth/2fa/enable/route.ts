/**
 * POST /api/auth/2fa/enable
 * Confirma e ativa o 2FA para o usuário logado.
 * Recebe: { secret, codigo }
 *   - secret: o segredo gerado pelo endpoint /setup
 *   - codigo: código de 6 dígitos do app autenticador para confirmar
 */
import { NextResponse } from 'next/server';
import { requireAuth, isAuthError } from '@/lib/auth/require-auth';
import { verifyTOTP } from '@/lib/auth/totp';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (isAuthError(auth)) return auth;

  try {
    const body = await request.json();
    const { secret, codigo } = body;

    if (!secret || !codigo) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'secret e codigo são obrigatórios' },
        { status: 400 }
      );
    }

    // Validar o código antes de persistir o segredo
    const valido = verifyTOTP(String(codigo), String(secret));
    if (!valido) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Código 2FA inválido. Verifique o app e tente novamente.' },
        { status: 400 }
      );
    }

    // Salvar o segredo e habilitar o 2FA
    await prisma.usuario.update({
      where: { id: Number(auth.sub) },
      data: {
        two_factor_secret: String(secret),
        two_factor_enabled: true,
      },
    });

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Autenticação de dois fatores ativada com sucesso!',
    });
  } catch {
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno ao ativar o 2FA' },
      { status: 500 }
    );
  }
}
