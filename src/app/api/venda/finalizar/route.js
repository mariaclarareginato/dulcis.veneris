import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      usuarioId,
      lojaId,
      tipoPagamento,
      detalhesPagamento,
      // caixaId não está sendo usado, mas mantido por consistência
    } = body;

    console.log("Finalizando venda:", JSON.stringify(body, null, 2));

    // 1. Busca a venda aberta do usuário, incluindo o custo unitário do produto
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
              // Garante que o campo 'custo_unitario' está incluído na busca
              select: {
                id: true,
                custo_unitario: true, // ⚠️ ASSUMIDO que este é o nome do campo
                // Inclua outros campos necessários (ex: estoque)
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

    // 2. Calcula Total e CMV (Custo da Mercadoria Vendida)

    const total = vendaAberta.vendaitem.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );

    let cmvTotal = 0;
    for (const item of vendaAberta.vendaitem) {
      // ⚠️ Use um fallback para 0 caso o custo não esteja definido
      const custo = item.produto.custo_unitario ?? 0;
      cmvTotal += custo * item.quantidade;
    }

    console.log(`Total da Venda: ${total.toFixed(2)}, CMV Calculado: ${cmvTotal.toFixed(2)}`);

    // 3. Finaliza a venda e registra o CMV
    
    // 💡 Você precisa garantir que o campo 'cmv' exista na sua tabela Venda no Prisma Schema.
    const vendaFinalizada = await prisma.venda.update({
      where: { id: vendaAberta.id },
      data: {
        status: "FINALIZADA",
        total,
        cmv: cmvTotal, // ⬅️ CAMPO NOVO ESSENCIAL PARA O CÁLCULO FINANCEIRO
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


    // 4. Atualiza o estoque de cada produto

    for (const item of vendaAberta.vendaitem) {
      // O estoque está dentro de item.produto.estoque[0] devido ao select/include
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
          ` Estoque atualizado: Produto ${item.produto.id} agora tem ${novaQuantidade} unidades`
        );
      } else {
        console.warn(
          ` Nenhum registro de estoque encontrado para produto ${item.produto.id} na loja ${lojaId}`
        );
      }
    }

    console.log(` Venda ${vendaFinalizada.id} finalizada, CMV registrado e estoque atualizado.`);

    return NextResponse.json({
      success: true,
      message: "Venda finalizada com sucesso, CMV registrado e estoque atualizado!",
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