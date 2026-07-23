import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/session';

export async function POST() {
  await clearAuthCookie();

  return NextResponse.json({
    sucesso: true,
    mensagem: 'Logout realizado com sucesso',
  });
}
