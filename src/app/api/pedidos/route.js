// app/api/pedidos/route.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  // O uso de `request.json()` é o padrão para Next.js App Router (v13+)
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: 'Formato JSON inválido.' }, { status: 400 });
  }

  const { loja_id, usuario_id, items } = body;

  if (!loja_id || !usuario_id || !items || items.length === 0) {
    return NextResponse.json({ error: 'Dados incompletos (loja_id, usuario_id e items são obrigatórios).' }, { status: 400 });
  }

  try {
    // 1. Opcional: Verificar se o usuario tem o perfil de GERENTE/ADMIN
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuario_id },
        select: { perfil: true, loja_id: true }
    });

    if (!usuario || (usuario.perfil !== 'GERENTE' && usuario.perfil !== 'ADMIN') || usuario.loja_id !== loja_id) {
        return NextResponse.json({ error: 'Ação não autorizada para este perfil/loja.' }, { status: 403 });
    }
    
    // 2. Transação para criar o Pedido e seus Itens
    const novoPedido = await prisma.pedido.create({
      data: {
        loja_id: loja_id,
        usuario_id: usuario_id,
        // Conecta/Cria todos os itens no modelo `itempedido`
        itens_pedido: {
          createMany: {
            data: items.map(item => ({
              produto_nome: item.produto_nome,
              quantidade: item.quantidade,
              // produto_id pode ser adicionado aqui se você fizer uma busca prévia na tabela `produto`
            })),
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

// Para usar a rota no App Router (Next.js 13+)
export const GET = (req) => NextResponse.json({ message: "Método GET não permitido" }, { status: 405 });