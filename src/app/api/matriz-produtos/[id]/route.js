import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// DESATIVAR PRODUTO (tirar de linha)

export async function PATCH(req, { params }) {
  try {
    const id = parseInt(params.id);

    const produto = await prisma.produto.update({
      where: { id },
      data: { ativo: false },
    });

    return NextResponse.json({
      message: "Produto retirado de linha",
      produto,
    });
  } catch (err) {
    console.error("Erro ao alterar produto:", err);
    return NextResponse.json(
      { error: "Erro ao alterar produto" },
      { status: 500 }
    );
  }
}
