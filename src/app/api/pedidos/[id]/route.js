
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();



// ==========================
//  PATCH → Atualizar status
// ==========================


export async function PATCH(request, { params }) {
    const pedidoId = parseInt(params.id, 10);

    let body;
    try {
        body = await request.json();
    } catch (error) {
        return NextResponse.json({ error: "Formato JSON inválido." }, { status: 400 });
    }

    const { status, usuario_id } = body;

    if (!status || !usuario_id) {
        return NextResponse.json(
            { error: "Status e usuario_id são obrigatórios." },
            { status: 400 }
        );
    }

    try {
        // Verifica ADMIN da Matriz
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuario_id },
            include: { loja: true }
        });

        if (!usuario || usuario.perfil !== "ADMIN" || usuario.loja?.tipo !== "MATRIZ") {
            return NextResponse.json(
                { error: "Ação não autorizada. Somente ADMIN da Matriz pode alterar pedidos." },
                { status: 403 }
            );
        }

        // Atualiza status
        const pedidoAtualizado = await prisma.pedido.update({
            where: { id: pedidoId },
            data: { status },
            include: {
                itens_pedido: true,
                loja: true,
                usuario: true
            }
        });

        return NextResponse.json(pedidoAtualizado, { status: 200 });

    } catch (error) {
        console.error(`Erro ao atualizar pedido ${pedidoId}:`, error);
        return NextResponse.json(
            { error: "Erro interno ao atualizar o pedido." },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
