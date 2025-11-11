"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaymentForm from "@/components/paymentForm";
import { useCarrinho } from "@/contexts/CarrinhoContext";
import { useRouter } from "next/navigation";
import { getLoggedUser } from "@/lib/auth-client";
import { AlertCircle } from "lucide-react";

// Métodos de pagamento disponíveis
const paymentMethods = [
  { id: "PIX", label: "Pix" },
  { id: "CARTAO_DEBITO", label: "Cartão de Débito" },
  { id: "CARTAO_CREDITO", label: "Cartão de Crédito" },
  { id: "BOLETO", label: "Boleto" },
  { id: "DINHEIRO", label: "Dinheiro" },
];

const methodTitles = {
  PIX: "Pagamento via Pix",
  CARTAO_DEBITO: "Cartão de Débito",
  CARTAO_CREDITO: "Cartão de Crédito",
  BOLETO: "Boleto",
  DINHEIRO: "Dinheiro",
};

export default function Pagamento() {
  const router = useRouter();
  const { isFinalizandoVenda, finalizarVenda } = useCarrinho();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); //  Estado de carregamento
  const [error, setError] = useState(null); //  Estado de erro

  //  BUSCA O TOTAL REAL DO CARRINHO DIRETAMENTE DA API
  useEffect(() => {
    const fetchCarrinhoTotal = async () => {
      try {
        setLoading(true);
        const user = getLoggedUser();
        if (!user) {
          setError("Usuário não autenticado!");
          setLoading(false);
          return;
        }

        const res = await fetch(`/api/carrinho?usuarioId=${user.id}&lojaId=${user.loja_id}`);
        const data = await res.json();

        if (res.ok && data.total !== undefined) {
          setTotal(parseFloat(data.total));
          setError(null);
        } else {
          setError("Nenhuma venda aberta encontrada.");
          setTotal(0);
        }
      } catch (err) {
        console.error("Erro ao buscar carrinho:", err);
        setError("Erro ao carregar informações do carrinho.");
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };

    fetchCarrinhoTotal();
  }, []);

  //  Quando o pagamento termina
  const finishTransaction = async (detalhesPagamento, metodo) => {
    try {
      const codigoVenda = await finalizarVenda(metodo, detalhesPagamento);
      setSuccessMessage({ id: codigoVenda, metodo });
      setSelectedMethod(null);
    } catch (error) {
      console.error("❌ Falha na Venda:", error);
    }
  };

  const handleSelectMethod = (methodId) => {
    if (total <= 0) return;
    setSelectedMethod(methodId);
    setSuccessMessage(null);
  };

  const startNewSale = () => {
    setSuccessMessage(null);
    router.push("/caixa");
  };

  //  ESTADO DE CARREGAMENTO
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  //  ESTADO DE ERRO
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p className="text-lg text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="rounded-xl">
          Tentar Novamente
        </Button>
      </div>
    );
  }

  //  1. Tela de sucesso
  if (successMessage) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg shadow-2xl border-green-500 border-4 rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-green-600">
              ✅ Pagamento Concluído!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg">Transação finalizada com sucesso.</p>
            <p className="text-2xl font-bold text-gray-800">
              Código da Venda: #{successMessage.id}
            </p>
            <p className="text-md text-gray-600">
              Método de Pagamento: {methodTitles[successMessage.metodo]}
            </p>
            <Button onClick={startNewSale} className="w-full mt-4 text-lg rounded-xl">
              Iniciar Nova Venda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  //  2. Tela do formulário do método
  if (selectedMethod) {
    return (
      <div className="min-h-screen p-4">
        <Button
          variant="ghost"
          onClick={() => setSelectedMethod(null)}
          className="mb-6 rounded-xl"
          disabled={isFinalizandoVenda}
        >
          &larr; Voltar aos Métodos
        </Button>
        <PaymentForm
          method={selectedMethod}
          TOTAL_VENDA={total}
          onTransactionSuccess={finishTransaction}
          isContextLoading={isFinalizandoVenda}
        />
      </div>
    );
  }

  //  3. Tela inicial de seleção de método
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center">
        Selecione o método de pagamento:
      </h1>

      <p className="text-xl mb-10 font-medium">
        Total da Venda:{" "}
        <strong className="text-green-600">R$ {total.toFixed(2)}</strong>
      </p>

      {total <= 0 ? (
        <Card className="p-6 text-center w-full max-w-sm rounded-xl shadow-lg">
          <p className="text-xl text-red-500 font-bold mb-4">🛒 Carrinho vazio!</p>
          <Button onClick={() => router.push("/caixa")} className="mt-4 rounded-xl">
            Voltar e adicionar itens
          </Button>
        </Card>
      ) : (
        paymentMethods.map((method) => (
          <Button
            key={method.id}
            onClick={() => handleSelectMethod(method.id)}
            className="text-lg font-bold w-full sm:w-80 px-6 py-3 my-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {method.label}
          </Button>
        ))
      )}
    </div>
  );
}
