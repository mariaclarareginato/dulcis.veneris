import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { usuarioId, lojaId, tipoPagamento, detalhesPagamento } = body;

    // 1) BUSCA O CAIXA ABERTO CORRETO
    const caixaAberto = await prisma.caixa.findFirst({
      where: { loja_id: lojaId, status: "ABERTO" }
    });

    if (!caixaAberto) {
      return NextResponse.json({ message: "Nenhum caixa aberto encontrado." }, { status: 404 });
    }

    // 2) BUSCA A VENDA ABERTA USANDO O CAIXA CORRETO
    const vendaAberta = await prisma.venda.findFirst({
      where: {
        usuario_id: usuarioId,
        loja_id: lojaId,
        caixa_id: caixaAberto.id,
        status: "ABERTA",
      },
      include: {
        vendaitem: {
          include: {
            produto: {
              include: {
                estoque: {
                  where: { loja_id: lojaId },
                },
              },
            },
          },
        },
      },
    });

    if (!vendaAberta) {
      return NextResponse.json(
        { message: "Nenhuma venda aberta encontrada." },
        { status: 404 }
      );
    }

    // 3) CALCULA TOTAL E CMV
    let totalCalc = 0;
    let cmvCalc = 0;

    for (const item of vendaAberta.vendaitem) {
      const subtotalNum = Number(item.subtotal) || 0;
      const precoVendaNum = Number(item.produto?.preco_venda) || 0;
      const custoNum = Number(item.produto?.custo) || 0;
      const quantidade = Number(item.quantidade) || 0;

      totalCalc += subtotalNum || precoVendaNum * quantidade;
      cmvCalc += custoNum * quantidade;
    }

    const totalFinalNumber = parseFloat(totalCalc);
    const cmvFinalNumber = parseFloat(cmvCalc);

    // 4) FINALIZA A VENDA
    const vendaFinalizada = await prisma.venda.update({
      where: { id: vendaAberta.id },
      data: {
        status: "FINALIZADA",
        total: totalFinalNumber,
        cmv: cmvFinalNumber,
        data_hora: new Date(),
        pagamento: {
          create: {
            tipo: tipoPagamento || "NÃO INFORMADO",
            valor: totalFinalNumber,
            detalhe: JSON.stringify(detalhesPagamento || {}),
          },
        },
      },
      include: {
        vendaitem: {
          include: {
            produto: {
              include: {
                estoque: { where: { loja_id: lojaId } },
              },
            },
          },
        },
        pagamento: true,
      },
    });

    // 5) ATUALIZA O ESTOQUE
    for (const item of vendaFinalizada.vendaitem) {
      const estoque = item.produto.estoque?.[0];
      if (estoque) {
        await prisma.estoque.update({
          where: { id: estoque.id },
          data: { quantidade: Math.max(0, estoque.quantidade - item.quantidade) },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Venda finalizada com sucesso!",
      venda: vendaFinalizada,
    });

  } catch (err) {
    console.error("❌ Erro ao finalizar venda:", err);
    return NextResponse.json(
      { message: "Erro interno", details: err.message },
      { status: 500 }
    );
  }
}
