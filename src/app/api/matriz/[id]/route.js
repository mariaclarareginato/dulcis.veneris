import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET – Buscar filial específica
export async function GET(req, { params }) {
  try {
    const { id } = params;

    const filial = await prisma.loja.findUnique({
      where: { id: Number(id) },
    });

    if (!filial) {
      return NextResponse.json(
        { error: "Filial não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(filial);
  } catch (error) {
    console.error("Erro ao buscar filial:", error);
    return NextResponse.json(
      { error: "Erro ao buscar filial" },
      { status: 500 }
    );
  }
}

// PUT – Atualizar filial
export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    const { nome, endereco, cidade, estado, ativo } = body;

    const filialAtualizada = await prisma.loja.update({
      where: { id: Number(id) },
      data: {
        nome,
        endereco,
        cidade,
        estado,
        ativo,
        tipo: "FILIAL", // evita transformação para matriz
      },
    });

    return NextResponse.json(filialAtualizada);
  } catch (error) {
    console.error("Erro ao atualizar filial:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar filial" },
      { status: 500 }
    );
  }
}

// DELETE – Deletar filial
export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    await prisma.loja.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar filial:", error);
    return NextResponse.json(
      { error: "Erro ao deletar filial" },
      { status: 500 }
    );
  }
}
