import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// O Prisma Client agora tem acesso ao enum TipoDespesa
const prisma = new PrismaClient();

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const lojaId = Number(searchParams.get("lojaId"));

    if (!lojaId) {
      return NextResponse.json(
        { message: "lojaId é obrigatório" },
        { status: 400 }
      );
    }

    // --- 1. SOMAS DE DESPESAS PAGAS ---
    // Consulta para as Despesas Fixas (inclui Aluguel, Água, Energia, INTERNET, etc.)
    const despesasFixasResult = await prisma.despesa.aggregate({
      _sum: { valor: true },
      where: { loja_id: lojaId, pago: true, tipo: "FIXA" },
    });

    // Consulta para o Custo de Pedido (se for uma despesa operacional, como frete de recebimento)
    const custoPedidoResult = await prisma.despesa.aggregate({
        _sum: { valor: true },
        where: { loja_id: lojaId, pago: true, tipo: "CUSTO_PEDIDO" },
    });

    // Consulta para TODAS as despesas pagas (para o cálculo do lucro líquido)
    const totalDespesasResult = await prisma.despesa.aggregate({
      _sum: { valor: true },
      where: { loja_id: lojaId, pago: true },
    });
    
    // --- 2. CÁLCULO DO CUSTO DOS PRODUTOS VENDIDOS (CMV) ---
    // Buscar itens das vendas finalizadas e incluir o custo dos produtos
    const vendaItens = await prisma.vendaitem.findMany({
      where: {
        venda: { loja_id: lojaId, status: "FINALIZADA" },
      },
      include: { produto: true },
    });

    // Calcular o Custo da Mercadoria Vendida (CMV)
    const custoProdutosVendidos = vendaItens.reduce(
      (sum, item) => sum + Number(item.quantidade) * (Number(item.produto?.custo) || 0),
      0
    );

    // --- 3. SOMA DAS VENDAS FINALIZADAS (RECEITA) ---
    const totalVendasResult = await prisma.venda.aggregate({
      _sum: { total: true },
      where: { loja_id: lojaId, status: "FINALIZADA" },
    });

    // --- 4. PREPARAR VALORES E CALCULAR LUCRO ---
    
    // Convertendo resultados para números seguros (o Prisma retorna Decimal, que é manipulado como string/object)
    const vendas = Number(totalVendasResult._sum.total) || 0;
    const custo = custoProdutosVendidos || 0;
    
    const todasDespesas = Number(totalDespesasResult._sum.valor) || 0;
    const despesasFixas = Number(despesasFixasResult._sum.valor) || 0;
    const custoPedido = Number(custoPedidoResult._sum.valor) || 0;

    // Lucro Líquido = Vendas - (CMV + Todas as Despesas Operacionais Pagas)
    const lucro = vendas - (custo + todasDespesas);
    const margemLucro = vendas > 0 ? ((lucro / vendas) * 100).toFixed(1) : 0;

    // --- 5. NOME DA LOJA ---
    const loja = await prisma.loja.findUnique({
      where: { id: lojaId },
      select: { nome: true },
    });

    // --- 6. RETORNO ---
    return NextResponse.json({
      loja: loja?.nome || "Loja desconhecida",
      totalVendas: vendas,
      
      // Detalhamento das despesas
      totalDespesas: todasDespesas, // Total usado no cálculo do lucro
      despesasFixas: despesasFixas,
      custoPedido: custoPedido, // Novo campo de despesa isolado

      custoProdutos: custo,
      lucro,
      margemLucro,
    });
  } catch (error) {
    console.error("Erro ao buscar dados financeiros:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}