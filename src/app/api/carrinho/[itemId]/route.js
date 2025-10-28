// app/api/carrinho/[itemId]/route.js

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 🔄 PUT: Alterar quantidade do item
export async function PUT(req, { params }) {
  const itemId = parseInt(params.itemId);
  const { quantidade } = await req.json();

  if (isNaN(itemId) || !quantidade || quantidade < 1) {
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
        venda: {
          select: { loja_id: true }
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }
    
    // 2. Verifica Estoque
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
            { error: `Estoque insuficiente. Disponível: ${estoqueDisponivel}` },
            { status: 400 }
        );
    }
    
    // 3. Atualiza o Item
    const subtotal = quantidade * item.preco_unitario;
    const itemAtualizado = await prisma.vendaItem.update({
      where: { id: itemId },
      data: {
        quantidade: quantidade,
        subtotal: subtotal,
      },
    });

    // 4. Atualiza o Total da Venda
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
    // ⚠️ Proteção: Garante que SEMPRE retorna um JSON válido em caso de erro.
    return NextResponse.json(
      { error: "Erro interno ao atualizar quantidade", details: err.message },
      { status: 500 }
    );
  }
}

// ❌ DELETE: Remover item do carrinho
export async function DELETE(req, { params }) {
  const itemId = parseInt(params.itemId);

  if (isNaN(itemId)) {
    return NextResponse.json(
      { error: "ID do item é obrigatório e deve ser um número válido" },
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

    // 4. Se a venda ficar vazia, deleta a venda (limpeza)
    if (vendaAtualizada.vendaitem.length === 0) {
        await prisma.venda.delete({ where: { id: vendaAtualizada.id } });
    }

    return NextResponse.json({ success: true, vendaTotal: novoTotal._sum.subtotal ?? 0 });

  } catch (err) {
    console.error("Erro ao remover item:", err);
    // ⚠️ Proteção: Garante que SEMPRE retorna um JSON válido em caso de erro.
    return NextResponse.json(
      { error: "Erro interno ao remover item", details: err.message },
      { status: 500 }
    );
  }
}