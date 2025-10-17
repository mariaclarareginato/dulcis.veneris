// src/app/api/carrinho/route.js
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioId = parseInt(searchParams.get("usuarioId"));
    const lojaId = parseInt(searchParams.get("lojaId"));

    if (!usuarioId || !lojaId) {
      return NextResponse.json(
        { error: "Usuario e Loja são obrigatórios" },
        { status: 400 }
      );
    }

    // Busca venda aberta ou cria uma nova
    let venda = await prisma.venda.findFirst({
      where: {
        usuario_id: usuarioId,
        loja_id: lojaId,
        status: "ABERTA",
      },
      include: {
        vendaitem: {
          include: {
            produto: {
              include: {
                estoque: {
                  where: { loja_id: lojaId },
                  select: { quantidade: true },
                },
              },
            },
          },
        },
      },
    });

    if (!venda) {
      // Cria uma venda aberta (requer caixa aberto)
      const caixaAberto = await prisma.caixa.findFirst({
        where: { loja_id: lojaId, status: "ABERTO" },
      });

      if (!caixaAberto) {
        return NextResponse.json(
          { error: "Não há caixa aberto nesta loja" },
          { status: 400 }
        );
      }

      venda = await prisma.venda.create({
        data: {
          usuario_id: usuarioId,
          loja_id: lojaId,
          caixa_id: caixaAberto.id,
          data_hora: new Date(),
          total: 0,
          status: "ABERTA",
        },
        include: {
          vendaitem: {
            include: {
              produto: {
                include: {
                  estoque: {
                    where: { loja_id: lojaId },
                    select: { quantidade: true },
                  },
                },
              },
            },
          },
        },
      });
    }

    // Formata itens com informação de estoque
    const itens = venda.vendaitem.map((item) => ({
      ...item,
      estoque_disponivel: item.produto.estoque[0]?.quantidade ?? 0,
    }));

    return NextResponse.json({
      itens,
      vendaId: venda.id,
      total: venda.total,
    });
  } catch (err) {
    console.error("Erro ao buscar carrinho:", err);
    return NextResponse.json(
      { error: "Erro ao buscar carrinho" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { usuarioId, lojaId, produtoId, quantidade } = body;

    if (!usuarioId || !lojaId || !produtoId || !quantidade) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    // Busca venda aberta
    let venda = await prisma.venda.findFirst({
      where: {
        usuario_id: usuarioId,
        loja_id: lojaId,
        status: "ABERTA",
      },
    });

    if (!venda) {
      return NextResponse.json(
        { error: "Nenhum carrinho aberto. Acesse GET primeiro." },
        { status: 400 }
      );
    }

    // VALIDAÇÃO CRÍTICA: Verifica estoque disponível
    const estoque = await prisma.estoque.findFirst({
      where: {
        produto_id: produtoId,
        loja_id: lojaId,
      },
      include: {
        produto: true,
      },
    });

    if (!estoque) {
      return NextResponse.json(
        { error: "Produto não disponível nesta loja" },
        { status: 404 }
      );
    }

    // Verifica quantidade já no carrinho
    const itemExistente = await prisma.vendaitem.findFirst({
      where: {
        venda_id: venda.id,
        produto_id: produtoId,
      },
    });

    const quantidadeNoCarrinho = itemExistente?.quantidade ?? 0;
    const quantidadeTotal = quantidadeNoCarrinho + quantidade;

    // VALIDAÇÃO: Estoque suficiente?
    if (estoque.quantidade < quantidadeTotal) {
      return NextResponse.json(
        {
          error: "Estoque insuficiente",
          message: `Apenas ${estoque.quantidade} unidades disponíveis de ${estoque.produto.nome}. Você já tem ${quantidadeNoCarrinho} no carrinho.`,
          estoqueDisponivel: estoque.quantidade,
          quantidadeNoCarrinho,
        },
        { status: 400 }
      );
    }

    const produto = estoque.produto;
    let item;

    // Atualiza ou cria item
    if (itemExistente) {
      item = await prisma.vendaitem.update({
        where: { id: itemExistente.id },
        data: {
          quantidade: quantidadeTotal,
          subtotal: quantidadeTotal * produto.preco_venda,
        },
      });
    } else {
      item = await prisma.vendaitem.create({
        data: {
          venda_id: venda.id,
          produto_id: produtoId,
          quantidade,
          preco_unitario: produto.preco_venda,
          subtotal: quantidade * produto.preco_venda,
        },
      });
    }

    // Atualiza total da venda
    const todosItens = await prisma.vendaitem.findMany({
      where: { venda_id: venda.id },
    });
    const total = todosItens.reduce((acc, i) => acc + i.subtotal, 0);

    await prisma.venda.update({
      where: { id: venda.id },
      data: { total },
    });

    return NextResponse.json({
      success: true,
      message: "Produto adicionado ao carrinho",
      item,
    });
  } catch (err) {
    console.error("Erro ao adicionar ao carrinho:", err);
    return NextResponse.json(
      { error: "Erro ao adicionar produto" },
      { status: 500 }
    );
  }
}
