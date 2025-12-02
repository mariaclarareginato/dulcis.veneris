import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    // Busca usuários da loja com perfil CAIXA
    const usuarios = await prisma.usuario.findMany({
      where: {
        loja_id: lojaId,
        perfil: "CAIXA",
      },
      select: {
        id: true,
        nome: true,
        email: true,
        cpf: true,
        telefone: true,
      },
    });

    // Para cada usuário, calcula estatísticas
    const usuariosComStats = await Promise.all(
      usuarios.map(async (usuario) => {
        // Busca vendas finalizadas do usuário
        const vendas = await prisma.venda.findMany({
          where: {
            usuario_id: usuario.id,
            loja_id: lojaId,
            status: "FINALIZADA",
          },
          include: {
            vendaitem: {
              include: {
                produto: true,
              },
            },
          },
        });

        //  Converte Decimal para Number explicitamente
        const totalVendas = vendas.reduce((sum, venda) => {
          return sum + parseFloat(venda.total || 0);
        }, 0);

        //  Calcula lucro convertendo Decimals
        const lucro = vendas.reduce((sum, venda) => {
          const totalVenda = parseFloat(venda.total || 0);
          const custoVenda = venda.vendaitem.reduce(
            (custoSum, item) =>
              custoSum + item.quantidade * parseFloat(item.produto?.custo || 0),
            0
          );
          return sum + (totalVenda - custoVenda);
        }, 0);

        // Número de vendas
        const numeroVendas = vendas.length;

        // Ticket médio
        const ticketMedio = numeroVendas > 0 ? totalVendas / numeroVendas : 0;

        return {
          ...usuario,
          stats: {
            numeroVendas,
            totalVendas,
            lucro,
            ticketMedio,
          },
        };
      })
    );

    // Ordena por total de vendas (decrescente)
    usuariosComStats.sort((a, b) => b.stats.totalVendas - a.stats.totalVendas);

    return NextResponse.json(usuariosComStats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas de usuários:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
