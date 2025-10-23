// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // 1. Obtém o token do Cookie
  // O token é o que o backend salva via Set-Cookie
  const token = request.cookies.get("token"); 

  // Rotas que não precisam de login
  // Incluímos a raiz ("/") para forçar a checagem se o usuário está logado ou não.
  const rotasPublicas = ["/login", "/registro", "/"]; 

  const isPublicRoute = rotasPublicas.includes(pathname);
  
  // ----------------------------------------------------------------------
  // A. Proteção de Rota: Usuário NÃO AUTENTICADO (Sem token)
  // ----------------------------------------------------------------------
  
  // Se o usuário NÃO tem token E está tentando acessar uma rota protegida,
  // OBRIGUE o redirecionamento para /login.
  // Rotas protegidas são todas que NÃO estão em rotasPublicas.
  if (!token && !isPublicRoute) {
    console.log(`Middleware: Sem token. Redirecionando ${pathname} para /login`);
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // ----------------------------------------------------------------------
  // B. Prevenção de Loop: Usuário AUTENTICADO (Com token)
  // ----------------------------------------------------------------------
  
  // Se o usuário TEM token E está tentando acessar a página de login/registro/raiz,
  // Redirecione para a página principal (a página de Caixa é o padrão).
  // Isso EVITA o loop de redirecionamento.
  if (token && isPublicRoute) {
    // Excluímos a checagem da raiz para não cair em loop se ela for usada como rota inicial.
    // Você pode precisar de uma chamada de API no front para saber o perfil e redirecionar corretamente.
    // Aqui assumimos /caixa como o destino padrão após o login.
    if (pathname === "/login" || pathname === "/registro") {
        console.log(`Middleware: Logado. Redirecionando ${pathname} para /caixa`);
        return NextResponse.redirect(new URL("/caixa", request.url));
    }
  }

  // ----------------------------------------------------------------------
  // C. Permissão
  // ----------------------------------------------------------------------
  
  // Caso contrário, permite a navegação:
  // - Usuário logado acessando rota protegida (ex: /caixa)
  // - Usuário deslogado acessando rota pública (ex: /login)
  return NextResponse.next();
}

// 2. Configuração do Matcher: Roda em todas as rotas
// Garante que o middleware verifique TUDO exceto arquivos estáticos e rotas de API.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logos|manifest.json).*)",
  ],
};