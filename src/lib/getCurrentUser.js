import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "chave_secreta_super_segura";

export async function getCurrentUser(token) {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id },
    });
    return user;
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    return null;
  }
}
