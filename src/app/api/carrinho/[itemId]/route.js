// src/app/api/carrinho/[itemId]/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const itemId = parseInt(params.itemId);
    const body = await req.json();
    const { quantidade } = body;

    if (!quantidade || quantidade < 1) {
      return NextResponse.json(
        { error: "Quantidade inválida" },
        { status: 400 }
      );
    }

    // Busca o item
    const item = await prisma.vendaitem.findUnique({
      where: { id: itemId },
      include: {
        venda: true,
        produto: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Item não encontrado" },
        { status: 404 }
      );
    }

    // VALIDAÇÃO: Verifica estoque disponível na loja
    const estoque = await prisma.estoque.findFirst({
      where: {
        produto_id: item.produto_id,
        loja_id: item.venda.loja_id,
      },
    });

    if (!estoque) {
      return NextResponse.json(
        { error: "Produto não disponível nesta loja" },
        { status: 404 }
      );
    }

    if (estoque.quantidade < quantidade) {
      return NextResponse.json(
        {
          error: "Estoque insuficiente",
          message: `Apenas ${estoque.quantidade} unidades disponíveis`,
          estoqueDisponivel: estoque.quantidade,
        },
        { status: 400 }
      );
    }

    // Atualiza quantidade
    const itemAtualizado = await prisma.vendaitem.update({
      where: { id: itemId },
      data: {
        quantidade,
        subtotal: quantidade * item.preco_unitario,
      },
    });

    // Recalcula total da venda
    const todosItens = await prisma.vendaitem.findMany({
      where: { venda_id: item.venda_id },
    });
    const total = todosItens.reduce((acc, i) => acc + i.subtotal, 0);

    await prisma.venda.update({
      where: { id: item.venda_id },
      data: { total },
    });

    return NextResponse.json({
      success: true,
      item: itemAtualizado,
    });
  } catch (err) {
    console.error("Erro ao atualizar item:", err);
    return NextResponse.json(
      { error: "Erro ao atualizar item" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const itemId = parseInt(params.itemId);

    const item = await prisma.vendaitem.delete({
      where: { id: itemId },
      include: { venda: true },
    });

    // Recalcula total da venda
    const todosItens = await prisma.vendaitem.findMany({
      where: { venda_id: item.venda_id },
    });
    const total = todosItens.reduce((acc, i) => acc + i.subtotal, 0);

    await prisma.venda.update({
      where: { id: item.venda_id },
      data: { total },
    });

    return NextResponse.json({
      success: true,
      message: "Item removido do carrinho",
    });
  } catch (err) {
    console.error("Erro ao remover item:", err);
    return NextResponse.json(
      { error: "Erro ao remover item" },
      { status: 500 }
    );
  }
}
