import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export function withAuth(handler, allowedRoles = []) {
  return async (req) => {
    // 🛑 CORREÇÃO PRINCIPAL: Ler o token do Cookie
    const token = req.cookies.get("token")?.value;

    // Comentado: Código original que leria do Header, agora é secundário ou removido.
    // const authHeader = req.headers.get("authorization");
    // if (!token && authHeader?.startsWith("Bearer ")) {
    //   token = authHeader.split(" ")[1];
    // }
    
    if (!token) {
      // Se não houver token no cookie, não está autorizado.
      return NextResponse.json({ message: "Não autorizado. Token ausente no Cookie." }, { status: 401 });
    }

    // 💡 Nota: Assumindo que `verifyToken` decodifica e verifica a expiração.
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: "Token inválido ou expirado" },
        { status: 401 }
      );
    }

    // Verificação de Perfil (Role Authorization)
    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(decoded.perfil.toUpperCase())
    ) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    // ✅ Adiciona o payload decodificado na request para o handler
    req.user = decoded;
    return handler(req);
  };
}