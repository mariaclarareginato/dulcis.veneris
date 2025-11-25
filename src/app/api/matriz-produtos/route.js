import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

//----------------
// GET - Lista produtos

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

//----------------------
// POST - Criar produto

export async function POST(req) {
  try {
    const form = await req.json(); // JSON

    // PEGANDO DO JSON
    const sku = form.sku;
    const nome = form.nome;
    const codigo = form.codigo;
    const categoria = form.categoria;
    const descricao = form.descricao;
    const preco_venda = Number(form.preco_venda);
    const custo = Number(form.custo);


    const img = form.img || null;

    const novo = await prisma.produto.create({
      data: {
        sku,
        nome,
        codigo,
        categoria,
        descricao,
        preco_venda,
        custo,
        img,
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
