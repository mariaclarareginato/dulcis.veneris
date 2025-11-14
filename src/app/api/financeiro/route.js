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

    // Corrige fuso (UTC)
    const now = new Date();
    const firstDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const lastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59));

    // TOTAL VENDAS
    const vendas = await prisma.venda.aggregate({
      _sum: { total: true },
      where: {
        loja_id: lojaId,
        status: "FINALIZADA",
      },
    });

    const totalVendas = Number(vendas._sum.total || 0);

    // CMV
    const cmv = await prisma.venda.aggregate({
      _sum: { cmv: true },
      where: {
        loja_id: lojaId,
        status: "FINALIZADA",
      },
    });

    const totalCMV = Number(cmv._sum.cmv || 0);

    // Despesas PENDENTES do mês
    const despesasPendentes = await prisma.despesa.findMany({
      where: {
        loja_id: lojaId,
        pago: false,
        data_vencimento: {
          gte: firstDay,
          lte: lastDay,
        },
      },
      orderBy: { data_vencimento: "asc" },
    });

    const totalDespesasPendentes = despesasPendentes.reduce(
      (acc, d) => acc + Number(d.valor || 0),
      0
    );

    // Cálculos finais
    const lucro = totalVendas - (totalCMV + totalDespesasPendentes);
    const margemLucro =
      totalVendas > 0 ? ((lucro / totalVendas) * 100).toFixed(2) : "0.00";

    const loja = await prisma.loja.findUnique({
      where: { id: lojaId },
      select: { nome: true },
    });

    return NextResponse.json({
      loja: loja?.nome || "Loja",
      totalVendas,
      totalCMV,
      totalDespesasPendentes,
      lucro,
      margemLucro,
      despesasPendentes,
    });
  } catch (error) {
    console.error("❌ Erro financeiro:", error);
    return NextResponse.json(
      { message: "Erro interno", error: error.message },
      { status: 500 }
    );
  }
}
