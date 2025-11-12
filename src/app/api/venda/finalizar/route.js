import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { usuarioId, lojaId, tipoPagamento, detalhesPagamento, caixaId } = body;

    const vendaAberta = await prisma.venda.findFirst({
      where: {
        usuario_id: usuarioId,
        loja_id: lojaId,
        caixa_id: caixaId,
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
      return NextResponse.json({ message: "Nenhuma venda aberta encontrada." }, { status: 404 });
    }

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
                estoque: {
                  where: { loja_id: lojaId },
                },
              },
            },
          },
        },
        pagamento: true,
      },
    });

    // Atualiza o estoque
    for (const item of vendaFinalizada.vendaitem) {
      const produto = item.produto;
      const estoque = produto.estoque?.[0]; 

      if (estoque) {
        const novaQuantidade = Math.max(0, estoque.quantidade - item.quantidade);
        await prisma.estoque.update({
          where: { id: estoque.id },
          data: { quantidade: novaQuantidade },
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
    return NextResponse.json({ message: "Erro interno", details: err.message }, { status: 500 });
  }
}
