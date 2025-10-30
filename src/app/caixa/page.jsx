"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, AlertCircle } from "lucide-react";
import { getLoggedUser } from "@/lib/auth-client";

export default function CaixaPage() {
  const router = useRouter();

  // Estados
  const [userData, setUserData] = useState(null);
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adicionandoId, setAdicionandoId] = useState(null);
  const [error, setError] = useState(null);

  // 1️⃣ Carrega usuário logado
  useEffect(() => {
    const user = getLoggedUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUserData(user);
  }, [router]);

  // 2️⃣ Busca produtos da loja
  useEffect(() => {
    if (!userData) return;
    setLoading(true);

    const controller = new AbortController();

    fetch(`/api/produtos?lojaId=${userData.loja_id}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Erro ao buscar produtos: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // Ordena: produtos com estoque primeiro
          const ordenados = [...data].sort((a, b) => {
            if (a.quantidade === 0 && b.quantidade > 0) return 1;
            if (a.quantidade > 0 && b.quantidade === 0) return -1;
            return 0;
          });
          setProdutos(ordenados);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error(err);
          setError("Erro ao carregar produtos");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [userData]);

  // 3️⃣ Busca carrinho
  const fetchCarrinho = async () => {
    if (!userData) return;
    try {
      const res = await fetch(`/api/carrinho?usuarioId=${userData.id}&lojaId=${userData.loja_id}`);
      const data = await res.json();
      setCarrinho(data.itens || []);
    } catch (err) {
      console.error("Erro ao buscar carrinho", err);
    }
  };

  useEffect(() => {
    if (userData) fetchCarrinho();
  }, [userData]);

  // 4️⃣ Adicionar produto ao carrinho
  const adicionarAoCarrinho = async (produto) => {
    if (!userData) return;

    if (produto.quantidade <= 0) {
      alert("Produto sem estoque disponível!");
      return;
    }

    try {
      setAdicionandoId(produto.id);

      const res = await fetch("/api/carrinho", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: userData.id,
          lojaId: userData.loja_id,
          produtoId: produto.id,
          quantidade: 1,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) throw new Error(data.error || "Erro ao adicionar produto");

      alert(`✅ ${produto.nome} adicionado ao carrinho!`);
      fetchCarrinho();
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao adicionar produto");
    } finally {
      setAdicionandoId(null);
    }
  };

  // 5️⃣ Alterar quantidade do carrinho
  const alterarQuantidade = async (itemId, quantidade) => {
    if (quantidade < 1) return;
    try {
      const res = await fetch(`/api/carrinho/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao atualizar quantidade");
      fetchCarrinho();
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao atualizar quantidade");
    }
  };

  // 6️⃣ Remover do carrinho
  const removerDoCarrinho = async (itemId) => {
    try {
      await fetch(`/api/carrinho/${itemId}`, { method: "DELETE" });
      fetchCarrinho();
    } catch (err) {
      console.error(err);
      alert("Erro ao remover item");
    }
  };

  const total = carrinho.reduce((acc, item) => acc + (item.subtotal || 0), 0);

  // Loading ou erro
  if (!userData || loading) {
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

  // Render
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Produtos Disponíveis</h2>
          <p className="text-muted-foreground mt-2 font-semibold">
            Bem-vindo(a), {userData.nome} | Loja: {userData.loja_id}
          </p>
        </div>
      </div>

      {/* Grid de produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {produtos.map((produto) => {
          const semEstoque = produto.quantidade <= 0;
          const estoqueMinimo = produto.quantidade > 0 && produto.quantidade <= produto.estoque_minimo;
          const isAdicionando = adicionandoId === produto.id;

          return (
            <Card key={produto.id} className={`rounded-2xl shadow-md hover:shadow-lg transition-all flex flex-col ${semEstoque ? "opacity-60" : ""}`}>
              {/* Imagem */}
              <div className="relative w-full h-48 overflow-hidden rounded-t-2xl flex-shrink-0">
                {produto.img ? (
                  <Image src={produto.img} alt={produto.nome} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-base font-bold">{produto.nome}</h3>
                  
             
                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[2.5rem] mt-5">
                   {produto.descricao || "Sem descrição"}
                  </p>

                  <p className="text-xs text-muted-foreground mt-5">
                    {produto.sku} | {produto.categoria}
                  </p>
                </div>

                {/* Estoque */}
                <div className={`flex items-center justify-between p-3 rounded-lg ${semEstoque ? "text-red-200" : estoqueMinimo ? "text-yellow-200" : "text-green-200"}`}>
                  <div className="flex items-center gap-2">
                    <Package className={`w-5 h-5 ${semEstoque ? "text-red-600" : estoqueMinimo ? "text-yellow-600" : "text-green-600"}`} />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Estoque</p>
                      <p className={`text-2xl font-bold ${semEstoque ? "text-red-600" : estoqueMinimo ? "text-yellow-600" : "text-green-600"}`}>
                        {produto.quantidade}
                      </p>
                    </div>
                  </div>
                  {estoqueMinimo && !semEstoque && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                </div>

                {/* Preço */}
                <div className="flex justify-between items-center pt-2 border-t mt-auto">
                  <span className="text-sm text-muted-foreground">Preço:</span>
                  <span className="text-lg font-bold text-black-600">
                    R$ {produto.preco_venda ? produto.preco_venda.toFixed(2) : "0.00"}
                  </span>
                </div>

                {/* Botão */}
                <Button
                  className="w-full mt-2"
                  onClick={() => adicionarAoCarrinho(produto)}
                  disabled={semEstoque || isAdicionando}
                  variant={semEstoque ? "destructive" : "default"}
                >
                  {isAdicionando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Adicionando...
                    </>
                  ) : semEstoque ? (
                    "Sem Estoque"
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" /> Adicionar ao carrinho
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Carrinho */}
      {carrinho.length > 0 && (
        <Card className="mt-8 p-4 sm:p-6 border-2 border-primary">
  <h3 className="text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2 flex-wrap">
    <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
    Carrinho ({carrinho.length} {carrinho.length === 1 ? "item" : "itens"})
  </h3>

  <div className="space-y-3">
    {carrinho.map((item) => (
      <div
        key={item.id}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg border bg-card"
      >
        <div className="flex-1 text-center sm:text-left">
          <p className="font-bold text-base sm:text-lg m-3">{item.produto.nome}</p>
          <p className="text-sm text-muted-foreground">
            R$ {item.preco_unitario?.toFixed(2)} x {item.quantidade}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center justify-center sm:justify-end gap-3 w-full sm:w-auto">
          {/* Controle de quantidade */}
          <div className="flex items-center gap-2 rounded-lg border px-3 py-1">
            <Button
              size="sm"
              variant="outline"
              onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
              disabled={item.quantidade <= 1}
            >
              -
            </Button>
            <span className="font-bold text-lg w-8 text-center">{item.quantidade}</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
            >
              +
            </Button>
          </div>

          {/* Subtotal */}
          <div className="text-center sm:text-right min-w-[80px]">
            <p className="font-bold text-lg">R$ {item.subtotal?.toFixed(2) || "0.00"}</p>
          </div>

          {/* Botão Remover */}
          <Button
            variant="destructive"
            size="lg"
            className="w-full sm:w-auto"
            onClick={() => removerDoCarrinho(item.id)}
          >
            Remover
          </Button>
        </div>
      </div>
    ))}
  </div>

  {/* Total */}
  <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t-2 gap-2">
    <span className="text-xl sm:text-2xl font-bold">Total:</span>
    <span className="text-2xl sm:text-3xl font-bold text-green-600">
      R$ {total.toFixed(2)}
    </span>
  </div>

  {/* Botão Finalizar */}
  <Button className="w-full font-bold text-base sm:text-lg mt-4" size="lg">
    Finalizar Venda
  </Button>
</Card>

      )}
    </div>
  );
}
