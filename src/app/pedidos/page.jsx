"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getLoggedUser } from "@/lib/auth-client";
import { Plus, Send, X, AlertCircle } from "lucide-react";
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

export default function PedidosPage() {
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [produtosDisponiveis, setProdutosDisponiveis] = useState([]);
  const [pedidoItems, setPedidoItems] = useState([]);
  const [meusPedidos, setMeusPedidos] = useState([]);

  const [currentItem, setCurrentItem] = useState({
    produtoNome: "",
    produtoId: null,
    quantidade: 1,
  });

  // === MAP NOME → ID ===
  const produtoMap = useMemo(() => {
    return new Map(produtosDisponiveis.map((p) => [String(p.nome), p.id]));
  }, [produtosDisponiveis]);

  // === Autenticação ===
  useEffect(() => {
    const user = getLoggedUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserData(user);
    setLoading(false);
  }, [router]);

  // === Buscar produtos da loja ===
  useEffect(() => {
    if (!userData?.loja_id) return;

    const fetchProdutos = async () => {
      try {
        const res = await fetch(`/api/produtos?lojaId=${userData.loja_id}`);
        if (!res.ok) throw new Error("Erro ao carregar produtos.");
        const data = await res.json();
        setProdutosDisponiveis(data);
      } catch (err) {
        console.error(err);
        toast.error("Falha ao carregar produtos da loja.");
      }
    };

    fetchProdutos();
  }, [userData]);

  // === Buscar meus pedidos ===
  const fetchMeusPedidos = async () => {
    if (!userData?.id) return;
    try {
      const res = await fetch(`/api/pedidos?usuarioId=${userData.id}`);
      if (!res.ok) throw new Error("Erro ao buscar seus pedidos.");
      const data = await res.json();
      setMeusPedidos(data);
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível carregar seus pedidos.");
    }
  };

  useEffect(() => {
    fetchMeusPedidos();
  }, [userData]);

  // === Seleção de produto ===
  const handleProdutoSelect = (nomeSelecionado) => {
    setCurrentItem({
      ...currentItem,
      produtoNome: nomeSelecionado,
      produtoId: produtoMap.get(nomeSelecionado) || null,
    });
  };

  // === Adicionar item ===
  const handleAddItem = () => {
    if (!currentItem.produtoNome || currentItem.quantidade <= 0) {
      toast.error("Selecione um produto válido e uma quantidade.");
      return;
    }

    setPedidoItems((prev) => [
      ...prev,
      { ...currentItem, tempId: Date.now() },
    ]);

    setCurrentItem({ produtoNome: "", produtoId: null, quantidade: 1 });
  };

  // === Remover item ===
  const handleRemoveItem = (tempId) => {
    setPedidoItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  // === Enviar pedido ===
  const handleSubmitPedido = async () => {
    if (pedidoItems.length === 0) {
      toast.error("O pedido não pode estar vazio.");
      return;
    }

    const payload = {
      loja_id: userData.loja_id,
      usuario_id: userData.id,
      items: pedidoItems.map((item) => ({
        produto_nome: item.produtoNome,
        produto_id: item.produtoId,
        quantidade: item.quantidade,
      })),
    };

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Erro ao enviar pedido.");
        return;
      }

      toast.success(`Pedido #${data.id} enviado com sucesso!`);
      setPedidoItems([]);
      fetchMeusPedidos();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // === Tela de loading ===
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  // === Tela de erro ===
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p className="text-lg text-red-600">{error}</p>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  // === Tela principal ===
  return (
  <div className="container mx-auto py-10 max-w-3xl">

  <h1 className="text-3xl font-bold">Novo Pedido de Estoque</h1>

<div className="m-5">
  <p className="text-muted-foreground font-medium">
    Gerente ID: {userData.id} — Loja ID: {userData.loja_id} — Perfil:{" "}
    {userData.perfil}
  </p>
  </div>

  {/* CARD DE ADIÇÃO */}
  <Card>
    <CardHeader>
      <CardTitle className="text-xl">Adicionar Itens</CardTitle>
    </CardHeader>

    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

        {/* Produto */}
        <div className="md:col-span-2">
          <Label className="mb-4 block">Produto</Label>
          <Select 
            value={currentItem.produtoNome}
            onValueChange={handleProdutoSelect}
          >
            <SelectTrigger>
              <SelectValue  placeholder="Selecione o produto que deseja pedir" />
            </SelectTrigger>
            <SelectContent>
              {produtosDisponiveis.map((p) => (
                <SelectItem key={p.id} value={p.nome}>
                  {p.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quantidade */}
        <div className="md:col-span-3 mt-10">
          <Label className="mb-4 block">Quantidade</Label>
          <Input className="w-30"
            type="number"
            min="1"
            value={currentItem.quantidade}
            onChange={(e) =>
              setCurrentItem({
                ...currentItem,
                quantidade: Number(e.target.value),
              })
            }
          />
        </div>

        {/* Botão */}
        <div className="md:col-span-1 mt-5">
          <Button onClick={handleAddItem} className="w-full">
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>

      </div>
    </CardContent>
  </Card>

      {/* LISTA DE ITENS */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold">Itens do Pedido</h2>

        {pedidoItems.length === 0 ? (
          <p className="text-muted-foreground mt-2 text-lg font-semibold">Nenhum item adicionado.</p>
        ) : (
          <div className="space-y-2 mt-4">
            {pedidoItems.map((item) => (
              <div
                key={item.tempId}
                className="flex justify-between items-center p-3 border rounded-lg shadow"
              >
                <p className="font-medium">
                  {item.produtoNome} — {item.quantidade} 
                </p>

                <Button
                  variant="ghost"
                  onClick={() => handleRemoveItem(item.tempId)}
                >
                  <X className=" w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTÃO ENVIAR */}
      <div className="mt-8 flex justify-end">
        <Button
          className="w-full md:w-auto"
          disabled={isSubmitting || pedidoItems.length === 0}
          onClick={handleSubmitPedido}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-b-transparent rounded-full animate-spin"></div>
              Enviando...
            </>
          ) : (
            <>
              <Send className="mr-2 w-4 h-4" /> Enviar pedido para a matriz
            </>
          )}
        </Button>
      </div>

    {/* Aviso */}

      <div>
        <strong>! ATENÇÃO !</strong>
        
        <h1 className="m-5 w-full max-w-70">Seus pedidos chegarão em 6 dias úteis assim que a matriz alterar os status dos mesmos para "EM_PROCESSAMENTO".</h1>
      </div>



      {/* Listagem dos meus pedidos*/}

      <div className="mt-14">
        <h2 className="text-3xl font-bold mb-5">Meus Pedidos</h2>

        {meusPedidos.length === 0 ? (
          <p className="text-muted-foreground text-lg font-semibold">Você ainda não fez nenhum pedido.</p>
        ) : (
          <div className="space-y-4">
            {meusPedidos.map((pedido) => (
              <Card key={pedido.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Pedido {pedido.id} —{" "}
                    <span className="">{pedido.status}</span>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="font-medium mb-2">Itens:</p>

                  <ul className="ml-4 list-disc">
                    {pedido.itens_pedido.map((item) => (
                      <li key={item.id}>
                        {item.produto_nome} — {item.quantidade} 
                      </li>
                    ))}
                  </ul>

                  <p className="mt-3 text-sm text-muted-foreground">
                    Enviado por: {pedido.usuario.nome} — Loja: {pedido.loja.nome}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
