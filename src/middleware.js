// Para fazer restrição de páginas

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dulcis");

export async function middleware(req) {
  const url = req.nextUrl.pathname;

  // Rotas públicas
  const publicRoutes = ["/login", "/favicon.ico"];
  if (publicRoutes.includes(url)) return NextResponse.next();

  const rawToken = req.cookies.get("token")?.value;
  if (!rawToken) return NextResponse.redirect(new URL("/login", req.url));

  let payload;
  try {
    const { payload: data } = await jwtVerify(rawToken, JWT_SECRET);
    payload = data;
  } catch (err) {
    console.log("token inválido ou expirado");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Permissões
  const tipo = payload.perfil;
  const permissao = {
    CAIXA: ["/caixa", "/carrinho", "/pagamento"],
    GERENTE: ["/caixas.usuarios", "/registro", "/despesas.lucro", "/pedidos"],
    ADMIN: ["/registro", "/filiais", "/novoproduto", "/produtos", "/matrizPedidos"],
  };

  const pode = permissao[tipo]?.some(r => url === r || url.startsWith(r + "/"));
  if (!pode) return NextResponse.redirect(new URL("/404", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/caixa/:path*",
    "/carrinho/:path*",
    "/pagamento/:path*",
    "/caixas.usuarios/:path*",
    "/registro/:path*",
    "/despesas.lucro/:path*",
    "/pedidos/:path*",
    "/filiais/:path*",
    "/novoproduto/:path*",
    "/produtos/:path*",
    "/matrizPedidos/:path*",
  ],
};
