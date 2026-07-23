/**
 * GET /api/auth/me/2fa-status
 * Retorna o status 2FA do usuário logado.
 */
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/require-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const usuario = await getAuthenticatedUser();

  if (!usuario) {
    return NextResponse.json(
      { sucesso: false, mensagem: 'Não autenticado' },
      { status: 401 }
    );
  }

  const dados = await prisma.usuario.findUnique({
    where: { id: Number(usuario.sub) },
    select: { two_factor_enabled: true },
  });

  return NextResponse.json({
    sucesso: true,
    two_factor_enabled: dados?.two_factor_enabled ?? false,
  });
}
