'use server'

import * as z from 'zod'
import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import { DEFAULT_LOGIN_REDIRECT } from "@/routes"
import { LoginSchema } from "@/schemas"



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
        // NextAuth throws a RedirectError on success. We MUST rethrow it for Next.js to handle the redirect.
        if (isRedirectError(error)) {
            throw error;
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return { error: 'Invalid credentials. '}
                default:
                    return { error: 'An unexpected authentication error occurred'}
            }
        }

        throw { error: "Algo deu errado, por favor tente denovo"}
    }
}