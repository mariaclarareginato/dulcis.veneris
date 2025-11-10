import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

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

    // Soma das despesas pagas (incluindo fixas)
    const totalDespesas = await prisma.despesa.aggregate({
      _sum: { valor: true },
      where: { loja_id: lojaId, pago: true },
    });

    // Buscar os itens das vendas finalizadas e incluir o custo dos produtos
    const vendaItens = await prisma.vendaitem.findMany({
      where: {
        venda: { loja_id: lojaId, status: "FINALIZADA" },
      },
      include: { produto: true },
    });

    // Calcular o custo total dos produtos vendidos
    const custoProdutosVendidos = vendaItens.reduce(
      (sum, item) => sum + item.quantidade * (item.produto?.custo || 0),
      0
    );

    // Soma das vendas finalizadas
    const totalVendas = await prisma.venda.aggregate({
      _sum: { total: true },
      where: { loja_id: lojaId, status: "FINALIZADA" },
    });

    const despesas = totalDespesas._sum.valor || 0;
    const custo = custoProdutosVendidos || 0;
    const vendas = totalVendas._sum.total || 0;

    // Lucro líquido = vendas - (custo + despesas)
    const lucro = vendas - (custo + despesas);
    const margemLucro = vendas > 0 ? ((lucro / vendas) * 100).toFixed(1) : 0;

    // Nome da loja
    const loja = await prisma.loja.findUnique({
      where: { id: lojaId },
      select: { nome: true },
    });

    return NextResponse.json({
      loja: loja?.nome || "Loja desconhecida",
      totalVendas: vendas,
      totalDespesas: despesas,
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
