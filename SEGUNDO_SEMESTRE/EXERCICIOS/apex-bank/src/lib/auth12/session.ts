import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "./constants";


const COOKIE_MAX_AGE = 8 * 60 * 60

export function getAuthCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production'

    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax' as const,
        path: '/',
        maxAge: COOKIE_MAX_AGE,
    }
}

export async function setAuthCookie(token: string): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions())
}

export async function clearAuthCookie(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(AUTH_COOKIE_NAME)
}

export async function getAuthTokenFromCookies(): Promise<string | undefined> {
    const cookiesStore = await cookies()
    return cookiesStore.get(AUTH_COOKIE_NAME)?.value
}