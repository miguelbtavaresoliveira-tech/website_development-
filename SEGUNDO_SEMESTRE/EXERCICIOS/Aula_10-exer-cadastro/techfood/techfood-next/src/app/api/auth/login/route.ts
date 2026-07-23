import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/session';
import { checkRateLimit, resetRateLimit } from '@/lib/auth/rate-limit';
import { loginSchema } from '@/lib/auth/validation';

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateCheck = checkRateLimit(ip);

    if (!rateCheck.allowed) {
      const minutos = Math.ceil((rateCheck.retryAfterMs || 0) / 60000);
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: `Muitas tentativas. Tente novamente em ${minutos} minuto(s).`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          sucesso: false,
          mensagem: 'Dados inválidos',
          erros: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, senha } = parsed.data;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        nome: true,
        email: true,
        senha_hash: true,
        role: true,
        ativo: true,
        two_factor_enabled: true,
      },
    });

    if (!usuario || !usuario.ativo) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'E-mail ou senha incorretos' },
        { status: 401 }
      );
    }

    const senhaValida = await verifyPassword(senha, usuario.senha_hash);

    if (!senhaValida) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'E-mail ou senha incorretos' },
        { status: 401 }
      );
    }

    resetRateLimit(ip);

    // Se o usuário tiver 2FA ativo, emitir token temporário (5 min)
    if (usuario.two_factor_enabled) {
      const tempToken = await signToken({
        sub: String(usuario.id),
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.role,
        // @ts-expect-error: campo extra para identificar token temporário
        type: '2fa_pending',
      });

      return NextResponse.json({
        sucesso: true,
        requer_2fa: true,
        temp_token: tempToken,
        mensagem: 'Código 2FA necessário',
      });
    }

    // Sem 2FA — login completo direto
    const token = await signToken({
      sub: String(usuario.id),
      email: usuario.email,
      nome: usuario.nome,
      role: usuario.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
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
