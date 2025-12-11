import { NextResponse } from "next/server";
import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "dulcis";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const rotasPublicas = ["/", "/login"];
  const isPublicRoute = rotasPublicas.includes(pathname);

  const token = request.cookies.get("token")?.value;

  let isAuthenticated = false;
  let userPayload = null;

  if (token) {
    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      isAuthenticated = true;
      userPayload = payload;
    } catch (error) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      const response = NextResponse.redirect(url);
      response.cookies.delete("token");
      return response;
    }
  }

  if (!isAuthenticated && !isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isAuthenticated && pathname === "/login") {
    const redirectPath =
      userPayload?.perfil === "GERENTE"
        ? "/registro"
        : userPayload?.perfil === "ADMIN"
        ? "/matriz"
        : "/caixa";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  if (isAuthenticated && userPayload) {
    const perfil = userPayload.perfil;

    // Rotas Gerência
    const gerenciaRoutes = ["/registro", "/caixas", "/despesa.lucro", "/pedidos"];
    if (gerenciaRoutes.includes(pathname) && perfil !== "GERENTE" || perfil === "ADMIN" ) {
      return NextResponse.redirect(new URL("/caixa", "/matriz", request.url));
    }

    // Rotas Caixa
    const caixaRoutes = ["/carrinho", "/caixa", "/pagamento"];
    if (caixaRoutes.includes(pathname) && perfil !== "CAIXA") {
      return NextResponse.redirect(new URL("/caixa", request.url));
    }

    // Rotas Matriz/Admin
    const matrizRoutes = ["/matriz/matrizRegistro", "/filiais", "/matrizPedidos", "/produtos"];
    if (matrizRoutes.includes(pathname) && perfil !== "ADMIN") {
      return NextResponse.redirect(new URL("/matriz", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
