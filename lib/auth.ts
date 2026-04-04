import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email, ativo: true },
        });

        if (!user) return null;

        const senhaValida = await bcrypt.compare(password, user.password);
        if (!senhaValida) return null;

        // ✨ NÃO RETORNAMOS A IMAGEM AQUI! (Isso evita inchar o cookie de login)
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        // Removi o token.image daqui para o navegador não infartar
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;

        // ✨ O PULO DO GATO: Busca a foto direto do banco só na hora de montar a sessão na tela
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { image: true },
          });
          session.user.image = dbUser?.image || null;
        } catch (error) {
          session.user.image = null;
        }
      }
      return session;
    },
  },
});
