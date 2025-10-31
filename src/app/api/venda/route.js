// pages/api/venda/finalizar.js

import { PrismaClient } from '@prisma/client'
import { generateRandomCode } from '../../../lib/utils' // Importa a função de gerar código

const prisma = new PrismaClient()

// Mapeamento de ENUMs para garantir que os valores vindo do frontend são válidos
const PAGAMENTO_TIPOS = {
  PIX: 'PIX',
  CARTAO_DEBITO: 'CARTAO_DEBITO',
  CARTAO_CREDITO: 'CARTAO_CREDITO',
  BOLETO: 'BOLETO',
  DINHEIRO: 'DINHEIRO',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  // Desestruturando os dados recebidos do frontend (PaymentForm.js)
  const { 
    tipoPagamento, 
    valorTotal, 
    detalhesPagamento, 
    caixaId, // Você precisa enviar o ID do caixa aberto!
    usuarioId, // Você precisa enviar o ID do usuário logado!
    lojaId, // Você precisa enviar o ID da loja!
    itensCarrinho, // Lista de { produto_id, quantidade, preco_unitario }
  } = req.body; 

  // Validação básica
  if (!caixaId || !usuarioId || !lojaId || !valorTotal || !PAGAMENTO_TIPOS[tipoPagamento]) {
    return res.status(400).json({ message: 'Dados da venda incompletos ou tipo de pagamento inválido.' });
  }

  // 1. GERAÇÃO DO CÓDIGO DE VENDA
  const codigoVenda = generateRandomCode(12);

  try {
    // Usamos uma transação para garantir que TUDO seja salvo ou NADA seja salvo.
    const resultadoTransacao = await prisma.$transaction(async (tx) => {
      
      // A. CRIAÇÃO DA VENDA
      const novaVenda = await tx.venda.create({
        data: {
          codigo_transacao: codigoVenda, // Nosso campo novo
          caixa_id: caixaId,
          usuario_id: usuarioId,
          loja_id: lojaId,
          data_hora: new Date(),
          total: valorTotal,
          status: 'CONCLUIDA', // Exemplo
        },
      });

      // B. CRIAÇÃO DOS ITENS DA VENDA E ATUALIZAÇÃO DO ESTOQUE
      const vendaItensPromises = itensCarrinho.map(item => {
        // 1. Cria o item
        const createItem = tx.vendaitem.create({
          data: {
            venda_id: novaVenda.id,
            produto_id: item.produto_id,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
            subtotal: item.quantidade * item.preco_unitario,
            pedidos: item.pedidos || null, 
          }
        });

        // 2. Atualiza o Estoque (decrementa)
        const updateEstoque = tx.estoque.updateMany({
            where: {
                produto_id: item.produto_id,
                loja_id: lojaId,
            },
            data: {
                quantidade: {
                    decrement: item.quantidade,
                },
            },
        });

        return [createItem, updateEstoque];
      }).flat();
      
      await Promise.all(vendaItensPromises);

      // C. CRIAÇÃO DO PAGAMENTO
      const novoPagamento = await tx.pagamento.create({
        data: {
          venda_id: novaVenda.id,
          tipo: tipoPagamento, // Valor do ENUM
          valor: valorTotal,
          detalhe: detalhesPagamento ? JSON.stringify(detalhesPagamento) : null,
        },
      });

      // D. (OPCIONAL) Atualização do saldo do Caixa
      // ... Lógica para adicionar valorTotal ao saldo do caixa ...

      return { venda: novaVenda, pagamento: novoPagamento };
    });

    // Envia a resposta de sucesso para o frontend
    return res.status(201).json({ 
      success: true, 
      message: 'Venda finalizada com sucesso!',
      vendaId: resultadoTransacao.venda.id, // O ID interno do Prisma
      codigoTransacao: codigoVenda, // O ID de 12 dígitos para o cliente
    });

  } catch (error) {
    console.error("Erro ao finalizar a transação:", error);
    return res.status(500).json({ message: 'Falha interna ao processar a venda.' });
  } finally {
    await prisma.$disconnect();
  }
}