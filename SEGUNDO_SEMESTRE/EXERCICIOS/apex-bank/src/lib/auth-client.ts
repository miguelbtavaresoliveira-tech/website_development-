import { createAuthClient } from "better-auth/client";


export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_URL || "http://localhost:300"
})