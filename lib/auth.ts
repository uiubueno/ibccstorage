// lib/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config"; // ✨ Importa a versão leve

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig, // ✨ Puxa as configurações do arquivo leve
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({
          where: { email, ativo: true },
        });

        if (!user || !user.password) return null;

        const senhaValida = await bcrypt.compare(password, user.password);
        if (!senhaValida) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks, // ✨ Mantém os callbacks do leve
    async session({ session, token }) {
      // ✨ Sobrescrevemos a sessão para incluir a foto (pescado no banco)
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { image: true },
          });
          session.user.image = dbUser?.image || null;
        } catch {
          session.user.image = null;
        }
      }
      return session;
    },
  },
});
