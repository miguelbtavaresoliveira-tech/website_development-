// import NextAuth from "next-auth";
// import bcrypt from "bcryptjs";
// import CredentialsProvider from "next-auth/providers/credentials";

// import authConfig from "./auth.config";
// import { prisma } from "@/lib/prisma";

// export const { handlers, auth, signIn, signOut } = NextAuth({
//   ...authConfig,
//   session: { strategy: "jwt" },
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         cpf: { label: "CPF", type: "text" },
//         password: { label: "Senha", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.cpf || !credentials?.password) return null;

//         const user = await prisma.user.findUnique({
//           where: { cpf: String(credentials.cpf) },
//         });

//         if (!user || !user.passwordHash) return null;

//         const isPasswordValid = await bcrypt.compare(
//           String(credentials.password),
//           user.passwordHash
//         );

//         if (!isPasswordValid) return null;

//         return {
//           id: user.id,
//           name: user.name,
//           email: user.email,
//           role: user.role,
//         };
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) token.role = user.role;
//       return token;
//     },
//     async session({ session, token }) {
//       if (token.sub && session.user) session.user.id = token.sub;
//       if (token.role && session.user) session.user.role = token.role as any;
//       return session;
//     },
//   },
//   pages: { signIn: "/login" },
// });