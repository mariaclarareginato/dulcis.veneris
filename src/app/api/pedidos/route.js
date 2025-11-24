// app/api/pedidos/route.js (POST)

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch (error) {
        await prisma.$disconnect();
        return NextResponse.json({ error: 'Formato JSON inválido.' }, { status: 400 });
    }

    const { loja_id, usuario_id, items } = body;

    if (!loja_id || !usuario_id || !items || items.length === 0) {
        await prisma.$disconnect();
        return NextResponse.json({ error: 'Dados incompletos (loja_id, usuario_id e items são obrigatórios).' }, { status: 400 });
    }

    try {
        // 1. Verificação de Autorização
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuario_id },
            select: { perfil: true, loja_id: true }
        });

        if (!usuario || (usuario.perfil !== 'GERENTE' && usuario.perfil !== 'ADMIN') || usuario.loja_id !== loja_id) {
            return NextResponse.json({ error: 'Ação não autorizada para este perfil/loja.' }, { status: 403 });
        }
        
        // 2. OTIMIZAÇÃO: Buscar os IDs dos produtos
        const produtosDisponiveis = await prisma.produto.findMany({
            where: {
                nome: { in: items.map(item => item.produto_nome) }
            },
            select: { id: true, nome: true }
        });

        const produtoMap = new Map(produtosDisponiveis.map(p => [p.nome, p.id]));

        // 3. Mapear os itens para inclusão (com produto_id)
        const itensParaCriar = items.map(item => {
            // Se o item do payload JÁ tem produtoId (vindo do frontend), use-o. 
            // Senão, tente buscar pelo nome, ou use null.
            const produto_id = item.produto_id || produtoMap.get(item.produto_nome) || null;
            
            return {
                produto_nome: item.produto_nome,
                quantidade: item.quantidade,
                produto_id: produto_id, 
            };
        });

        // 4. Criação do Pedido
        const novoPedido = await prisma.pedido.create({
            data: {
                loja_id: loja_id,
                usuario_id: usuario_id,
                itens_pedido: {
                    createMany: {
                        data: itensParaCriar,
                    },
                },
            },
            include: {
                itens_pedido: true, 
            },
        });

        return NextResponse.json(novoPedido, { status: 201 });

    } catch (error) {
        console.error("Erro ao processar pedido:", error);
        return NextResponse.json({ error: 'Erro interno do servidor ao enviar o pedido.' }, { status: 500 });
    } finally {
        await prisma.$disconnect(); 
    }
}

// Mantendo o GET para que o arquivo possa ser usado pela Matriz também.
export async function GET(request) {
    // ... Código do GET para listar pedidos (assumindo que já foi implementado) ...
    // Se o GET ainda não foi implementado, remova este bloco ou adicione-o.
    return NextResponse.json({ message: "Método GET não implementado neste arquivo." }, { status: 405 }); 
}