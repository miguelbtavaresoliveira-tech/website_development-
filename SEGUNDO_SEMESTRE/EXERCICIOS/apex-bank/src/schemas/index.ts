import * as z from "zod"

export const LoginSchema = z.object({
  cpf: z.string()
    .min(11, { message: 'CPF must be at least 11 characters.' })
    .max(11, { message: 'CPF must be at most 11 characters.' }),
    
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters.' })
})

export type LoginInput = z.infer<typeof LoginSchema>