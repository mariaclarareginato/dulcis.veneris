import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { usuarioId, lojaId, tipoPagamento, detalhesPagamento, caixaId } = body;

    console.log("🧾 Dados recebidos para finalizar venda:", JSON.stringify(body, null, 2));

    // 🔹 Conversões seguras
    const totalBody = Number(body.total) || 0;
    const cmvBody = Number(body.cmvTotal) || 0;

    console.log("📊 Tipos => total:", typeof totalBody, "cmvTotal:", typeof cmvBody);

    // 1️⃣ Busca a venda aberta do usuário
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
              select: { preco_venda: true, custo: true, nome: true, estoque: true },
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

    // 2️⃣ Calcula Total e CMV
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

    console.log(
      `💰 Total da Venda: R$ ${totalFinalNumber.toFixed(2)} | 🧾 CMV Calculado: R$ ${cmvFinalNumber.toFixed(2)}`
    );

    // 3️⃣ Finaliza a venda
    const vendaFinalizada = await prisma.venda.update({
      where: { id: vendaAberta.id },
      data: {
        status: "FINALIZADA",
        total: totalFinalNumber, // ✅ campo corrigido
        cmv: cmvFinalNumber,     // ✅ campo existente (você criou ele no schema)
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
        vendaitem: { include: { produto: true } },
        pagamento: true,
      },
    });

    // 4️⃣ Atualiza o estoque
    for (const item of vendaAberta.vendaitem) {
      const estoqueAtual = item.produto.estoque?.[0];
      if (estoqueAtual) {
        const novaQuantidade = Math.max(0, estoqueAtual.quantidade - item.quantidade);
        await prisma.estoque.update({
          where: { id: estoqueAtual.id },
          data: { quantidade: novaQuantidade },
        });
        console.log(`📦 Estoque atualizado: Produto ${item.produto.nome} agora tem ${novaQuantidade} unidades`);
      } else {
        console.warn(`⚠️ Nenhum registro de estoque encontrado para o produto ${item.produto.nome}`);
      }
    }

    console.log(`✅ Venda ${vendaFinalizada.id} finalizada, CMV registrado e estoque atualizado.`);

    return NextResponse.json({
      success: true,
      message: "Venda finalizada com sucesso!",
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
