import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_super_segura";

export async function getCurrentUser(token) {
  if (!token) return null;

  try {
    // decodifica o token
    const decoded = jwt.verify(token, JWT_SECRET);

    // busca usuário no banco pelo ID do token
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
    });

    return user;
  } catch (err) {
    console.error("Erro ao validar token:", err);
    return null;
  }
}
