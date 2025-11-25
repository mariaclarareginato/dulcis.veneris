import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// =======================
//  GET → Listar pedidos (com filtro por usuarioId)
// =======================
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get("usuarioId");

    try {
        const pedidos = await prisma.pedido.findMany({
            where: usuarioId ? { usuario_id: Number(usuarioId) } : {},
            orderBy: { id: 'desc' },
            include: {
                itens_pedido: true,
                loja: true,
                usuario: true
            }
        });

        return NextResponse.json(pedidos, { status: 200 });

    } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        return NextResponse.json(
            { error: "Erro interno ao buscar pedidos." },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// =======================
//  POST → Criar pedido
// =======================
export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch (error) {
        return NextResponse.json({ error: 'Formato JSON inválido.' }, { status: 400 });
    }

    const { loja_id, usuario_id, items } = body;

    if (!loja_id || !usuario_id || !items || items.length === 0) {
        return NextResponse.json(
            { error: 'Dados incompletos (loja_id, usuario_id e items são obrigatórios).' },
            { status: 400 }
        );
    }

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuario_id },
            select: { perfil: true, loja_id: true }
        });

        if (!usuario || (usuario.perfil !== 'GERENTE' && usuario.perfil !== 'ADMIN') || usuario.loja_id !== loja_id) {
            return NextResponse.json({ error: 'Ação não autorizada.' }, { status: 403 });
        }

        const produtos = await prisma.produto.findMany({
            where: { nome: { in: items.map(i => i.produto_nome) } },
            select: { id: true, nome: true }
        });

        const produtoMap = new Map(produtos.map(p => [p.nome, p.id]));

        const itensParaCriar = items.map(item => ({
            produto_nome: item.produto_nome,
            quantidade: item.quantidade,
            produto_id: item.produto_id || produtoMap.get(item.produto_nome) || null
        }));

        const novoPedido = await prisma.pedido.create({
            data: {
                loja_id,
                usuario_id,
                itens_pedido: { createMany: { data: itensParaCriar } }
            },
            include: { itens_pedido: true }
        });

        return NextResponse.json(novoPedido, { status: 201 });

    } catch (error) {
        console.error("Erro ao criar pedido:", error);
        return NextResponse.json({ error: "Erro interno ao criar pedido." }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
