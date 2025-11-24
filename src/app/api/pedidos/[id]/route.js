// app/api/pedidos/[id]/route.js (Rota: PATCH /api/pedidos/{id})

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Handler para atualizar o status do pedido
export async function PATCH(request, { params }) {
    const pedidoId = parseInt(params.id, 10);
    let body;

    try {
        body = await request.json();
    } catch (error) {
        await prisma.$disconnect();
        return NextResponse.json({ error: 'Formato JSON inválido.' }, { status: 400 });
    }

    const { status, usuario_id } = body;

    if (!status || !usuario_id) {
        await prisma.$disconnect();
        return NextResponse.json({ error: 'Status e usuario_id são obrigatórios.' }, { status: 400 });
    }

    try {
        // 1. Verificar Autorização: Somente ADMIN da Matriz pode alterar o status.
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuario_id },
            include: { loja: true }
        });

        if (!usuario || usuario.perfil !== 'ADMIN' || usuario.loja.tipo !== 'MATRIZ') {
            await prisma.$disconnect();
            return NextResponse.json({ error: 'Ação não autorizada. Somente ADMIN da Matriz pode alterar o status.' }, { status: 403 });
        }

        // 2. Atualiza o status do pedido
        const pedidoAtualizado = await prisma.pedido.update({
            where: { id: pedidoId },
            data: { status: status }, // status deve ser um valor válido do ENUM PedidoStatus
            include: { itens_pedido: true, loja: true, usuario: true }
        });

        await prisma.$disconnect();
        return NextResponse.json(pedidoAtualizado, { status: 200 });

    } catch (error) {
        console.error(`Erro ao atualizar pedido ${pedidoId}:`, error);
        await prisma.$disconnect();
        return NextResponse.json(
            { error: 'Erro interno ao atualizar o status do pedido.', details: error.message },
            { status: 500 }
        );
    }
}