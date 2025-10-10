// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Rotas públicas que não precisam de login
  const rotasPublicas = ["/login", "/registro"];

  // Se o usuário acessar a raiz "/", redireciona para "/login"
  if (
    pathname === "/" ||
    (!rotasPublicas.includes(pathname) && !request.cookies.get("token"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Define em quais rotas o middleware roda
export const config = {
  matcher: ["/", "/((?!_next/static|_next/image|favicon.ico).*)"], // roda em todas as rotas, exceto assets
};
