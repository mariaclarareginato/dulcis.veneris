"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLoggedUser } from "@/lib/auth-client"; 
import { AlertCircle, Plus, Send, X } from "lucide-react";

// Componentes shadcn/ui (assumindo que você tem eles em JS/JSX)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // Usando sonner para notificações

// Componente principal
export default function PedidosPage ({params}) {
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // item: { produtoNome: String, quantidade: Number, tempId: Number }
  const [pedidoItems, setPedidoItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({ produtoNome: "", quantidade: 1 });

  // 1. Lógica de Autenticação
  useEffect(() => {
    // Esta função deve retornar { id: 1, loja_id: 1, perfil: 'GERENTE', ... }
    const user = getLoggedUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUserData(user);
    setLoading(false);
  }, [router]);

  // 2. Funções de Manipulação de Itens
  const handleAddItem = () => {
    if (currentItem.produtoNome.trim() && currentItem.quantidade > 0) {
      setPedidoItems([
        ...pedidoItems,
        {
          tempId: Date.now(), 
          produtoNome: currentItem.produtoNome.trim(),
          quantidade: parseInt(currentItem.quantidade),
        },
      ]);
      setCurrentItem({ produtoNome: "", quantidade: 1 });
    } else {
      toast.error("Preencha o nome do produto e a quantidade corretamente.");
    }
  };

  const handleRemoveItem = (tempId) => {
    setPedidoItems(pedidoItems.filter((item) => item.tempId !== tempId));
  };

  // 3. Função de Envio do Pedido
  const handleSubmitPedido = async () => {
    if (pedidoItems.length === 0) {
      toast.error("O pedido não pode estar vazio.");
      return;
    }

    // Validação básica (Assumindo que getLoggedUser retorna os dados necessários)
    if (!userData || !userData.loja_id || !userData.id) {
        setError("Dados do usuário ou loja incompletos.");
        toast.error("Erro de autenticação.");
        return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
        loja_id: userData.loja_id, 
        usuario_id: userData.id,
        items: pedidoItems.map(item => ({ 
            produto_nome: item.produtoNome, 
            quantidade: item.quantidade 
        })),
    };

    try {
      // 🚨 MUDANÇA AQUI: Usando URL absoluta para garantir que a rota seja correta.
      const response = await fetch("/api/pedidos", { 
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        // Se a resposta for um erro 405 (GET not allowed), o result.message será o erro que vimos.
        console.error("Erro de Resposta da API:", result);
        toast.error(`Falha: ${result.message || result.error || "Erro desconhecido"}`);
        throw new Error(result.error || result.message || "Falha ao enviar o pedido.");
      }

      toast.success(`Pedido #${result.id} enviado com sucesso! Status: ${result.status}`);
      setPedidoItems([]); 

    } catch (err) {
      console.error("[ERRO NO FETCH]", err);
      setError(err.message || "Erro desconhecido ao enviar o pedido.");
      // O toast de erro já foi disparado dentro do if (!response.ok)
    } finally {
      setIsSubmitting(false);
    }
  };


  // --- Estados de Carregamento/Erro (Sem alteração) ---
  if (loading || !userData) {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <AlertCircle className="w-16 h-16 text-red-500" />
            <p className="text-lg text-red-500">{error}</p>
            <Button onClick={() => window.location.reload()}>
                Tentar Novamente
            </Button>
        </div>
    );
  }
  // ------------------------------------

  // 4. Render Principal
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">📝 Novo Pedido de Estoque</h1>
      {/* 🚨 Debug: Exibir dados do usuário para confirmação */}
      <small className="block text-gray-500 mb-4">
          Gerente ID: {userData.id} | Loja ID: {userData.loja_id} | Perfil: {userData.perfil}
      </small>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Item ao Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="col-span-2">
              <Label htmlFor="produtoNome">Nome do Produto/Item</Label>
              <Input
                id="produtoNome"
                placeholder="Ex: Torta de Morango, Farinha de Trigo..."
                value={currentItem.produtoNome}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, produtoNome: e.target.value })
                }
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
            </div>
            <div className="col-span-1">
              <Label htmlFor="quantidade">Quantidade</Label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={currentItem.quantidade}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    // Garante que é um número, ou 1 se for inválido
                    quantidade: parseInt(e.target.value, 10) || 1,
                  })
                }
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
            </div>
            <Button onClick={handleAddItem} className="col-span-1" disabled={isSubmitting}>
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Exibição dos Itens do Pedido (Sem alteração) */}
      <div className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold">Itens do Pedido ({pedidoItems.length})</h2>
        {pedidoItems.length === 0 ? (
          <p className="text-gray-500">Nenhum item adicionado ainda.</p>
        ) : (
          <div className="space-y-2">
            {pedidoItems.map((item) => (
              <div
                key={item.tempId} 
                className="flex justify-between items-center p-3 border rounded-md shadow-sm bg-white"
              >
                <span className="font-medium">
                  {item.produtoNome}
                  <span className="ml-3 text-sm text-gray-500">
                    (Qtd: {item.quantidade})
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item.tempId)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSubmitPedido}
          disabled={pedidoItems.length === 0 || isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-b-transparent rounded-full animate-spin"></div>
              Enviando...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" /> Enviar Pedido para Matriz
            </>
          )}
        </Button>
      </div>
    </div>
  );
}