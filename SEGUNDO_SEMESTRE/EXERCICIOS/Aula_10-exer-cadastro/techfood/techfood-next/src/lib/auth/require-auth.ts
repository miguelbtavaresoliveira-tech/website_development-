import { NextResponse } from 'next/server';
import { getAuthTokenFromCookies } from './session';
import { verifyToken, type TokenPayload } from './jwt';

export async function getAuthenticatedUser(): Promise<TokenPayload | null> {
  const token = await getAuthTokenFromCookies();
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<TokenPayload | NextResponse> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return NextResponse.json(
      { sucesso: false, mensagem: 'Não autorizado. Faça login para continuar.' },
      { status: 401 }
    );
  }

  return user;
}

export function isAuthError(result: TokenPayload | NextResponse): result is NextResponse {
  return result instanceof NextResponse;
}
