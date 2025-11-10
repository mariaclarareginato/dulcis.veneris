import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// POST: Adicionar ou incrementar produto ao carrinho
export async function POST(req) {
  try {
    const { usuarioId, lojaId, produtoId, quantidade } = await req.json();

    if (!usuarioId || !lojaId || !produtoId || !quantidade || quantidade < 1) {
      return NextResponse.json(
        { error: "Dados obrigatórios ausentes ou inválidos." },
        { status: 400 }
      );
    }

    // Busca ou cria venda aberta
    let venda = await prisma.venda.findFirst({
      where: { usuario_id: usuarioId, loja_id: lojaId, status: "ABERTA" },
    });

    if (!venda) {
      // Busca caixa aberto
      let caixaAberto = await prisma.caixa.findFirst({
        where: { loja_id: lojaId, status: "ABERTO" },
      });
      
      // Se não houver caixa aberto, cria um novo
      if (!caixaAberto) {
        caixaAberto = await prisma.caixa.create({
          data: {
            loja_id: lojaId,
            usuario_abertura_id: usuarioId,
            data_abertura: new Date(),
            saldo_inicial: 0,
            status: "ABERTO",
          },
        });
      }

      // Cria nova venda, garantindo que 'cmv' seja incluído e 'total' é 0
      venda = await prisma.venda.create({
        data: {
          data_hora: new Date(),
          total: 0, // Decimal ou Float, mas o valor é 0
          cmv: 0,   // Inicializa CMV em 0
          status: "ABERTA",
          caixa: {
            connect: { id: caixaAberto.id },
          },
          loja: {
            connect: { id: lojaId },
          },
          usuario: {
            connect: { id: usuarioId },
          },
        },
      });
    }

    // Verifica preço e estoque
    const produto = await prisma.produto.findUnique({
      where: { id: produtoId },
      include: {
        estoque: { where: { loja_id: lojaId }, select: { quantidade: true } },
      },
    });

    if (!produto)
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });

    // Converte o preço de venda para número (Float) para cálculo, pois o Prisma retorna Decimal como String ou objeto
    const precoUnitario = parseFloat(produto.preco_venda); 
    const estoqueDisponivel = produto.estoque[0]?.quantidade ?? 0;

    let vendaItem = await prisma.vendaitem.findFirst({
      where: { venda_id: venda.id, produto_id: produtoId },
    });

    const novaQuantidade = (vendaItem?.quantidade ?? 0) + quantidade;

    if (estoqueDisponivel < novaQuantidade) {
      return NextResponse.json(
        { error: `Estoque insuficiente. Disponível: ${estoqueDisponivel}` },
        { status: 400 }
      );
    }

    // Calcula novo subtotal
    const novoSubtotal = parseFloat((novaQuantidade * precoUnitario).toFixed(2));

    // Cria ou atualiza item
    if (vendaItem) {
      vendaItem = await prisma.vendaitem.update({
        where: { id: vendaItem.id },
        data: { 
          quantidade: novaQuantidade, 
          subtotal: novoSubtotal // Garante que o Decimal seja atualizado corretamente
        },
      });
    } else {
      vendaItem = await prisma.vendaitem.create({
        data: {
          venda_id: venda.id,
          produto_id: produtoId,
          quantidade,
          preco_unitario: precoUnitario, // O Prisma lida com a conversão de Float para Decimal
          subtotal: novoSubtotal,
        },
      });
    }

    // Atualiza total da venda
    const total = await prisma.vendaitem.aggregate({
      _sum: { subtotal: true },
      where: { venda_id: venda.id },
    });

    // O resultado de _sum.subtotal é um Decimal/String, convertemos para Float para o update
    const novoTotalVenda = parseFloat(total._sum.subtotal ?? 0);
    
    await prisma.venda.update({
      where: { id: venda.id },
      data: { total: novoTotalVenda },
    });

    return NextResponse.json({ success: true, item: vendaItem });
  } catch (err) {
    console.error("Erro ao adicionar produto:", err);
    return NextResponse.json(
      { error: "Erro interno ao adicionar produto", details: err.message },
      { status: 500 }
    );
  }
}

// GET: Retorna o carrinho (venda aberta + itens + produtos)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioId = parseInt(searchParams.get("usuarioId"));
    const lojaId = parseInt(searchParams.get("lojaId"));

    if (!usuarioId || !lojaId) {
      return NextResponse.json({ error: "Usuário e loja obrigatórios" }, { status: 400 });
    }

    const venda = await prisma.venda.findFirst({
      where: { usuario_id: usuarioId, loja_id: lojaId, status: "ABERTA" },
      include: {
        vendaitem: {
          include: {
            produto: { select: { nome: true, preco_venda: true, img: true } },
          },
        },
      },
    });

    if (!venda) {
      return NextResponse.json({ itens: [], total: 0 });
    }

    return NextResponse.json({
      itens: venda.vendaitem,
      // O campo 'total' virá como Decimal/String do Prisma; garantimos que seja um número para o frontend
      total: parseFloat(venda.total ?? 0), 
    });
  } catch (err) {
    console.error("Erro ao buscar carrinho:", err);
    return NextResponse.json(
      { error: "Erro interno ao buscar carrinho", details: err.message },
      { status: 500 }
    );
  }
}