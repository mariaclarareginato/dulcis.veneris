// middleware.js
import { NextResponse } from "next/server";
import * as jose from 'jose'; // 💡 Importar jose para validação

const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta';

export async function middleware(request) { // 💡 Mude para async
    const { pathname } = request.nextUrl;
    
    const rotasPublicas = ["/login", "/registro", "/"]; 
    const isPublicRoute = rotasPublicas.includes(pathname);
    
    // Obtém o token do cookie (NextResponse.next().cookies.get("token") é mais seguro)
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
            // Token inválido ou expirado
            console.warn("Middleware: Token inválido/expirado. Tratando como não autenticado.");
            isAuthenticated = false; 
            // ⚠️ Opcional, mas boa prática: limpar o cookie inválido
            const response = NextResponse.next();
            response.cookies.delete('token');
            return response;
        }
    }

    // ----------------------------------------------------------------------
    // 1. Proteção de Rota: Usuário NÃO AUTENTICADO (Sem token ou Token inválido)
    // ----------------------------------------------------------------------
    
    if (!isAuthenticated && !isPublicRoute) {
        console.log(`Middleware: Não autenticado. Redirecionando ${pathname} para /login`);
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('callbackUrl', pathname); 
        
        return NextResponse.redirect(url);
    }
    
    // ----------------------------------------------------------------------
    // 2. Prevenção de Loop: Usuário AUTENTICADO (Com token VÁLIDO)
    // ----------------------------------------------------------------------
    
    if (isAuthenticated && (pathname === "/login" || pathname === "/registro")) {
        // 💡 Melhore o redirecionamento baseado no perfil (Autorização)
        let redirectPath = '/caixa'; // Default
        if (userPayload.perfil === "GERENTE") redirectPath = "/loja";
        else if (userPayload.perfil === "ADMIN") redirectPath = "/matriz";
        
        console.log(`Middleware: Logado. Redirecionando ${pathname} para ${redirectPath}`);
        return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    
    // ----------------------------------------------------------------------
    // 3. Autorização (Verificar se o perfil pode acessar a rota)
    // ----------------------------------------------------------------------
    
    if (isAuthenticated && userPayload) {
        const userPerfil = userPayload.perfil;
        
        if (pathname.startsWith('/loja') && (userPerfil !== 'GERENTE' && userPerfil !== 'ADMIN')) {
            console.log(`Middleware: Acesso negado. Redirecionando GERENTE/CAIXA para /caixa`);
            return NextResponse.redirect(new URL('/caixa', request.url));
        }
        if (pathname.startsWith('/matriz') && userPerfil !== 'ADMIN') {
            console.log(`Middleware: Acesso negado. Redirecionando para /loja ou /caixa`);
            const fallbackPath = (userPerfil === 'GERENTE') ? '/loja' : '/caixa';
            return NextResponse.redirect(new URL(fallbackPath, request.url));
        }
        // Para /caixa, todos (CAIXA, GERENTE, ADMIN) geralmente têm acesso.
    }
    
    // ----------------------------------------------------------------------
    // 4. Permissão
    // ----------------------------------------------------------------------
    
    return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logos|manifest.json).*)",
  ],
};