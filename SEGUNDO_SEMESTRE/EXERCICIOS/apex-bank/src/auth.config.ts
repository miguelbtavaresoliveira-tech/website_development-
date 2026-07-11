import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export default {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                cpf: { label: 'CPF', type: 'text'},password: {label: 'Senha', type: 'password'}
            },

            async authorize(credentials) {
                if (!credentials?.cpf || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: { cpf: String(credentials.cpf) }
                })

                if (!user || !user.passwordHash) return null

                const isPasswordvalid = await bcrypt.compare(
                    String(credentials.password),
                    user.passwordHash
                )

                if (!isPasswordvalid) return null

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }
            }
        })
    ]
} satisfies NextAuthConfig