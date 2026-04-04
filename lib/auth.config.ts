// auth.config.ts
import { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/"); // Protege tudo, ajuste se necessário
      const isOnLogin = nextUrl.pathname.startsWith("/login");

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redireciona para login
      } else if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [
    Credentials({}), // Fica vazio aqui, a lógica pesada vai pro outro arquivo
  ],
} satisfies NextAuthConfig;
