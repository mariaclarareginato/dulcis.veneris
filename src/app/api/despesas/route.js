import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";


/* ----------------------------------------
   📌 1 — LISTAR DESPESAS (GET)
---------------------------------------- */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lojaId = Number(searchParams.get("lojaId"));

    if (!lojaId) {
      return NextResponse.json(
        { error: "lojaId é obrigatório" },
        { status: 400 }
      );
    }

    const despesas = await prisma.despesa.findMany({
      where: { loja_id: lojaId },
      orderBy: { data_vencimento: "asc" },
    });

    return NextResponse.json(despesas);
  } catch (error) {
    console.error("Erro ao listar despesas:", error);
    return NextResponse.json(
      { error: "Erro ao buscar despesas" },
      { status: 500 }
    );
  }
}

/* ----------------------------------------
   📌 2 — CRIAR DESPESA (POST)
---------------------------------------- */
export async function POST(req) {
  try {
    const { lojaId, descricao, valor, data_vencimento, tipo} = await req.json();

    if (!lojaId || !descricao || !valor || !data_vencimento || !tipo) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      );
    }

    const novaDespesa = await prisma.despesa.create({
  data: {
    descricao,
    valor: new Prisma.Decimal(valor),
    data_vencimento: new Date(data_vencimento),
    tipo, 
    pago: false,
    loja: {
      connect: { id: lojaId }
    }
  }
});


    return NextResponse.json(novaDespesa);
  } catch (error) {
    console.error("Erro ao criar despesa:", error);
    return NextResponse.json(
      { error: "Erro ao criar despesa" },
      { status: 500 }
    );
  }
}

/* ----------------------------------------
   📌 3 — EDITAR DESPESA (PUT)
---------------------------------------- */
export async function PUT(req) {
  try {
    const { id, descricao, valor, data_vencimento, pago } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID da despesa é obrigatório" },
        { status: 400 }
      );
    }

    const despesaAtualizada = await prisma.despesa.update({
      where: { id },
      data: {
        descricao,
        valor: Number(valor),
        data_vencimento: new Date(data_vencimento),
        pago,
        data_pagamento: pago ? new Date() : null,
      },
    });

    return NextResponse.json(despesaAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar despesa:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar despesa" },
      { status: 500 }
    );
  }
}

/* ----------------------------------------
   📌 4 — EXCLUIR DESPESA (DELETE)
---------------------------------------- */
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório para excluir" },
        { status: 400 }
      );
    }

    await prisma.despesa.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Despesa removida com sucesso" });
  } catch (error) {
    console.error("Erro ao excluir despesa:", error);
    return NextResponse.json(
      { error: "Erro ao excluir despesa" },
      { status: 500 }
    );
  }
}
