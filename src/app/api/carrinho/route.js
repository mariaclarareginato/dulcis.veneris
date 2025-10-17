import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const usuarioId = parseInt(searchParams.get("usuarioId"));
    const lojaId = parseInt(searchParams.get("lojaId"));

    if (!usuarioId || !lojaId) {
      return NextResponse.json(
        { error: "Usuário e Loja são obrigatórios" },
        { status: 400 }
      );
    }

    // Busca venda aberta
    let venda = await prisma.venda.findFirst({
      where: {
        usuario_id: usuarioId,
        loja_id: lojaId,
        status: "ABERTA",
      },
      include: {
        vendaitem: {
          include: {
            produto: {
              include: {
                estoque: {
                  where: { loja_id: lojaId },
                  select: { quantidade: true, estoque_minimo: true },
                },
              },
            },
          },
        },
      },
    });

    // Cria venda aberta se não existir (necessário caixa aberto)
    if (!venda) {
      const caixaAberto = await prisma.caixa.findFirst({
        where: { loja_id: lojaId, status: "ABERTO" },
      });

      if (!caixaAberto) {
        return NextResponse.json(
          { error: "Não há caixa aberto nesta loja" },
          { status: 400 }
        );
      }

      venda = await prisma.venda.create({
        data: {
          usuario_id: usuarioId,
          loja_id: lojaId,
          caixa_id: caixaAberto.id,
          data_hora: new Date(),
          total: 0,
          status: "ABERTA",
        },
        include: {
          vendaitem: {
            include: {
              produto: {
                include: {
                  estoque: {
                    where: { loja_id: lojaId },
                    select: { quantidade: true, estoque_minimo: true },
                  },
                },
              },
            },
          },
        },
      });
    }

    // Formata itens com quantidade e estoque_minimo
    const itens = venda.vendaitem.map((item) => ({
      ...item,
      estoque_disponivel: item.produto.estoque[0]?.quantidade ?? 0,
      estoque_minimo: item.produto.estoque[0]?.estoque_minimo ?? 0,
    }));

    return NextResponse.json({
      itens,
      vendaId: venda.id,
      total: venda.total,
    });
  } catch (err) {
    console.error("Erro ao buscar carrinho:", err);
    return NextResponse.json(
      { error: "Erro ao buscar carrinho" },
      { status: 500 }
    );
  }
}
