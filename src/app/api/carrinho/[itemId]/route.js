import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

//
// 🔄 PUT: Alterar quantidade do item
//
export async function PUT(req) {
  try {
    // Pega o itemId direto da URL
    const itemId = parseInt(req.url.split("/").pop());
    const { quantidade } = await req.json();

    if (isNaN(itemId) || !quantidade || quantidade < 1) {
      return NextResponse.json(
        { error: "ID do item ou quantidade inválidos" },
        { status: 400 }
      );
    }

    // Busca o item
    const item = await prisma.vendaitem.findUnique({
      where: { id: itemId },
      include: { venda: { select: { loja_id: true } } },
    });

    if (!item) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }

    // Verifica estoque
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

    // Atualiza item
    const subtotal = quantidade * item.preco_unitario;
    const itemAtualizado = await prisma.vendaitem.update({
      where: { id: itemId },
      data: { quantidade, subtotal },
    });

    // Atualiza total da venda
    const novoTotal = await prisma.vendaitem.aggregate({
      _sum: { subtotal: true },
      where: { venda_id: item.venda_id },
    });

    await prisma.venda.update({
      where: { id: item.venda_id },
      data: { total: novoTotal._sum.subtotal ?? 0 },
    });

    return NextResponse.json({ success: true, item: itemAtualizado });
  } catch (err) {
    console.error("Erro ao atualizar quantidade:", err);
    return NextResponse.json(
      { error: "Erro interno ao atualizar quantidade", details: err.message },
      { status: 500 }
    );
  }
}

//
// ❌ DELETE: Remover item do carrinho
//
export async function DELETE(req) {
  try {
    const itemId = parseInt(req.url.split("/").pop());

    if (isNaN(itemId)) {
      return NextResponse.json(
        { error: "ID do item é obrigatório e deve ser um número válido" },
        { status: 400 }
      );
    }

    // Busca item
    const item = await prisma.vendaitem.findUnique({
      where: { id: itemId },
      select: { venda_id: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });
    }

    // Deleta item
    await prisma.vendaitem.delete({ where: { id: itemId } });

    // Atualiza total da venda
    const novoTotal = await prisma.vendaitem.aggregate({
      _sum: { subtotal: true },
      where: { venda_id: item.venda_id },
    });

    const vendaAtualizada = await prisma.venda.update({
      where: { id: item.venda_id },
      data: { total: novoTotal._sum.subtotal ?? 0 },
      include: { vendaitem: true },
    });

    // Se a venda ficar vazia, deleta a venda
    if (vendaAtualizada.vendaitem.length === 0) {
      await prisma.venda.delete({ where: { id: vendaAtualizada.id } });
    }

    return NextResponse.json({ success: true, vendaTotal: novoTotal._sum.subtotal ?? 0 });
  } catch (err) {
    console.error("Erro ao remover item:", err);
    return NextResponse.json(
      { error: "Erro interno ao remover item", details: err.message },
      { status: 500 }
    );
  }
}
