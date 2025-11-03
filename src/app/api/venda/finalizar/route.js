import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      usuarioId,
      lojaId,
      caixaId,
      tipoPagamento,
      detalhesPagamento,
    } = body;

    console.log("Finalizando venda:", JSON.stringify(body, null, 2));

    // 1. Busca a venda aberta do usuário

    const vendaAberta = await prisma.venda.findFirst({
      where: {
        usuario_id: Number(usuarioId),
        loja_id: Number(lojaId),
        status: "ABERTA",
      },
      include: {
        vendaitem: {
          include: {
            produto: {
              include: {
                estoque: {
                  where: { loja_id: Number(lojaId) },
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

    //  2. Calcula total

    const total = vendaAberta.vendaitem.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );

    //  3. Finaliza a venda

    const vendaFinalizada = await prisma.venda.update({
      where: { id: vendaAberta.id },
      data: {
        status: "FINALIZADA",
        total,
        data_hora: new Date(),
        pagamento: {
          create: {
            tipo: tipoPagamento || "NÃO INFORMADO",
            valor: total,
            detalhe: JSON.stringify(detalhesPagamento || {}),
          },
        },
      },
      include: {
        vendaitem: { include: { produto: true } },
        pagamento: true,
      },
    });


    // 4.  Atualiza o estoque de cada produto

    for (const item of vendaAberta.vendaitem) {
      const estoqueAtual = item.produto.estoque[0];

      if (estoqueAtual) {
        const novaQuantidade = Math.max(
          0,
          estoqueAtual.quantidade - item.quantidade
        );

        await prisma.estoque.update({
          where: { id: estoqueAtual.id },
          data: { quantidade: novaQuantidade },
        });

        console.log(
          ` Estoque atualizado: Produto ${item.produto_id} agora tem ${novaQuantidade} unidades`
        );
      } else {
        console.warn(
          ` Nenhum registro de estoque encontrado para produto ${item.produto_id} na loja ${lojaId}`
        );
      }
    }

    console.log(` Venda ${vendaFinalizada.id} finalizada e estoque atualizado.`);

    return NextResponse.json({
      success: true,
      message: "Venda finalizada com sucesso e estoque atualizado!",
      venda: vendaFinalizada,
    });
  } catch (err) {
    console.error("❌ Erro ao finalizar venda:", err);
    return NextResponse.json(
      { message: "Erro interno ao finalizar venda.", details: err.message },
      { status: 500 }
    );
  }
}
