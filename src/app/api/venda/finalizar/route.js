import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";

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

    // --- 6) GERAR PDF DA NOTA FISCAL ---
   
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("DULCIS VENERIS - NOTA FISCAL", 10, 15);

    doc.setFontSize(12);
    doc.text(`Venda Nº: ${vendaFinalizada.id}`, 10, 30);
    doc.text(`Data: ${new Date().toLocaleString("pt-BR")}`, 10, 40);
    doc.text(`Pagamento: ${tipoPagamento}`, 10, 50);

    let y = 65;
    doc.text("-------------------------------------", 10, y);
    y += 10;

    vendaFinalizada.vendaitem.forEach((item) => {
      doc.text(
        `${item.produto.nome}  x${item.quantidade}  = R$ ${item.subtotal}`,
        10,
        y
      );
      y += 10;
    });

    doc.text("-------------------------------------", 10, y);
    y += 10;

    doc.text(`TOTAL: R$ ${vendaFinalizada.total.toFixed(2)}`, 10, y);

    // BUFFER DO PDF
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=nota_fiscal_${vendaFinalizada.id}.pdf`,
      },
    });

  } catch (err) {
    console.error("❌ Erro ao finalizar venda:", err);
    return NextResponse.json(
      { message: "Erro interno", details: err.message },
      { status: 500 }
    );
  }
}