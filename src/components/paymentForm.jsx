"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, Loader2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { getLoggedUser } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

// --- Configurações de campos e textos ---
const formFields = {
  CARTAO_DEBITO: [
    { id: "cardNumber", label: "Número do Cartão", type: "text", placeholder: "xxxx xxxx xxxx xxxx" },
    { id: "cardName", label: "Nome no Cartão", type: "text", placeholder: "Nome impresso" },
    { id: "expiryDate", label: "Validade (MM/AA)", type: "text", placeholder: "MM/AA" },
    { id: "cvv", label: "CVV", type: "password", placeholder: "***" },
  ],
  CARTAO_CREDITO: [
    { id: "cardNumber", label: "Número do Cartão", type: "text", placeholder: "xxxx xxxx xxxx xxxx" },
    { id: "cardName", label: "Nome no Cartão", type: "text", placeholder: "Nome impresso" },
    { id: "expiryDate", label: "Validade (MM/AA)", type: "text", placeholder: "MM/AA" },
    { id: "cvv", label: "CVV", type: "password", placeholder: "***" },
  ],
  BOLETO: [{ id: "cpfCnpj", label: "CPF ou CNPJ", type: "text", placeholder: "000.000.000-00" }],
};

const methodTitles = {
  PIX: "Pagamento via Pix",
  CARTAO_DEBITO: "Pagamento com Cartão de Débito",
  CARTAO_CREDITO: "Pagamento com Cartão de Crédito",
  BOLETO: "Pagamento com Boleto",
  DINHEIRO: "Pagamento em Dinheiro",
};

// --- Componente Principal ---
export default function PaymentForm({ method, TOTAL_VENDA }) {
  const router = useRouter();

  
  const total = TOTAL_VENDA || 0;
  const [formData, setFormData] = useState({ valorRecebido: total.toFixed(2) });
  const [pixStatus, setPixStatus] = useState("Pendente");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const fields = formFields[method] || [];
  const title = methodTitles[method] || "Método de Pagamento";

  //  Pegar usuário logado
  useEffect(() => {
    const user = getLoggedUser();
    if (user) setUserData(user);
  }, []);

  // ---  Função Finalizar Venda no Servidor ---
const finalizarVenda = async (data, methodType) => {
  try {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (!token || !userData) return alert("Usuário não autenticado");

    // Pega o carrinho
    const resCarrinho = await fetch(`/api/carrinho?usuarioId=${userData.id}&lojaId=${userData.loja_id}`);
    const carrinhoData = await resCarrinho.json();
    if (!resCarrinho.ok || !carrinhoData.itens?.length) return alert("Carrinho vazio");

    const itensCarrinho = carrinhoData.itens.map(item => ({
      produto_id: item.produto.id,
      quantidade: item.quantidade,
      preco_unitario: item.preco_venda,
      subtotal: item.quantidade * item.preco_venda,
      pedidos: item.pedidos || "",
    }));

    const payload = {
      usuarioId: userData.id,
      lojaId: userData.loja_id,
      caixaId: 1, // ou pegar dinamicamente o caixa aberto
      itensCarrinho,
      tipoPagamento: methodType,
      detalhesPagamento: data,
    };

    const res = await fetch("/api/venda/finalizar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Erro ao finalizar venda");
    alert("✅ Venda concluída com sucesso!");
    router.push("/caixa");
  } catch (err) {
    console.error("Erro ao finalizar venda:", err);
    alert("❌ Falha ao finalizar venda.");
  } finally {
    setIsLoading(false);
  }
};

  // ---  QR Code PIX ---
  const pixCode =
    "00020126360014BR.GOV.BCB.PIX0114+55119999999952040000530398654045.005802BR5925NOME DO RECEBEDOR6009SAO PAULO62070503***6304ABCD";

  // ---  Simulação do PIX (10s) ---
  useEffect(() => {
    let timer;
    if (method === "PIX" && pixStatus === "Processando") {
      timer = setTimeout(() => {
        setPixStatus("Confirmado");
        finalizarVenda(formData, "PIX");
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [pixStatus, method]);

  // ---  Lógica de exibição ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (method === "PIX") {
      if (pixStatus === "Pendente") setPixStatus("Processando");
      return;
    }
    finalizarVenda(formData, method);
  };

  const troco = useMemo(() => {
    if (method !== "DINHEIRO") return 0;
    const recebido = parseFloat(formData.valorRecebido) || 0;
    return recebido > total ? recebido - total : 0;
  }, [formData.valorRecebido, total, method]);

  // ---  Renderização do método PIX ---
  const renderPix = () => {
    let statusColor = "text-gray-500";
    let statusText = "Aguardando Pagamento...";
    let icon = <Clock className="w-12 h-12 text-gray-500" />;

    if (pixStatus === "Processando") {
      statusColor = "text-yellow-600";
      statusText = "Processando (10s)...";
      icon = <Loader2 className="w-12 h-12 text-yellow-600 animate-spin" />;
    } else if (pixStatus === "Confirmado") {
      statusColor = "text-green-600";
      statusText = "Pagamento Confirmado!";
      icon = <CheckCircle className="w-12 h-12 text-green-600" />;
    }

    return (
      <div className="text-center space-y-4">
        <h3 className={`text-xl font-bold ${statusColor}`}>{statusText}</h3>
        <div className="flex justify-center">{icon}</div>
        {pixStatus !== "Confirmado" && (
          <>
            <div className="flex justify-center my-4">
              <div className="p-2 bg-white border-4 border-yellow-500 rounded-lg">
                <QRCodeCanvas value={pixCode} size={180} />
              </div>
            </div>
            <Input readOnly value={pixCode} className="font-mono text-xs" />
            <Button
              className="w-full mt-2"
              onClick={() => navigator.clipboard.writeText(pixCode)}
            >
              Copiar Código
            </Button>
          </>
        )}

        {pixStatus === "Pendente" && (
          <Button className="w-full mt-4" onClick={handleSubmit}>
            Simular Pagamento (Iniciar)
          </Button>
        )}

        {pixStatus === "Processando" && (
          <Button disabled className="w-full mt-4">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aguardando...
          </Button>
        )}
      </div>
    );
  };

  // ---  Render Principal ---
  
  return (
    <div className="flex justify-center w-full">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {method === "PIX" ? (
            renderPix()
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-gray-600">
                Total: <strong>R$ {total.toFixed(2)}</strong>
              </p>
              {fields.map((f) => (
                <div key={f.id} className="space-y-1">
                  <Label htmlFor={f.id}>{f.label}</Label>
                  <Input
                    id={f.id}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={formData[f.id] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [e.target.id]: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
              ))}
              {method === "DINHEIRO" && (
                <p className="font-bold text-green-600 text-center">
                  Troco: R$ {troco.toFixed(2)}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Finalizar Venda
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
