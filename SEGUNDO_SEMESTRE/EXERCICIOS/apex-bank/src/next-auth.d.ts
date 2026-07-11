// Module argumentaion

import NextAuth, { type DefaultSession } from 'next-auth'

export type UserRole = 'STANDARD_CLIENT' | 'PREMIUM_CLIENT' | 'ADMIN'

declare module 'next-auth' {

    interface Session {
        user: {
            id: string;
            role: UserRole;
        } & DefaultSession['user']
    }

    interface User {
        role: UserRole
    }
}
