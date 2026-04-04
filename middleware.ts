import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config"; // ✨ IMPORTA O LEVE (Crie este arquivo primeiro!)
import { NextResponse } from "next/server";

// Inicializa o auth apenas com as regras, sem o peso do Prisma/Bcrypt
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isLoginPage = nextUrl.pathname === "/login";

  // Rotas que exigem poder total
  const isAdminRoute =
    nextUrl.pathname.startsWith("/usuarios") ||
    nextUrl.pathname.startsWith("/relatorios") ||
    nextUrl.pathname.startsWith("/dashboard");

  // 1. Não logado → redireciona para login
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. Já logado tentando acessar login → redireciona para dashboard
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // 3. TRAVA DE ACESSO ATUALIZADA:
  // Agora permitimos ADMIN e DESENVOLVEDOR nas rotas restritas.
  if (
    isAdminRoute &&
    session?.user?.role !== "ADMIN" &&
    session?.user?.role !== "DESENVOLVEDOR"
  ) {
    return NextResponse.redirect(new URL("/estoque", req.url));
  }

  return NextResponse.next();
});

export const config = {
  // O Matcher garante que o middleware não tente rodar em imagens e arquivos estáticos
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
