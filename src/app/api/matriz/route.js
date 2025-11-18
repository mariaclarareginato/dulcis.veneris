import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    // Busca todas as lojas do tipo FILIAL
    const filiais = await prisma.loja.findMany({
      where: {
        tipo: "FILIAL",
      },
      include: {
        caixa: {
          select: {
            id: true,
            status: true,
            data_abertura: true,
            saldo_inicial: true,
          },
        },
        despesa: {
          select: {
            id: true,
            tipo: true,
            valor: true,
            pago: true,
          },
        },
        estoque: {
          select: {
            id: true,
            quantidade: true,
            estoque_minimo: true,
            produto: {
              select: {
                nome: true,
              },
            },
          },
        },
        usuario: {
          select: {
            id: true,
            nome: true,
            perfil: true,
          },
        },
        venda: {
          where: {
            status: "FINALIZADA",
          },
          select: {
            id: true,
            total: true,
            cmv: true,
            data_hora: true,
          },
        },
        pedido: {
          select: {
            id: true,
            status: true,
            data_pedido: true,
          },
        },
      },
    });

    // Processa os dados de cada filial
    const filiaisComStats = filiais.map((filial) => {
      // Calcula total de vendas
      const totalVendas = filial.venda.reduce(
        (acc, venda) => acc + parseFloat(venda.total || 0),
        0
      );

      // Calcula CMV total
      const totalCMV = filial.venda.reduce(
        (acc, venda) => acc + parseFloat(venda.cmv || 0),
        0
      );

      // Calcula total de despesas pendentes
      const totalDespesas = filial.despesa
        .filter((d) => !d.pago)
        .reduce((acc, despesa) => acc + parseFloat(despesa.valor || 0), 0);

      // Calcula lucro (Vendas - CMV - Despesas)
      const lucro = totalVendas - totalCMV - totalDespesas;

      // Conta produtos com estoque baixo
      const estoqueBaixo = filial.estoque.filter(
        (e) => e.quantidade <= e.estoque_minimo
      ).length;

      // Conta pedidos pendentes
      const pedidosPendentes = filial.pedido.filter(
        (p) => p.status === "PENDENTE"
      ).length;

      // Conta funcionários
      const funcionarios = filial.usuario.length;

      // Conta caixas abertos
      const caixasAbertos = filial.caixa.filter(
        (c) => c.status === "ABERTO"
      ).length;

      // Calcula margem de lucro
      const margemLucro =
        totalVendas > 0 ? ((lucro / totalVendas) * 100).toFixed(2) : "0.00";

      return {
        id: filial.id,
        nome: filial.nome,
        endereco: filial.endereco,
        cidade: filial.cidade,
        estado: filial.estado,
        tipo: filial.tipo,
        ativo: filial.ativo,
        stats: {
          totalVendas: parseFloat(totalVendas.toFixed(2)),
          totalCMV: parseFloat(totalCMV.toFixed(2)),
          totalDespesas: parseFloat(totalDespesas.toFixed(2)),
          lucro: parseFloat(lucro.toFixed(2)),
          margemLucro: parseFloat(margemLucro),
          estoqueBaixo,
          pedidosPendentes,
          funcionarios,
          caixasAbertos,
          numeroVendas: filial.venda.length,
          numeroPedidos: filial.pedido.length,
        },
        detalhes: {
          caixas: filial.caixa.map((c) => ({
            id: c.id,
            status: c.status,
            data_abertura: c.data_abertura,
            saldo_inicial: parseFloat(c.saldo_inicial),
          })),
          despesas: filial.despesa.map((d) => ({
            id: d.id,
            tipo: d.tipo,
            valor: parseFloat(d.valor),
            pago: d.pago,
          })),
          estoqueBaixo: filial.estoque
            .filter((e) => e.quantidade <= e.estoque_minimo)
            .map((e) => ({
              id: e.id,
              produto: e.produto.nome,
              quantidade: e.quantidade,
              estoque_minimo: e.estoque_minimo,
            })),
          funcionarios: filial.usuario.map((u) => ({
            id: u.id,
            nome: u.nome,
            perfil: u.perfil,
          })),
          pedidosPendentes: filial.pedido
            .filter((p) => p.status === "PENDENTE")
            .map((p) => ({
              id: p.id,
              status: p.status,
              data_pedido: p.data_pedido,
            })),
        },
      };
    });

    return NextResponse.json(filiaisComStats);
  } catch (error) {
    console.error("Erro ao buscar dados das filiais:", error);
    return NextResponse.json(
      { error: "Erro ao buscar dados das filiais", details: error.message },
      { status: 500 }
    );
  }
}
