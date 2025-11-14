import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      orderBy: { data_vencimento: "asc" }
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

export async function PUT(req) {
  try {
    const { id, pago } = await req.json();

    const despesaAtualizada = await prisma.despesa.update({
      where: { id },
      data: {
        pago: pago, // agora respeita o valor vindo do frontend
        data_pagamento: pago ? new Date() : null, // se marcar pendente, zera o pagamento
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
