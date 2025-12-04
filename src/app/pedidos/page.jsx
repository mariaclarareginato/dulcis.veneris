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

  const produtoMap = useMemo(() => {
    return new Map(produtosDisponiveis.map((p) => [String(p.nome), p.id]));
  }, [produtosDisponiveis]);

  // Autenticação
  useEffect(() => {
    const user = getLoggedUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserData(user);
    setLoading(false);
  }, [router]);

  // Buscar produtos
  useEffect(() => {
    if (!userData?.loja_id) return;

    const fetchProdutos = async () => {
      try {
        const res = await fetch(`/api/produtos?lojaId=${userData.loja_id}`);
        const data = await res.json();
        if (!res.ok) throw new Error();
        setProdutosDisponiveis(data);
      } catch (err) {
        toast.error("Erro ao carregar produtos.");
      }
    };

    fetchProdutos();
  }, [userData]);

  // Buscar pedidos do usuário
  const fetchMeusPedidos = async () => {
    if (!userData?.id) return;
    try {
      const res = await fetch(`/api/pedidos?usuarioId=${userData.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error();
      setMeusPedidos(data);
    } catch (err) {
      toast.error("Erro ao carregar seus pedidos.");
    }
  };

  useEffect(() => {
    fetchMeusPedidos();
  }, [userData]);

  const handleProdutoSelect = (nomeSelecionado) => {
    setCurrentItem({
      ...currentItem,
      produtoNome: nomeSelecionado,
      produtoId: produtoMap.get(nomeSelecionado) || null,
    });
  };

  const handleAddItem = () => {
    if (!currentItem.produtoNome || currentItem.quantidade <= 0) {
      toast.error("Selecione um produto e uma quantidade válida.");
      return;
    }

    setPedidoItems((prev) => [
      ...prev,
      { ...currentItem, tempId: Date.now() },
    ]);

    setCurrentItem({ produtoNome: "", produtoId: null, quantidade: 1 });
  };

  const handleRemoveItem = (tempId) => {
    setPedidoItems((prev) => prev.filter((item) => item.tempId !== tempId));
  };

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
      if (!res.ok) throw new Error(data.message);

      toast.success(`Pedido ${data.id} enviado com sucesso!`);
      setPedidoItems([]);
      fetchMeusPedidos();
    } catch (err) {
      toast.error("Erro ao enviar o pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
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
        <p className="text-xl font-bold text-red-600">{error}</p>
        <Button className="text-lg font-bold" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto m-10 max-w-3xl">

      <h1 className="text-4xl m-4 font-bold">Novo Pedido de Estoque</h1>

      <div className="m-10">
        <p className="text-muted-foreground font-semibold text-xl">
          Gerente ID: {userData.id} — Loja ID: {userData.loja_id}
        </p>
      </div>

      {/* -------- FORM ADICIONAR ITEM -------- */}
      <div className="m-5">
      <Card className="w-full max-w-lg
             bg-transparent rounded-xl
             backdrop-blur-md
             shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
             dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
             transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-3xl mt-9 mb-9 font-bold">Adicionar Itens</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Produto */}
            <div className="md:col-span-3">
              <Label className="mb-5 block text-lg font-semibold">Produto</Label>
              <Select
                value={currentItem.produtoNome}
                onValueChange={handleProdutoSelect}
              >
                <SelectTrigger className="font-semibold text-base w-full min-h-[90px] whitespace-normal break-words text-left">
                  <SelectValue placeholder="Selecione o produto que deseja pedir" />
                </SelectTrigger>

                <SelectContent
                  className="font-semibold text-base w-[var(--radix-select-trigger-width)] max-w-full"
                  position="popper"
                >
                  {produtosDisponiveis.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.nome}
                      className="whitespace-normal break-words text-left py-2"
                    >
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quantidade */}
            <div className="md:col-span-1">
              <Label className="mb-5 block text-lg font-semibold">Quantidade</Label>
              <Input
                type="number"
                min="1"
                className="text-lg font-semibold"
                value={currentItem.quantidade}
                onChange={(e) =>
                  setCurrentItem({
                    ...currentItem,
                    quantidade: Number(e.target.value),
                  })
                }
              />
            </div>

          </div>

          <Button
            onClick={handleAddItem}
            className="p-4 mt-6 w-full font-bold text-lg"
          >
            <Plus className="mr-2 w-5 h-5" />
            Adicionar Item
          </Button>

        </CardContent>
        <br></br>
      </Card>
      </div>

      {/* LISTA DE ITENS DO PEDIDO */}
      
      <div className="mt-20">
        <h2 className="text-3xl m-4 font-bold">Itens do Pedido</h2>

        {pedidoItems.length === 0 ? (
          <p className="text-muted-foreground m-5 text-xl font-semibold">
            Nenhum item adicionado ao pedido.
          </p>
        ) : (
          <div className="space-y-2 m-4">
            {pedidoItems.map((item) => (
              <div
                key={item.tempId}
                className="flex justify-between items-center p-3 border rounded-lg shadow"
              >
                <p className="font-bold text-xl">
                  {item.produtoNome} — {item.quantidade}
                </p>

                <Button variant="ghost" onClick={() => handleRemoveItem(item.tempId)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTÃO ENVIAR */}
      <div className="m-8 flex justify-end">
        <Button
          className="w-full md:w-auto text-lg font-bold p-6"
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
      <div className="text-center">
        <strong className="text-2xl font-extrabold">ATENÇÃO!</strong>
        
        <p className="w-full mt-5 text-xl font-bold">
          Seus pedidos chegarão em até 6 dias úteis.
        </p>
      </div>

      {/* LISTA DE PEDIDOS DO USUÁRIO */}
      <div className="m-10">
        <h2 className="text-3xl font-bold mb-5">Meus Pedidos</h2>

        {meusPedidos.length === 0 ? (
          <p className="text-muted-foreground text-lg font-semibold">
            Você ainda não fez nenhum pedido.
          </p>
        ) : (
          <div className="space-y-4">
            {meusPedidos.map((pedido) => (
              <Card key={pedido.id}>
                <CardHeader>
                  <br></br>
                  <CardTitle className="text-2xl font-bold">
                    Pedido {pedido.id} —{" "}
                    <span className="">{pedido.status}</span>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <br></br>
                  <p className="text-xl font-semibold">Itens:</p>
                  <ul className="m-4 list-disc font-semibold text-lg">
                    {pedido.itens_pedido.map((item) => (
                      <li key={item.id}>
                        {item.produto_nome} — {item.quantidade}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <br></br>
              </Card>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}
