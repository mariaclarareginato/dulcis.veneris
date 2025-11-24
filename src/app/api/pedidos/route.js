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
    // 1. Verificação de Autorização (Melhoria: Usa um único ID para a loja)
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuario_id },
        select: { perfil: true, loja_id: true }
    });

    // Verifica se o usuário existe, se tem perfil de gerente/admin E se ele está na loja correta
    if (!usuario || (usuario.perfil !== 'GERENTE' && usuario.perfil !== 'ADMIN') || usuario.loja_id !== loja_id) {
        return NextResponse.json({ error: 'Ação não autorizada para este perfil/loja.' }, { status: 403 });
    }
    
    // 2. OTIMIZAÇÃO CRUCIAL: Buscar os IDs dos produtos em uma única consulta
    const produtosDisponiveis = await prisma.produto.findMany({
        where: {
            nome: { in: items.map(item => item.produto_nome) }
        },
        select: { id: true, nome: true }
    });

    const produtoMap = new Map(produtosDisponiveis.map(p => [p.nome, p.id]));

    // 3. Mapear os itens para inclusão no pedido, adicionando o produto_id
    const itensParaCriar = items.map(item => {
        // Pega o ID com base no nome. Se não encontrar, produto_id será null.
        const produto_id = produtoMap.get(item.produto_nome);
        
        return {
            produto_nome: item.produto_nome,
            quantidade: item.quantidade,
            // Garante que o ID é adicionado. Se undefined (não encontrado), usa null
            produto_id: produto_id || null, 
        };
    });

    // 4. Criação do Pedido e Itens em transação
    const novoPedido = await prisma.pedido.create({
      data: {
        loja_id: loja_id,
        usuario_id: usuario_id,
        // O status será 'PENDENTE' por default
        itens_pedido: {
          createMany: {
            data: itensParaCriar, // Usando a lista com produto_id
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
    // Desconexão no finally para garantir que ocorra, mesmo em caso de erro
    await prisma.$disconnect(); 
  }
}

export async function GET(req) {
  // Desconexão do cliente Prisma antes de retornar a resposta
  await prisma.$disconnect();
  return NextResponse.json({ message: "Método GET não permitido" }, { status: 405 }); 
}