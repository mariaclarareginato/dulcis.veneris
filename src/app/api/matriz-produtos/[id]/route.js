import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// DESATIVAR e ATIVAR PRODUTO (tirar de linha e colocar na linha)

export async function PATCH(req, { params }) {
  try {
    const id = parseInt(params.id);
    const { ativo } = await req.json();

    const produto = await prisma.produto.update({
      where: { id },
      data: { ativo },
    });

    return NextResponse.json({
      message: ativo ? "Produto ativado" : "Produto desativado",
      produto,
    });
  } catch (err) {
    console.error("Erro ao alterar produto:", err);
    return NextResponse.json(
      { error: "Erro ao alterar produto" },
      { status: 500 }
    );
  }
};
