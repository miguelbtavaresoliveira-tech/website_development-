'use server'

import * as z from 'zod'
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { DEFAULT_LOGIN_REDIRECT } from "@/app/api/auth/[...nextauth]/route"
import { error } from 'next/dist/build/output/log';

export const LoginSchema = z.object({
    cpf: z.string().min(11, { message: 'CPF exige 11 caractéres no mínimo. '}).max(11, 'CPF exige 11 caractéres no máximo.'),

    password: z.string().min(8, 'A senha deve conter no mínimo 8 caractéres').max(14, "A senha deve obter 14 caractéres no máximo")
})

export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validationFields = LoginSchema.safeParse(values)

    if (!validationFields.success) {
        return { error: 'Invalid fields provided! '};
    }

    const { cpf, password } = validationFields.data

    try {
        await signIn('credentials', {
            cpf,
            password,
            redirectTo: DEFAULT_LOGIN_REDIRECT,
        })

    } catch (error) {

        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid credentials. '}
                default:
                    return { error: 'An unexpected authentication error occurred'}
            }
        }

        throw error
    }
}