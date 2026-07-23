import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth/require-auth';

export async function GET() {
  const usuario = await getAuthenticatedUser();

  if (!usuario) {
    return NextResponse.json(
      { sucesso: false, mensagem: 'Não autenticado' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    sucesso: true,
    usuario: {
      id: Number(usuario.sub),
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    },
  });
}
