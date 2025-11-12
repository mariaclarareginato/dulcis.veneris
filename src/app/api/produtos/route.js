import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lojaId = parseInt(searchParams.get("lojaId"));

    if (!lojaId || isNaN(lojaId)) {
      return NextResponse.json(
        { error: "Loja não informada ou inválida" },
        { status: 400 }
      );
    }

    const produtos = await prisma.produto.findMany({
      orderBy: { nome: "asc" },
      include: {
        estoque: {
          where: { loja_id: lojaId },
          select: {
            quantidade: true,
            estoque_minimo: true,
          },
        },
      },
    });

    const produtosComEstoque = produtos.map((produto) => ({
      ...produto,
      quantidade: produto.estoque?.[0]?.quantidade ?? 0,
      estoque_minimo: produto.estoque?.[0]?.estoque_minimo ?? 0,
    }));

    return NextResponse.json(produtosComEstoque);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err);
    return NextResponse.json(
      { error: "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}
