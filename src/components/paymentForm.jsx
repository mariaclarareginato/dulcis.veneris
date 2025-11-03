// src/components/PaymentForm.js
"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, Loader2 } from "lucide-react";

// --- Mapeamento de Dados e Constantes ---
const formFields = {
  CARTAO_DEBITO: [
    {
      id: "cardNumber",
      label: "Número do Cartão",
      type: "text",
      placeholder: "xxxx xxxx xxxx xxxx",
    },
    {
      id: "cardName",
      label: "Nome no Cartão",
      type: "text",
      placeholder: "Nome impresso",
    },
    {
      id: "expiryDate",
      label: "Validade (MM/AA)",
      type: "text",
      placeholder: "MM/AA",
    },
    { id: "cvv", label: "CVV", type: "password", placeholder: "***" },
  ],
  CARTAO_CREDITO: [
    {
      id: "cardNumber",
      label: "Número do Cartão",
      type: "text",
      placeholder: "xxxx xxxx xxxx xxxx",
    },
    {
      id: "cardName",
      label: "Nome no Cartão",
      type: "text",
      placeholder: "Nome impresso",
    },
    {
      id: "expiryDate",
      label: "Validade (MM/AA)",
      type: "text",
      placeholder: "MM/AA",
    },
    { id: "cvv", label: "CVV", type: "password", placeholder: "***" },
  ],
  BOLETO: [
    {
      id: "cpfCnpj",
      label: "CPF ou CNPJ",
      type: "text",
      placeholder: "000.000.000-00",
    },
  ],
};

const methodTitles = {
  PIX: "Pagamento via Pix",
  CARTAO_DEBITO: "Pagamento com Cartão de Débito",
  CARTAO_CREDITO: "Pagamento com Cartão de Crédito",
  BOLETO: "Pagamento com Boleto",
  DINHEIRO: "Pagamento em Dinheiro (Troco)",
};

// --- Componente Principal ---
export default function PaymentForm({
  method,
  TOTAL_VENDA,
  onTransactionSuccess,
  isContextLoading,
}) {
  // CORREÇÃO: Garantir que 'total' seja um número
  const total = TOTAL_VENDA || 0;

  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    valorRecebido: total.toFixed(2),
  });

  // Estado para o Pix
  const [pixStatus, setPixStatus] = useState("Pendente");

  // O form é desabilitado se o Contexto estiver finalizando a venda OU se o Pix estiver processando
  const isFormDisabled =
    isContextLoading || (method === "PIX" && pixStatus === "Processando");

  const title = methodTitles[method] || "Método de Pagamento";
  const fields = formFields[method] || [];

  // CORREÇÃO: useCallback para evitar dependência circular
  const finishTransactionFrontend = useCallback(
    (data, methodType) => {
      if (onTransactionSuccess) {
        onTransactionSuccess(data, methodType);
      }
    },
    [onTransactionSuccess]
  );

  // --- Efeito para Simulação do Pix (10 segundos) ---
  useEffect(() => {
    let timer;

    if (method === "PIX" && pixStatus === "Processando") {
      timer = setTimeout(() => {
        setPixStatus("Confirmado");
        // Não chama automaticamente - usuário clica em "Venda Concluída"
      }, 10000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [method, pixStatus]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // Lógica de Submissão Geral
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // Tratamento especial para PIX (apenas inicia o timer/processamento)
    if (method === "PIX") {
      if (pixStatus === "Pendente") {
        setPixStatus("Processando");
      }
      return;
    }

    // Para todos os outros métodos: submete diretamente
    finishTransactionFrontend(formData, method);
  };

  // Lógica de cálculo do troco para DINHEIRO
  const troco = useMemo(() => {
    if (method !== "DINHEIRO") return 0;
    const recebido = parseFloat(formData.valorRecebido) || 0;
    return recebido > total ? recebido - total : 0;
  }, [formData.valorRecebido, method, total]);

  // --- Conteúdo Específico (Renderização) ---
  const renderContent = () => {
    // --- Caso PIX ---
    if (method === "PIX") {
      let statusIcon, statusText, statusColor;

      if (pixStatus === "Pendente") {
        statusIcon = <Clock className="w-12 h-12 text-gray-500" />;
        statusText = "Aguardando Escaneamento";
        statusColor = "text-gray-500";
      } else if (pixStatus === "Processando") {
        statusIcon = (
          <Loader2 className="w-12 h-12 text-yellow-600 animate-spin" />
        );
        statusText = "Processando Pagamento (10s)...";
        statusColor = "text-yellow-600";
      } else {
        // Confirmado
        statusIcon = <CheckCircle className="w-12 h-12 text-green-600" />;
        statusText = "Pagamento Confirmado!";
        statusColor = "text-green-600";
      }

      return (
        <div className="text-center">
          <h3 className={`text-xl font-bold mb-4 ${statusColor}`}>
            {statusText}
          </h3>
          <div className="flex justify-center mb-6">{statusIcon}</div>
          <p className="mb-4 text-gray-600">
            Total a Pagar:{" "}
            <span className="font-bold text-lg">R$ {total.toFixed(2)}</span>
          </p>

          {/* QR Code e Botão só são visíveis se o pagamento não foi confirmado */}
          {pixStatus !== "Confirmado" && (
            <>
              <div className="w-40 h-40 mx-auto border-4 border-primary p-2 rounded-lg bg-gray-100 flex items-center justify-center">
                <p className="text-sm font-bold text-gray-700">
                  QR Code Simulando
                  {/* substituir por uma imagem */}
                </p>
              </div>
              <Separator className="my-6" />
              <div className="space-y-2">
                <Label htmlFor="pixCode">Código Pix Copia e Cola</Label>
                <Input
                  id="pixCode"
                  readOnly
                  value="123456789ABCDEF..."
                  className="font-mono text-xs cursor-text"
                />
                <Button
                  onClick={() =>
                    navigator.clipboard.writeText("123456789ABCDEF...")
                  }
                  className="w-full mt-2"
                  disabled={pixStatus !== "Pendente"}
                >
                  Copiar Código
                </Button>
              </div>
            </>
          )}

          {/* Botão de simulação/confirmação */}
          {pixStatus === "Pendente" && (
            <Button
              className="w-full mt-4"
              onClick={handleSubmit}
              disabled={isFormDisabled}
            >
              Simular Pagamento (Iniciar Timer)
            </Button>
          )}

          {pixStatus === "Processando" && (
            <Button className="w-full mt-4" disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Aguardando Confirmação...
            </Button>
          )}

          {pixStatus === "Confirmado" && (
            <Button
              className="w-full mt-4 bg-green-600 hover:bg-green-700"
              onClick={() => finishTransactionFrontend(formData, method)}
              disabled={isFormDisabled}
            >
              {isContextLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Venda Concluída!
            </Button>
          )}
        </div>
      );
    }

    // --- Caso DINHEIRO ---
    if (method === "DINHEIRO") {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <p className="font-semibold text-lg">
              Total da Venda:{" "}
              <span className="font-bold text-primary">
                R$ {total.toFixed(2)}
              </span>
            </p>
            <Separator className="my-4" />
            <Label htmlFor="valorRecebido">Valor Recebido do Cliente</Label>
            <Input
              id="valorRecebido"
              type="number"
              placeholder="0.00"
              step="0.01"
              value={formData.valorRecebido}
              onChange={handleChange}
              disabled={isFormDisabled}
            />
          </div>

          <p
            className={`text-2xl font-bold text-center mt-6 ${
              troco > 0 ? "text-green-600" : "text-gray-500"
            }`}
          >
            Troco: R$ {troco.toFixed(2)}
          </p>

          <Button
            type="submit"
            className="w-full"
            disabled={
              parseFloat(formData.valorRecebido) < total || isContextLoading
            }
          >
            {isContextLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Finalizar Venda
          </Button>
        </form>
      );
    }

    // --- Casos Cartão e Boleto ---
    if (
      method === "BOLETO" ||
      method === "CARTAO_CREDITO" ||
      method === "CARTAO_DEBITO"
    ) {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="mb-4 text-gray-600">
            Total a Pagar:{" "}
            <span className="font-bold text-lg">R$ {total.toFixed(2)}</span>
          </p>
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input
                id={field.id}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.id] || ""}
                onChange={handleChange}
                disabled={isFormDisabled}
              />
            </div>
          ))}
          {method === "CARTAO_CREDITO" && (
            <div className="space-y-2">
              <Label htmlFor="installments">Parcelas</Label>
              <Input
                id="installments"
                type="number"
                defaultValue={1}
                min={1}
                max={12}
                value={formData.installments || 1}
                onChange={handleChange}
                disabled={isFormDisabled}
              />
            </div>
          )}
          <Button type="submit" className="w-full" disabled={isContextLoading}>
            {isContextLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Pagar com{" "}
            {method === "CARTAO_CREDITO"
              ? "Crédito"
              : method === "CARTAO_DEBITO"
              ? "Débito"
              : "Boleto"}
          </Button>
        </form>
      );
    }

    return (
      <p className="text-red-500 font-semibold text-center">
        Erro: Método de pagamento "{method}" não suportado.
      </p>
    );
  };

  // --- Renderização Principal ---
  return (
    <div className="flex justify-center w-full">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-extrabold text-center">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </div>
  );
}
