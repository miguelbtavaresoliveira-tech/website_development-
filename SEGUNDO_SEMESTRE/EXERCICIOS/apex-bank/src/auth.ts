import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    ...authConfig,
    session: { strategy: 'jwt' },
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.role = user.role
            return token
        },
        async session({ session, token }) {
            if (token.sub && session.user) session.user.id = token.sub
            if (token.role && session.user) session.user.role = token.role as string
            return session
        }
    },
    pages: { signIn: "/login"}
})