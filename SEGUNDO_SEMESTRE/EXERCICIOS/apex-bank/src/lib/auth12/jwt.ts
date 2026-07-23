//Serviço de autentificação baseado em tokens

import { jwtVerify, SignJWT, type JWTPayload } from "jose";
import { JWTExpired } from "jose/errors";
import { AUTH_COOKIE_NAME, JWT_EXPIRATION } from "./constants";

/*
1. Nós criamos um token criptografado com os dados dele (como ID, email e cargo/role).

2. Enviamos esse token para o navegador dele dentro de um Cookie seguro.

3. Nas próximas requisições, o servidor lê esse cookie, valida se o token não foi alterado e decide se dá ou não acesso ao utilizador.

*/

export interface tokenPayload extends JWTPayload {
    sub: string;
    role: string;
}

function getSecretKey(): Uint8Array {
    const secret = process.env.JWT_SECRET
    if (!secret || secret.length < 32) {
        throw new Error('JWT_SECRET deve conter pelo menos 32 digitos')
    } 
    return new TextEncoder().encode(secret)
}

export async function signToken(payload: Omit<tokenPayload, 'iat' | 'exp'>): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(JWT_EXPIRATION)
        .sign(getSecretKey())
}

export async function verifyToken(token: string): Promise<tokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecretKey(), {
            algorithms: ['HS256'],
        })
        return payload as tokenPayload
    } catch  {
        return null
    }
}

export function getTokenFromCookieHeader(cookieheader: string | null): string | null {
    if (!cookieheader) return null

    const cookies = cookieheader.split(';').map((c) => c.trim())
    for (const cookie of cookies) {
        const [name, ...rest] = cookie.split('=')
        if (name === AUTH_COOKIE_NAME) {
            return decodeURIComponent(rest.join('='))
        }
    }
    return null
}