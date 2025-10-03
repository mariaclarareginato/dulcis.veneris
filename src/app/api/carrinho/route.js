// app/api/carrinho/route.js
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioId = Number(searchParams.get("usuarioId"));
    const lojaId = Number(searchParams.get("lojaId"));

    let venda = await prisma.venda.findFirst({
      where: { usuario_id: usuarioId, loja_id: lojaId, status: "ABERTA" },
      include: { itens: { include: { produto: true } } },
    });

    if (!venda) {
      venda = await prisma.venda.create({
        data: {
          usuario_id: usuarioId,
          loja_id: lojaId,
          caixa_id: 1, // exemplo, pode ser dinâmico
          data_hora: new Date(),
          total: 0,
          status: "ABERTA",
        },
        include: { itens: { include: { produto: true } } },
      });
    }

    return new Response(JSON.stringify({ itens: venda.itens, vendaId: venda.id }), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Erro ao buscar carrinho", { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { usuarioId, lojaId, produtoId, quantidade } = await req.json();

    let venda = await prisma.venda.findFirst({
      where: { usuario_id: usuarioId, loja_id: lojaId, status: "ABERTA" },
    });

    if (!venda) throw new Error("Venda não encontrada");

    let item = await prisma.vendaItem.findFirst({
      where: { venda_id: venda.id, produto_id: produtoId },
    });

    const produto = await prisma.produto.findUnique({ where: { id: produtoId } });
    if (!produto) throw new Error("Produto não encontrado");

    if (item) {
      item = await prisma.vendaItem.update({
        where: { id: item.id },
        data: {
          quantidade: item.quantidade + quantidade,
          subtotal: (item.quantidade + quantidade) * produto.preco_venda,
        },
      });
    } else {
      item = await prisma.vendaItem.create({
        data: {
          venda_id: venda.id,
          produto_id: produtoId,
          quantidade,
          preco_unitario: produto.preco_venda,
          subtotal: quantidade * produto.preco_venda,
        },
      });
    }

    const itens = await prisma.vendaItem.findMany({ where: { venda_id: venda.id } });
    const total = itens.reduce((acc, i) => acc + i.subtotal, 0);

    await prisma.venda.update({ where: { id: venda.id }, data: { total } });

    return new Response(JSON.stringify(item), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Erro ao adicionar ao carrinho", { status: 500 });
  }
}
