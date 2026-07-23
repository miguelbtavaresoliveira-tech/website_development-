import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTokenFromCookieHeader, verifyToken } from '@/lib/auth/jwt';
import { PROTECTED_PAGE_PATHS } from '@/lib/auth/constants';

const MUTATION_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function isProtectedApiRoute(pathname: string, method: string): boolean {
  if (!MUTATION_METHODS.has(method)) return false;

  if (pathname === '/api/produtos' || pathname.startsWith('/api/produtos/')) {
    return true;
  }

  if (pathname === '/api/cardapios' || pathname.startsWith('/api/cardapios/')) {
    return true;
  }

  return false;
}

function isProtectedPage(pathname: string): boolean {
  return PROTECTED_PAGE_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  // Proteção CSRF extrema para requisições mutativas (POST, PUT, PATCH, DELETE)
  if (MUTATION_METHODS.has(method)) {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host') || request.nextUrl.host;

    let hostMatched = false;
    if (origin) {
      try {
        const originUrl = new URL(origin);
        if (originUrl.host === host) hostMatched = true;
      } catch {}
    }
    if (!hostMatched && referer) {
      try {
        const refererUrl = new URL(referer);
        if (refererUrl.host === host) hostMatched = true;
      } catch {}
    }

    if ((origin || referer) && !hostMatched) {
      return NextResponse.json(
        { sucesso: false, mensagem: 'Requisição inválida (CSRF Detectado)' },
        { status: 403 }
      );
    }
  }

  const needsAuth = isProtectedPage(pathname) || isProtectedApiRoute(pathname, method);

  if (!needsAuth) {
    return NextResponse.next();
  }

  const token = getTokenFromCookieHeader(request.headers.get('cookie'));
  const payload = token ? await verifyToken(token) : null;

  if (payload) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.sub);
    requestHeaders.set('x-user-role', payload.role);

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { sucesso: false, mensagem: 'Não autorizado. Faça login para continuar.' },
      { status: 401 }
    );
  }

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    '/cadastro/:path*',
    '/api/produtos/:path*',
    '/api/cardapios/:path*',
  ],
};
