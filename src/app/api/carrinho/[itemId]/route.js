import { prisma } from "@/lib/prisma";

export async function PUT(req, { params }) {
  const itemId = Number(params.itemId);
  const body = await req.json();
  const { quantidade } = body;

  if (quantidade < 1) return new Response(JSON.stringify({ error: "Quantidade inválida" }), { status: 400 });

  const item = await prisma.vendaItem.update({
    where: { id: itemId },
    data: { quantidade, subtotal: undefined }, // subtotal será recalculado
    include: { venda: true, produto: true },
  });

  // Atualiza total da venda
  const itens = await prisma.vendaItem.findMany({ where: { venda_id: item.venda_id } });
  const total = itens.reduce((acc, i) => acc + i.quantidade * i.preco_unitario, 0);
  await prisma.venda.update({ where: { id: item.venda_id }, data: { total } });

  return new Response(JSON.stringify(item), { status: 200 });
}

export async function DELETE(req, { params }) {
  const itemId = Number(params.itemId);

  const item = await prisma.vendaItem.delete({ where: { id: itemId }, include: { venda: true } });

  // Atualiza total da venda
  const itens = await prisma.vendaItem.findMany({ where: { venda_id: item.venda_id } });
  const total = itens.reduce((acc, i) => acc + i.subtotal, 0);
  await prisma.venda.update({ where: { id: item.venda_id }, data: { total } });

  return new Response(JSON.stringify({ message: "Item removido" }), { status: 200 });
}
