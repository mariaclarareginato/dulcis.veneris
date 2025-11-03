
'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PaymentForm from '@/components/paymentForm'
import { useCarrinho } from '@/contexts/CarrinhoContext' // Puxando o Contexto
import { useRouter } from 'next/navigation'

// Mapeamento dos botões de interface para os valores do Enum Prisma

const paymentMethods = [
  { id: 'PIX', label: 'Pix' },
  { id: 'CARTAO_DEBITO', label: 'Cartão de Débito' },
  { id: 'CARTAO_CREDITO', label: 'Cartão de Crédito' },
  { id: 'BOLETO', label: 'Boleto' },
  { id: 'DINHEIRO', label: 'Dinheiro' }, 
]
const methodTitles = { /* ... (Mapeamento de títulos, usado na tela de sucesso) ... */ 
    PIX: 'Pagamento via Pix', CARTAO_DEBITO: 'Cartão de Débito', CARTAO_CREDITO: 'Cartão de Crédito', BOLETO: 'Boleto', DINHEIRO: 'Dinheiro',
}

export default function Pagamento () {
  const router = useRouter();

  //  DESTRUCTURING DO CONTEXTO: Puxando o total e a lógica de finalização

  const { total, isFinalizandoVenda, finalizarVenda } = useCarrinho();
  
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  


  // Esta função é o callback chamado pelo PaymentForm após a simulação/input
  const finishTransaction = async (detalhesPagamento, metodo) => {
    try {
        // Chama a função principal do Contexto que faz a chamada à API e reseta o carrinho
        const codigoVenda = await finalizarVenda(metodo, detalhesPagamento);
        
        // Se teve sucesso e retornou o código:
        setSuccessMessage({
            id: codigoVenda, // O código de 12 dígitos retornado pelo backend
            metodo: metodo,
        });
        setSelectedMethod(null);
        
    } catch (error) {
        // Exibe o erro
        alert(`❌ Falha na Venda: ${error.message}`);
    }
  }


  const handleSelectMethod = (methodId) => {
    if (total <= 0) return; 
    setSelectedMethod(methodId)
    setSuccessMessage(null); 
  }

  // Volta para a tela principal (Caixa/Produtos)
  const startNewSale = () => {
    setSuccessMessage(null);
    router.push('/'); 
  }

  // --- RENDERING ---

  // 1. Tela de Sucesso

  if (successMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg shadow-2xl border-green-500 border-4">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-green-600">✅ Pagamento Concluído!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg">Transação finalizada com sucesso.</p>
            <p className="text-2xl font-bold text-gray-800">
                Código da Venda: #{successMessage.id}
            </p>
            <p className="text-md text-gray-600">
                Método de Pagamento: {methodTitles[successMessage.metodo]}
            </p>
            <Button onClick={startNewSale} className="w-full mt-4 text-lg">
              Iniciar Nova Venda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 2. Formulário de Pagamento (Método Selecionado)

  if (selectedMethod) {
    return (
      <div className="min-h-screen p-4">
        <Button 
          variant="ghost" 
          onClick={() => setSelectedMethod(null)} 
          className="mb-6"
          disabled={isFinalizandoVenda}
        >
          &larr; Voltar aos Métodos
        </Button>
        <PaymentForm 
            method={selectedMethod} 
            TOTAL_VENDA={total} // Passando o total do Contexto
            onTransactionSuccess={finishTransaction}
            isContextLoading={isFinalizandoVenda} // Passando o estado de loading
        />
      </div>
    )
  }

  // 3. Seleção do Método (Tela Inicial)
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 text-center">
        Selecione o método de pagamento:
      </h1>
      <p className="text-xl mb-10 font-medium">Total: R$ {total.toFixed(2)}</p>

      {total <= 0 ? (
        <Card className="p-6 text-center">
             <p className="text-xl text-red-500 font-bold mb-4">🛒 Carrinho Vazio!</p>
             <Button onClick={() => router.push('/caixa')} className="mt-4">Voltar e Adicionar Itens</Button>
        </Card>
      ) : (
        paymentMethods.map((method) => (
            <Button 
            key={method.id}
            onClick={() => handleSelectMethod(method.id)}
            className="text-base sm:text-lg md:text-xl font-bold w-full sm:w-80 px-6 py-3 my-3 rounded-xl shadow-lg transition-all"
            >
            {method.label}
            </Button>
        ))
      )}
    </div>
  )
}