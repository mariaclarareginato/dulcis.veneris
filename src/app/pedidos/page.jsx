"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLoggedUser } from "@/lib/auth-client";
import { AlertCircle, Plus, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";


export default function PedidosPage({ params }) {
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // --- Estados principais ---
  const [pedidoItems, setPedidoItems] = useState([]); // lista de itens do pedido
  const [currentItem, setCurrentItem] = useState({ produtoNome: "", quantidade: 1, tempId: Date.now() });
  const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);

  // --- Autenticação ---
  useEffect(() => {
    const user = getLoggedUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserData(user);
    setLoading(false);
  }, [router]);

  // --- Buscar produtos da loja ---
  useEffect(() => {
    if (!userData?.loja_id) return;

    const fetchProdutos = async () => {
      try {
        const res = await fetch(`/api/produtos?lojaId=${userData.loja_id}`);
        if (!res.ok) throw new Error("Erro ao buscar produtos");
        const data = await res.json();
        setProdutosDisponiveis(data);
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
        toast.error("Falha ao carregar lista de produtos da loja.");
      }
    };

    fetchProdutos();
  }, [userData]);

  // --- Adicionar item ---
  const handleAddItem = () => {
    if (!currentItem.produtoNome || currentItem.quantidade <= 0) {
      toast.error("Preencha o nome do produto e a quantidade válida.");
      return;
    }

    const novoItem = {
      ...currentItem,
      tempId: Date.now(),
    };

    setPedidoItems([...pedidoItems, novoItem]);
    setCurrentItem({ produtoNome: "", quantidade: 1 });
  };

  // --- Remover item ---
  const handleRemoveItem = (tempId) => {
    setPedidoItems(pedidoItems.filter((item) => item.tempId !== tempId));
  };

  // --- Enviar pedido ---
  const handleSubmitPedido = async () => {
    if (pedidoItems.length === 0) {
      toast.error("O pedido não pode estar vazio.");
      return;
    }

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
      items: pedidoItems.map((item) => ({
        produto_nome: item.produtoNome,
        quantidade: item.quantidade,
      })),
    };

    try {
      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Erro de Resposta da API:", result);
        toast.error(`Falha: ${result.message || result.error || "Erro desconhecido"}`);
        throw new Error(result.error || result.message || "Falha ao enviar o pedido.");
      }

      toast.success(`Pedido #${result.id} enviado com sucesso!`);
      setPedidoItems([]);
    } catch (err) {
      console.error("[ERRO NO FETCH]", err);
      setError(err.message || "Erro desconhecido ao enviar o pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Tela de carregamento / erro ---
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
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  // --- Render principal ---
  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mt-10">Novo Pedido de Estoque</h1>

      <small className="block font-semibold mt-10">
        Gerente ID: {userData.id} | Loja ID: {userData.loja_id} | Perfil: {userData.perfil}
      </small>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Adicionar Item ao Pedido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

            <div className="col-span-2">
          <Label htmlFor="produtoNome">Produto:</Label>
          <br></br>

      <Select value={currentItem.produtoNome}  onValueChange={(value) => setCurrentItem({ ...currentItem, produtoNome: value })} >
       <SelectTrigger className="w-full">
       <SelectValue placeholder="Selecione um produto..." />
       </SelectTrigger>
        <SelectContent>
         {produtosDisponiveis.map((produto) => (
         <SelectItem key={produto.id} value={produto.nome}>
          {produto.nome}
          </SelectItem>
          ))}
         </SelectContent>
          </Select>

             </div>


            <div>
              <Label htmlFor="quantidade">Quantidade:  </Label>
              <br></br>
              <Input
                id="quantidade"
                type="number"
                min="1"
                value={currentItem.quantidade}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, quantidade: parseInt(e.target.value, 10) || 1 })
                }
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              />
            </div>

            <Button onClick={handleAddItem} disabled={isSubmitting} className="col-span-1">
              <Plus className="mr-2 h-4 w-4" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Itens */}
      <div className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold">Itens do Pedido ({pedidoItems.length})</h2>
        {pedidoItems.length === 0 ? (
          <p className="font-semibold">Nenhum item adicionado ainda.</p>
        ) : (
          <div className="space-y-2">
            {pedidoItems.map((item) => (
              <div
                key={item.tempId}
                className="flex justify-between items-center p-3 border rounded-md shadow-sm bg-white"
              >
                <span className="font-medium">
                  {item.produtoNome}
                  <span className="ml-3 text-sm">(Qtd: {item.quantidade})</span>
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
