// app/api/carrinho/route.js

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 🔍 GET: Busca Venda Aberta (Carrinho) ou a Cria
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioIdStr = searchParams.get("usuarioId");
    const lojaIdStr = searchParams.get("lojaId");

    const usuarioId = parseInt(usuarioIdStr);
    const lojaId = parseInt(lojaIdStr);

    if (isNaN(usuarioId) || isNaN(lojaId)) {
      return NextResponse.json(
        { error: "Usuário e Loja são obrigatórios e devem ser números válidos." },
        { status: 400 }
      );
    }

    // Busca venda aberta
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
                  select: { quantidade: true, estoque_minimo: true },
                },
              },
            },
          },
        },
      },
    });

    // Cria venda aberta se não existir (necessário caixa aberto)
    if (!venda) {
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
        // Re-inclui os itens para manter o formato de retorno
        include: {
          vendaitem: {
            include: {
              produto: {
                include: {
                  estoque: {
                    where: { loja_id: lojaId },
                    select: { quantidade: true, estoque_minimo: true },
                  },
                },
              },
            },
          },
        },
      });
    }

    // Formata itens com quantidade e estoque_minimo
    const itens = venda.vendaitem.map((item) => ({
      ...item,
      estoque_disponivel: item.produto.estoque[0]?.quantidade ?? 0,
      estoque_minimo: item.produto.estoque[0]?.estoque_minimo ?? 0,
    }));

    return NextResponse.json({
      itens,
      vendaId: venda.id,
      total: venda.total,
    });

  } catch (err) {
    console.error("Erro ao buscar carrinho:", err);
    // ⚠️ Proteção: Garante que SEMPRE retorna um JSON válido em caso de erro.
    return NextResponse.json(
      { error: "Erro interno ao buscar carrinho", details: err.message },
      { status: 500 }
    );
  }
}

// ➕ POST: Adicionar ou incrementar produto ao carrinho
export async function POST(req) {
  try {
    const { usuarioId, lojaId, produtoId, quantidade } = await req.json();

    if (!usuarioId || !lojaId || !produtoId || !quantidade || quantidade < 1) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes ou inválidos." },
        { status: 400 }
      );
    }

    // 1. Busca ou Cria a Venda Aberta
    let venda = await prisma.venda.findFirst({
      where: {
        usuario_id: usuarioId,
        loja_id: lojaId,
        status: "ABERTA",
      },
    });

    if (!venda) {
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
      });
    }

    // 2. Verifica Preço e Estoque
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
      include: {
        estoque: {
          where: { loja_id: lojaId },
          select: { quantidade: true },
        },
      },
    });

    if (!produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    const precoUnitario = produto.preco_venda;
    const estoqueDisponivel = produto.estoque[0]?.quantidade ?? 0;

    // 3. Busca Item Existente no Carrinho
    let vendaItem = await prisma.vendaItem.findFirst({
      where: {
        venda_id: venda.id,
        produto_id: produtoId,
      },
    });

    const novaQuantidade = (vendaItem ? vendaItem.quantidade : 0) + quantidade;

    if (estoqueDisponivel < novaQuantidade) {
      return NextResponse.json(
        { error: `Estoque insuficiente. Disponível: ${estoqueDisponivel}` },
        { status: 400 }
      );
    }

    // 4. Cria ou Atualiza o Item
    if (vendaItem) {
      // Atualiza
      vendaItem = await prisma.vendaItem.update({
        where: { id: vendaItem.id },
        data: {
          quantidade: novaQuantidade,
          subtotal: novaQuantidade * precoUnitario,
        },
      });
    } else {
      // Cria
      vendaItem = await prisma.vendaItem.create({
        data: {
          venda_id: venda.id,
          produto_id: produtoId,
          quantidade: quantidade,
          preco_unitario: precoUnitario,
          subtotal: quantidade * precoUnitario,
        },
      });
    }

    // 5. Atualiza o Total da Venda
    const novoTotal = await prisma.vendaItem.aggregate({
      _sum: {
        subtotal: true,
      },
      where: {
        venda_id: venda.id,
      },
    });

    await prisma.venda.update({
      where: { id: venda.id },
      data: {
        total: novoTotal._sum.subtotal ?? 0,
      },
    });

    return NextResponse.json({ success: true, item: vendaItem });

  } catch (err) {
    console.error("Erro ao adicionar produto:", err);
    // ⚠️ Proteção: Garante que SEMPRE retorna um JSON válido em caso de erro.
    return NextResponse.json(
      { error: "Erro interno ao adicionar produto", details: err.message },
      { status: 500 }
    );
  }
}