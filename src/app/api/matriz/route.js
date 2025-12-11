import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// ==========================
//        GET 
// ==========================
export async function GET(req) {
  try {
    const filiais = await prisma.loja.findMany({
      where: { tipo: "FILIAL" },
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
              select: { nome: true },
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
          where: { status: "FINALIZADA" },
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

    const filiaisComStats = filiais.map((filial) => {
      const totalVendas = filial.venda.reduce(
        (acc, v) => acc + parseFloat(v.total || 0), 0
      );

      const totalCMV = filial.venda.reduce(
        (acc, v) => acc + parseFloat(v.cmv || 0), 0
      );

      const totalDespesas = filial.despesa
        .filter((d) => !d.pago)
        .reduce((acc, despesa) => acc + parseFloat(despesa.valor || 0), 0);

      const lucro = totalVendas - totalCMV - totalDespesas;

      const estoqueBaixo = filial.estoque.filter(
        (e) => e.quantidade <= e.estoque_minimo
      ).length;

      const pedidosPendentes = filial.pedido.filter(
        (p) => p.status === "PENDENTE"
      ).length;

      const funcionarios = filial.usuario.length;

      const caixasAbertos = filial.caixa.filter(
        (c) => c.status === "ABERTO"
      ).length;

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

// ======================================================
//  POST — Criar nova filial (SEM alterar sua rota GET)
// ======================================================
export async function POST(req) {
  try {
    const body = await req.json();

    const { nome, endereco, cidade, estado } = body;

    if (!nome || !endereco)
      return NextResponse.json(
        { error: "Nome e endereço são obrigatórios" },
        { status: 400 }
      );

    const novaFilial = await prisma.loja.create({
      data: {
        nome,
        endereco,
        cidade: cidade || "",
        estado: estado || "",
        tipo: "FILIAL",
        ativo: true,
      },
    });

    return NextResponse.json(novaFilial, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar filial:", error);
    return NextResponse.json(
      { error: "Erro ao criar filial", details: error.message },
      { status: 500 }
    );
  }
}
