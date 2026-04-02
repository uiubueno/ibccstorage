import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isLoginPage = nextUrl.pathname === "/login";
  const isAdminRoute =
    nextUrl.pathname.startsWith("/usuarios") ||
    nextUrl.pathname.startsWith("/relatorios") ||
    nextUrl.pathname.startsWith("/dashboard");

  // Não logado → redireciona para login
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Já logado tentando acessar login → redireciona para dashboard
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Vendedor tentando acessar rota de admin → 403
  if (isAdminRoute && session?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/estoque", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};