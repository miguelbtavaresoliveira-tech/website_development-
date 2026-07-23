/**
 * POST /api/auth/2fa/verify
 * Valida o código TOTP e completa o login (troca temp_token por sessão definitiva).
 */
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { verifyTOTP } from '@/lib/auth/totp';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: Request) {
  try {
    // Rate-limit por IP para impedir força bruta nos códigos 2FA
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(`2fa:${ip}`);
    if (!rateCheck.allowed) {
      const minutos = Math.ceil((rateCheck.retryAfterMs || 0) / 60000);
      return NextResponse.json(
        { sucesso: false, mensagem: `Muitas tentativas. Tente em ${minutos} minuto(s).` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { temp_token, codigo } = body;

    if (!temp_token || !codigo) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'temp_token e codigo são obrigatórios' },
        { status: 400 }
      );
    }

    // Verifica o token temporário
    const payload = await verifyToken(temp_token);
    if (!payload || (payload as any).type !== '2fa_pending') {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Token inválido ou expirado' },
        { status: 401 }
      );
    }

    // Busca o segredo 2FA do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(payload.sub) },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        ativo: true,
        two_factor_enabled: true,
        two_factor_secret: true,
      },
    });

    if (!usuario || !usuario.ativo || !usuario.two_factor_enabled || !usuario.two_factor_secret) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Usuário inválido ou 2FA não configurado' },
        { status: 401 }
      );
    }

    // Valida o código TOTP com janela de ±1 período
    const valido = verifyTOTP(String(codigo), usuario.two_factor_secret);
    if (!valido) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Código 2FA inválido ou expirado' },
        { status: 401 }
      );
    }

    // Código válido — emitir sessão definitiva
    resetRateLimit(`2fa:${ip}`);

    const token = await signToken({
      sub: String(usuario.id),
      email: usuario.email,
      nome: usuario.nome,
      role: usuario.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Autenticação 2FA concluída com sucesso',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        role: usuario.role,
      },
    });
  } catch {
    return NextResponse.json(
      { sucesso: false, mensagem: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
