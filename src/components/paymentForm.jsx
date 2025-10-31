// src/components/PaymentForm.js
'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Clock, Loader2 } from 'lucide-react' 

// --- Mapeamento de Dados e Constantes (Mantido) ---
const formFields = { /* ... */ };
const methodTitles = { /* ... */ };
// [Conteúdo omitido para brevidade, mas você deve usar o mapeamento do código anterior]


// Componente Principal
export default function PaymentForm({ method, TOTAL_VENDA, onTransactionSuccess, isContextLoading }) {
  
  // CORREÇÃO: Garantir que 'total' seja um número (0 se TOTAL_VENDA for undefined/null)
  const total = TOTAL_VENDA || 0; 

  const [formData, setFormData] = useState({ 
    valorRecebido: total.toFixed(2) 
  }) 
  
  const [pixStatus, setPixStatus] = useState('Pendente');
  
  // O form é desabilitado se o Contexto estiver finalizando a venda OU se o Pix estiver processando internamente
  const isFormDisabled = isContextLoading || (method === 'PIX' && pixStatus === 'Processando');

  const title = methodTitles[method] || 'Método de Pagamento';
  const fields = formFields[method] || [];


  // Esta função agora APENAS chama o callback do pai (Pagamento.js)
  const finishTransactionFrontend = (data, methodType) => {
    // onTransactionSuccess espera: (detalhesPagamento, metodo)
    onTransactionSuccess(data, methodType);
  };


  // --- Efeito para Simulação do Pix (10 segundos) ---
  useEffect(() => {
    let timer;

    if (method === 'PIX' && pixStatus === 'Processando') {
      timer = setTimeout(() => {
        setPixStatus('Confirmado');
        // Chama a função para iniciar a transação real (o pai chamará a API)
        finishTransactionFrontend(formData, 'PIX');
      }, 10000); 
    }

    return () => clearTimeout(timer);
  }, [method, pixStatus, formData, finishTransactionFrontend]);


  const handleChange = (e) => {
      setFormData({
          ...formData,
          [e.target.id]: e.target.value
      })
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    
    // PIX: Apenas inicia o timer
    if (method === 'PIX') {
        if (pixStatus === 'Pendente') {
            setPixStatus('Processando');
        }
        return; 
    }
    
    // Outros: Chama a função para iniciar a transação real
    finishTransactionFrontend(formData, method);
  }

  // Lógica de cálculo do troco para DINHEIRO
  const troco = useMemo(() => {
    if (method !== 'DINHEIRO') return 0;
    const recebido = parseFloat(formData.valorRecebido) || 0;
    return recebido > total ? recebido - total : 0; 
  }, [formData.valorRecebido, method, total]);


  // --- Conteúdo Específico (Renderização) ---
  const renderContent = () => {

    // --- Caso PIX ---
    if (method === 'PIX') {
        let statusIcon, statusText, statusColor;
        // ... (Lógica de status PIX e renderização de ícones/QR Code) ...
        
        return (
          <div className="text-center">
            {/* ... Conteúdo PIX (Status, QR Code, Copia e Cola) ... */}
            
            {/* Botão de simulação/confirmação */}
            {pixStatus === 'Pendente' && (
                <Button 
                    className="w-full mt-4" 
                    onClick={handleSubmit}
                    disabled={isFormDisabled}
                >
                    Simular Pagamento (Iniciar Timer)
                </Button>
            )}
            
            {pixStatus === 'Processando' && (
                 <Button className="w-full mt-4" disabled>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Aguardando Confirmação...
                </Button>
            )}

            {pixStatus === 'Confirmado' && (
                <Button 
                    className="w-full mt-4 bg-green-600 hover:bg-green-700" 
                    onClick={() => finishTransactionFrontend(formData, method)} 
                    disabled={isFormDisabled}
                >
                    Venda Concluída!
                </Button>
            )}

          </div>
        )
    }

    // --- Caso DINHEIRO ---
    if (method === 'DINHEIRO') {
         return (
             <form onSubmit={handleSubmit} className="space-y-4">
                {/* ... Campos de Valor Recebido ... */}
                <p className={`text-2xl font-bold text-center mt-6 ${troco > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                    Troco: R$ {troco.toFixed(2)}
                </p>
                
                <Button 
                    type="submit" 
                    className="w-full"
                    // Verifica se o valor recebido é suficiente E se o Contexto está ocupado
                    disabled={parseFloat(formData.valorRecebido) < total || isContextLoading} 
                >
                    {isContextLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Finalizar Venda
                </Button>
            </form>
        );
    }

    // --- Casos Cartão e Boleto ---
    if (method === 'BOLETO' || method === 'CARTAO_CREDITO' || method === 'CARTAO_DEBITO') {
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ... Campos do Cartão/Boleto ... */}
            <Button type="submit" className="w-full" disabled={isContextLoading}>
                {isContextLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Pagar com {method === 'CARTAO_CREDITO' ? 'Crédito' : method === 'CARTAO_DEBITO' ? 'Débito' : 'Boleto'}
            </Button>
          </form>
        )
    }

    return <p className="text-red-500 font-semibold text-center">Erro: Método de pagamento "{method}" não suportado.</p>
  }

  return (
    <div className="flex justify-center w-full">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  )
}