import { verifyToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export function withAuth(handler, allowedRoles = []) {
  return async (req) => {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { message: "Token inválido ou expirado" },
        { status: 401 }
      );
    }

    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(decoded.perfil.toUpperCase())
    ) {
      return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
    }

    // adiciona o user decodificado na request
    req.user = decoded;
    return handler(req);
  };
}
