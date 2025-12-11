import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ sucesso: true, usuarios });
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { sucesso: false, erro: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}
