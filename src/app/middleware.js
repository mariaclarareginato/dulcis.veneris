
import { NextResponse } from "next/server";
import * as jose from 'jose'; 

//  MESMA Chave usada para assinar o JWT no seu backend
const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta';

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    
    // Rotas estritamente públicas (não exigem login)
   
    const rotasPublicas = ["/login", "/"]; 
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

            // Se o token for inválido/expirado, não permitido o acesso à página atual.
            console.warn("Middleware: Token inválido/expirado. Redirecionando para / e limpando cookie.");
            isAuthenticated = false;

            const url = request.nextUrl.clone();
            url.pathname = '/'; //  Destino de segurança é a raiz
            
            // Cria a resposta de redirecionamento
            const response = NextResponse.redirect(url);
            
            // Limpa o cookie inválido para evitar o mesmo erro no próximo acesso
            response.cookies.delete('token'); 
            
            return response; // ⬅ RETORNA O REDIRECIONAMENTO IMEDIATO
        }
    }

    // ----------------------------------------------------------------------
    // 1. Proteção de Rota (para Tokens Ausentes)
    // ----------------------------------------------------------------------
    
    // Se não estiver autenticado E estiver em uma rota PROTEGIDA (como /caixa)
    if (!isAuthenticated && !isPublicRoute) {
        console.log(`Middleware: Token ausente. Redirecionando ${pathname} para /`);
        
        //  MUDANÇA DE DESTINO: Redireciona para a raiz "/"
        const url = request.nextUrl.clone();
        url.pathname = '/';
        
        return NextResponse.redirect(url);
    }
    
    // ----------------------------------------------------------------------
    // 2. Prevenção de Loop: Usuário AUTENTICADO
    // ----------------------------------------------------------------------
    
    // Se estiver logado e tentar acessar /login ou a raiz (se ela não for o destino)
    if (isAuthenticated && (pathname === "/login")) {
        
        //  Redireciona para a página principal do perfil
        let redirectPath = '/caixa'; 
        if (userPayload?.perfil === "GERENTE") redirectPath = "/loja";
        else if (userPayload?.perfil === "ADMIN") redirectPath = "/matriz";
        
        console.log(`Middleware: Logado. Redirecionando ${pathname} para ${redirectPath}`);
        return NextResponse.redirect(new URL(redirectPath, request.url));
    }
    
    // ----------------------------------------------------------------------
    // 3. Autorização (Verificar se o perfil pode acessar a rota)
    // ----------------------------------------------------------------------
    
    // O código de autorização aqui está correto e não foi alterado.
    if (isAuthenticated && userPayload) {
        const userPerfil = userPayload.perfil;
        
        if (pathname.startsWith('/loja') && (userPerfil !== 'GERENTE' && userPerfil !== 'ADMIN')) {
            console.log(`Middleware: Acesso negado. Redirecionando para /caixa`);
            return NextResponse.redirect(new URL('/caixa', request.url));
        }
        if (pathname.startsWith('/matriz') && userPerfil !== 'ADMIN') {
            console.log(`Middleware: Acesso negado. Redirecionando para fallback`);
            const fallbackPath = (userPerfil === 'GERENTE') ? '/loja' : '/caixa';
            return NextResponse.redirect(new URL(fallbackPath, request.url));
        }
    }
    
    return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
