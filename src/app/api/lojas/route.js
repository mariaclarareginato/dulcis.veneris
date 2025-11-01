import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const lojas = await prisma.loja.findMany({
      select: {
        id: true,
        nome: true,
        cidade: true,
        estado: true,
      },
    });

    return NextResponse.json(lojas, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar lojas:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
