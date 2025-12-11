"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react";
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

export default function PaymentForm({ method, TOTAL_VENDA }) {
  const router = useRouter();
  const total = TOTAL_VENDA || 0;

  const [formData, setFormData] = useState({ valorRecebido: total.toFixed(2), troco: 0 });
  const [pixStatus, setPixStatus] = useState("Pendente"); // "Pendente" | "Processando" | "Confirmado" | "Expirado"
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [countdown, setCountdown] = useState(10);

  const fields = formFields[method] || [];
  const title = methodTitles[method] || "Método de Pagamento";

  // --- Pegar usuário logado ---
  useEffect(() => {
    const user = getLoggedUser();
    if (user) setUserData(user);
  }, []);

  // --- Função Finalizar Venda ---
  
const API_URL = typeof window !== "undefined" ? window.location.origin : "";


const finalizarVenda = async (data, methodType) => {


  try {
    setIsLoading(true);

    // Agora userData vem do estado, não do sessionStorage
    if (!userData) {
      alert("Usuário não autenticado");
      return;
    }


    // BUSCAR CARRINHO
    const resCarrinho = await fetch(
      `${API_URL}/api/carrinho?usuarioId=${userData.id}&lojaId=${userData.loja_id}`,
      { credentials: "include" }
    );

    const carrinhoData = await resCarrinho.json();

    if (!resCarrinho.ok || !carrinhoData.itens?.length) {
      alert("Carrinho vazio");
      return;
    }

    const itensCarrinho = carrinhoData.itens.map((item) => ({
      produto_id: item.produto.id,
      quantidade: item.quantidade,
      preco_unitario: item.preco_venda,
      subtotal: item.quantidade * item.preco_venda,
      pedidos: item.pedidos || "",
    }));

    const payload = {
      usuarioId: userData.id,
      lojaId: userData.loja_id,
      itensCarrinho,
      tipoPagamento: methodType,
      detalhesPagamento: {
        ...data,
        valorRecebido: parseFloat(formData.valorRecebido) || 0,
        troco: troco,
      },
    };

// FINALIZAR VENDA
const res = await fetch(`${API_URL}/api/venda/finalizar`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  body: JSON.stringify(payload),
});

if (!res.ok) throw new Error("Erro ao finalizar venda");

const blob = await res.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement("a");

a.href = url;
a.download = `nota_fiscal.pdf`;
a.click();

alert("Venda concluída!");
router.push("/caixa");



  } catch (err) {
    console.error("❌ ERRO:", err);
    alert("Erro ao finalizar venda");
  } finally {
    setIsLoading(false);
  }
};



  // --- Código PIX ---


  const pixCode =
    "00020126360014BR.GOV.BCB.PIX0114+55119999999952040000530398654045.005802BR5925NOME DO RECEBEDOR6009SAO PAULO62070503***6304ABCD";

  <p className="text-center text-lg"> Total: <strong className="text-green-600">R$ {total.toFixed(2)}</strong></p>

  // --- Contagem regressiva PIX ---
  useEffect(() => {
    let timer;
    if (method === "PIX" && pixStatus === "Processando") {
      setCountdown(10);
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPixStatus("Expirado");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [pixStatus, method]);


// --- Simulação de pagamento PIX ---
 useEffect(() => {
 if (method === "PIX" && pixStatus === "Processando") {
 const confirmTimeout = setTimeout(() => {
 // Apenas tenta finalizar a venda. O status visual só muda
 // se a finalização na API for bem-sucedida (o que não ocorre aqui).
 finalizarVenda({}, "PIX");
 }, 5000);
 return () => clearTimeout(confirmTimeout);
 }
 }, [pixStatus, method]);


  // --- Lógica de envio ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (method === "PIX") {
      if (pixStatus === "Pendente") setPixStatus("Processando");
      return;
    }
    finalizarVenda(formData, method);
  };

  // --- Troco ---
  const troco = useMemo(() => {
    if (method !== "DINHEIRO") return 0;
    const recebido = parseFloat(formData.valorRecebido) || 0;
    const calculado = recebido > total ? recebido - total : 0;
    setFormData((prev) => ({ ...prev, troco: calculado }));
    return calculado;
  }, [formData.valorRecebido, total, method]);

  // --- Renderização PIX ---

  const renderPix = () => {
    let statusColor = "text-darkgray-500";
    let statusText = "Aguardando Pagamento...";
    let icon = <Clock className="w-12 h-12 text-darkgray-500" />;

    if (pixStatus === "Processando") {
      statusColor = "text-yellow-600";
      statusText = `Processando pagamento... (${countdown}s)`;
      icon = <Loader2 className="w-12 h-12 text-yellow-600 animate-spin" />;
    } else if (pixStatus === "Confirmado") {
      statusColor = "text-green-600";
      statusText = "Pagamento Confirmado!";
      icon = <CheckCircle className="w-12 h-12 text-green-600" />;
    } else if (pixStatus === "Expirado") {
      statusColor = "text-red-600";
      statusText = "⏰ Tempo esgotado! Tente novamente.";
      icon = <XCircle className="w-12 h-12 text-red-600" />;
    }

    return (
      <div className="text-center">

         <p className="text-xl m-5 font-semibold">
          Total: <strong className="text-2xl font-extrabold"> R$ {total.toFixed(2)}</strong>
        </p>

        <h3 className={`text-xl font-bold ${statusColor}`}>{statusText}</h3>
        <div className="flex justify-center">{icon}</div>

        {pixStatus !== "Confirmado" && pixStatus !== "Expirado" && (
          <>
            <div className="flex justify-center my-4">
              <div className="p-3 bg-white border-4 rounded-lg shadow">
                <QRCodeCanvas value={pixCode} size={200} />
              </div>
            </div>
            <Input readOnly value={pixCode} className="font-mono text-lg font-semibold" />
            <Button className="w-full text-lg font-bold mt-2" onClick={() => navigator.clipboard.writeText(pixCode)}>
              Copiar Código
            </Button>
          </>
        )}

        {pixStatus === "Pendente" && (
          <Button className="w-full text-lg font-bold mt-4" onClick={handleSubmit}>
            Simular Pagamento (Iniciar)
          </Button>
        )}
        {pixStatus === "Processando" && (
          <Button disabled className="w-full mt-4">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Aguardando...
          </Button>
        )}
        {pixStatus === "Expirado" && (
          <Button className="w-full text-lg font-bold mt-4" onClick={() => setPixStatus("Pendente")}>
            Tentar Novamente
          </Button>
        )}
      </div>
    );
  };

  // --- Render Principal ---
  return (
    <div className="flex justify-center w-full">
      <Card  className="w-full max-w-lg mx-auto
             bg-transparent rounded-xl
             backdrop-blur-md
             shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
             dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
             transition-all duration-300">
        <CardHeader>
          <br></br>
          <CardTitle className="text-4xl font-bold text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {method === "PIX" ? (
            renderPix()
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <p className="text-center font-semibold text-xl m-5">
                Total: <strong className="text-2xl font-extrabold">R${total.toFixed(2)}</strong>
              </p>

              <div className="space-y-5">
                {fields.map((f) => (
                  <div key={f.id} className="space-y-2">
                    <Label htmlFor={f.id} className="text-lg font-semibold">
                      {f.label}
                    </Label>
                    <Input
                      id={f.id}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={formData[f.id] || ""}
                      onChange={(e) => setFormData({ ...formData, [e.target.id]: e.target.value })}
                      disabled={isLoading}
                      className="text-lg"
                    />
                  </div>
                ))}

                {method === "DINHEIRO" && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="valorRecebido" className="text-lg font-bold mb-3">
                        Valor Recebido
                      </Label>
                     
                      <Input
                        id="valorRecebido"
                        type="number"
                        step="0.01"
                        value={formData.valorRecebido}
                        className="font-bold text-xl"
                        onChange={(e) =>
                          setFormData({ ...formData, valorRecebido: e.target.value })
                         
                        }
                      />
                    </div>
                    <p className="text-center font-semibold text-xl">
                      Troco: <span className="font-bold text-2x1 font-extrabold">
                        <br></br>
                        R$ {troco.toFixed(2)}</span>
                    </p>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full py-2 text-base" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 text-lg font-bold animate-spin" />}
               <p className="text-lg font-bold"> Finalizar Venda </p>
              </Button>
            </form>
          )}
        </CardContent>
        <br></br>
      </Card>
    </div>
  );
}
