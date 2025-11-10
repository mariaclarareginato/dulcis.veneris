import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
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
    // 1. Opcional: Verificar se o usuario tem o perfil de GERENTE/ADMIN e se está na loja correta
    const usuario = await prisma.usuario.findUnique({
        where: { id: usuario_id },
        select: { perfil: true, loja_id: true }
    });

    if (!usuario || (usuario.perfil !== 'GERENTE' && usuario.perfil !== 'ADMIN') || usuario.loja_id !== loja_id) {
        return NextResponse.json({ error: 'Ação não autorizada para este perfil/loja.' }, { status: 403 });
    }
    
    // 2. Transação para criar o Pedido e seus Itens
    // O campo 'status' será automaticamente definido como PedidoStatus.PENDENTE
    // graças ao @default(PENDENTE) no schema.prisma.
    const novoPedido = await prisma.pedido.create({
      data: {
        loja_id: loja_id,
        usuario_id: usuario_id,
        // O status é default(PENDENTE) no schema, não precisa ser passado aqui.
        itens_pedido: {
          createMany: {
            data: items.map(item => ({
              produto_nome: item.produto_nome,
              quantidade: item.quantidade,
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
    // Adicione o log detalhado para debug no console do servidor
    console.error("Prisma error details:", error.message); 
    
    return NextResponse.json({ error: 'Erro interno do servidor ao enviar o pedido.' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export const GET = (req) => NextResponse.json({ message: "Método GET não permitido" }, { status: 405 });