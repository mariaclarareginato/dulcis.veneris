// app/api/carrinho/[itemId]/route.js

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 🔄 Alterar quantidade do item
export async function PUT(req, { params }) {
  const itemId = parseInt(params.itemId);
  const { quantidade } = await req.json();

  if (!itemId || !quantidade || quantidade < 1) {
    return NextResponse.json(
      { error: "ID do item ou quantidade inválidos" },
      { status: 400 }
    );
  }

  try {
    // 1. Busca o Item e dados relacionados
    const item = await prisma.vendaItem.findUnique({
      where: { id: itemId },
      include: {
        venda: true,
        produto: {
          include: {
            estoque: {
              where: { loja_id: prisma.venda.loja_id }, // Assume que loja_id está disponível
              select: { quantidade: true },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }
    
    // É necessário ter o loja_id para verificar o estoque
    const lojaId = item.venda.loja_id; 

    const estoqueProduto = await prisma.produto.findUnique({
        where: { id: item.produto_id },
        include: {
            estoque: {
                where: { loja_id: lojaId },
                select: { quantidade: true },
            },
        },
    });

    const estoqueDisponivel = estoqueProduto.estoque[0]?.quantidade ?? 0;
    
    if (estoqueDisponivel < quantidade) {
        return NextResponse.json(
            { error: `Estoque insuficiente para ${quantidade} unidades. Disponível: ${estoqueDisponivel}` },
            { status: 400 }
        );
    }
    
    // 2. Atualiza o Item
    const subtotal = quantidade * item.preco_unitario;
    const itemAtualizado = await prisma.vendaItem.update({
      where: { id: itemId },
      data: {
        quantidade: quantidade,
        subtotal: subtotal,
      },
    });

    // 3. Atualiza o Total da Venda
    const novoTotal = await prisma.vendaItem.aggregate({
      _sum: {
        subtotal: true,
      },
      where: {
        venda_id: item.venda_id,
      },
    });

    await prisma.venda.update({
      where: { id: item.venda_id },
      data: {
        total: novoTotal._sum.subtotal ?? 0,
      },
    });

    return NextResponse.json({ success: true, item: itemAtualizado });
  } catch (err) {
    console.error("Erro ao atualizar quantidade:", err);
    return NextResponse.json(
      { error: "Erro interno ao atualizar quantidade" },
      { status: 500 }
    );
  }
}

// ❌ Remover item do carrinho
export async function DELETE(req, { params }) {
  const itemId = parseInt(params.itemId);

  if (!itemId) {
    return NextResponse.json(
      { error: "ID do item é obrigatório" },
      { status: 400 }
    );
  }

  try {
    // 1. Busca o item para obter o venda_id
    const item = await prisma.vendaItem.findUnique({
      where: { id: itemId },
      select: { venda_id: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }

    // 2. Deleta o item
    await prisma.vendaItem.delete({
      where: { id: itemId },
    });

    // 3. Atualiza o Total da Venda
    const novoTotal = await prisma.vendaItem.aggregate({
      _sum: {
        subtotal: true,
      },
      where: {
        venda_id: item.venda_id,
      },
    });

    const vendaAtualizada = await prisma.venda.update({
      where: { id: item.venda_id },
      data: {
        total: novoTotal._sum.subtotal ?? 0,
      },
      include: {
        vendaitem: true,
      },
    });

    // Opcional: Se a venda ficar vazia, você pode deletá-la ou mantê-la aberta
    if (vendaAtualizada.vendaitem.length === 0) {
        // Exemplo: Se não tiver mais itens, deleta a venda "vazia"
        await prisma.venda.delete({ where: { id: vendaAtualizada.id } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erro ao remover item:", err);
    return NextResponse.json(
      { error: "Erro interno ao remover item" },
      { status: 500 }
    );
  }
}