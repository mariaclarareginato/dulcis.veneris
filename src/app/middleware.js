// middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Se o usuário acessar a raiz "/", redireciona para "/login"
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Define em quais rotas o middleware roda
export const config = {
  matcher: ['/'], // só na raiz
};
