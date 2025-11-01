import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "chave-secreta";

export function withAuth(handler, allowedRoles = []) {
  return async (req) => {
    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Token ausente" }, { status: 401 });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.perfil)) {
        return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
      }

      req.user = decoded; // passa o usuário pro handler
      return handler(req);
    } catch (err) {
      return NextResponse.json({ message: "Token inválido ou expirado" }, { status: 401 });
    }
  };
}
