import { NextResponse } from "next/server";
import { tokenPayload, verifyToken } from "./jwt";
import { getAuthTokenFromCookies } from './session';



export async function getAuthenticatedUser(): Promise<tokenPayload | null> {
    const token = await getAuthTokenFromCookies()
    if (!token) return null
    return verifyToken(token)
}

export async function requireAuth(): Promise<tokenPayload | NextResponse> {
    const user = await getAuthenticatedUser()

    if (!user) {
        return NextResponse.json(
            { sucesso: false, mensagem: 'Não autorizado. Faça login para continuar'},
            { status: 401 }
        )
    }

    return user
}

export function isAuthError(result: tokenPayload | NextResponse): result is NextResponse {
    return result instanceof NextResponse
}