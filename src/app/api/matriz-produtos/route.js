import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// LISTAR TODOS OS PRODUTOS (ativos ou não)

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: { nome: "asc" },
    });

    return NextResponse.json(produtos);
  } catch (err) {
    console.error("Erro ao listar produtos:", err);
    return NextResponse.json(
      { error: "Erro ao listar produtos" },
      { status: 500 }
    );
  }
}

// Criar novo produto

export async function POST(req) {
  try {
    const dados = await req.json();

    const novo = await prisma.produto.create({
      data: {
        sku: dados.sku,
        codigo: dados.codigo,
        nome: dados.nome,
        descricao: dados.descricao,
        img: dados.img,
        preco_venda: dados.preco_venda,
        custo: dados.custo,
        categoria: dados.categoria,
        ativo: true,
      },
    });

    return NextResponse.json(novo);
  } catch (err) {
    console.error("Erro ao criar produto:", err);
    return NextResponse.json(
      { error: "Erro ao criar produto" },
      { status: 500 }
    );
  }
}
