"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, AlertCircle } from "lucide-react";
import { getLoggedUser } from "@/lib/auth-client";

export default function CaixaPage() {
  const router = useRouter();
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adicionandoId, setAdicionandoId] = useState(null);
  const [userData, setUserData] = useState(null);

  // ✅ Lógica de Autenticação (Apenas leitura do estado, sem redirecionamento cliente)
  useEffect(() => {
    const user = getLoggedUser();

    if (!user) {
      // Se o usuário não for encontrado (e o Middleware não o redirecionou), 
      // o componente fica em estado de loading até o Middleware resolver.
      return;
    }

    setUserData(user);
  }, [router]);

  // ✅ Salva os dados do usuário em cookies para usar em Server Components
  useEffect(() => {
    if (userData) {
      document.cookie = `userId=${userData.id}; path=/`;
      document.cookie = `lojaId=${userData.loja_id}; path=/`;
    }
  }, [userData]);

  // Busca produtos com estoque da loja
  useEffect(() => {
    if (!userData) return;

    setLoading(true);
    fetch(`/api/produtos?lojaId=${userData.loja_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProdutos(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [userData]);

  // Busca carrinho (venda aberta)
  const fetchCarrinho = async () => {
    if (!userData) return;

    try {
      const res = await fetch(
        `/api/carrinho?usuarioId=${userData.id}&lojaId=${userData.loja_id}`
      );
      const data = await res.json();
      setCarrinho(data.itens || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchCarrinho();
    }
  }, [userData]);

  // Adiciona produto ao carrinho com validação
  const adicionarAoCarrinho = async (produto) => {
    if (!userData) return;

    if (produto.quantidade <= 0) {
      alert("Produto sem estoque disponível!");
      return;
    }

    try {
      setAdicionandoId(produto.id);

      const res = await fetch(`/api/carrinho`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioId: userData.id,
          lojaId: userData.loja_id,
          produtoId: produto.id,
          quantidade: 1,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Erro ao adicionar");
      }

      alert(`✅ ${produto.nome} adicionado ao carrinho!`);
      fetchCarrinho();
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao adicionar produto");
    } finally {
      setAdicionandoId(null);
    }
  };

  // Alterar quantidade de um item
  const alterarQuantidade = async (itemId, quantidade) => {
    if (quantidade < 1) return;

    try {
      const res = await fetch(`/api/carrinho/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || data.error || "Erro ao atualizar");
      }

      fetchCarrinho();
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao atualizar quantidade");
    }
  };

  // Remover item do carrinho
  const removerDoCarrinho = async (itemId) => {
    try {
      await fetch(`/api/carrinho/${itemId}`, { method: "DELETE" });
      fetchCarrinho();
    } catch (err) {
      console.error(err);
      alert("Erro ao remover item");
    }
  };

  const total = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  // ✅ Loading/Spinner enquanto verifica autenticação e dados
  if (!userData || loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }
  

  return (
    <div className="p-6 space-y-6">
      {/* ✅ Header com informações do usuário */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Produtos Disponíveis</h2>
          <p className="text-muted-foreground">
            Bem-vindo(a), {userData.nome} | Loja: {userData.loja_id}
          </p>
        </div>
      </div>

      {/* Grid de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {produtos.map((produto) => {
          const semEstoque = produto.quantidade <= 0;
          const estoqueMinimo =
            produto.quantidade > 0 &&
            produto.quantidade <= produto.estoque_minimo;
          const isAdicionando = adicionandoId === produto.id;

          return (
            <Card
              key={produto.id}
              className={`rounded-2xl shadow-md hover:shadow-lg transition-all ${
                semEstoque ? "opacity-60" : ""
              }`}
            >
              {/* Imagem */}
              {produto.img ? (
                <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
                  <Image
                    src={produto.img}
                    alt={produto.nome}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={
                        semEstoque
                          ? "destructive"
                          : estoqueMinimo
                          ? "warning"
                          : "default"
                      }
                      className={`text-xs font-bold ${
                        semEstoque
                          ? "bg-red-500"
                          : estoqueMinimo
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                    >
                      <Package className="w-3 h-3 mr-1" />
                      {produto.quantidade}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-t-2xl">
                  <Package className="w-12 h-12 text-gray-300" />
                </div>
              )}

              <CardContent className="p-4 space-y-3">
                <div>
                  <h3 className="text-base font-bold line-clamp-1">
                    {produto.nome}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {produto.sku} | {produto.categoria}
                  </p>
                </div>

                <div
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    semEstoque
                      ? "bg-red-50 border border-red-200"
                      : estoqueMinimo
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-green-50 border border-green-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Package
                      className={`w-5 h-5 ${
                        semEstoque
                          ? "text-red-600"
                          : estoqueMinimo
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    />
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">
                        Estoque
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          semEstoque
                            ? "text-red-600"
                            : estoqueMinimo
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {produto.quantidade}
                      </p>
                    </div>
                  </div>
                  {estoqueMinimo && !semEstoque && (
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                  )}
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Preço:</span>
                  <span className="text-lg font-bold text-green-600">
                    R$ {produto.preco_venda.toFixed(2)}
                  </span>
                </div>

                <Button
                  className="w-full"
                  onClick={() => adicionarAoCarrinho(produto)}
                  disabled={semEstoque || isAdicionando}
                  variant={semEstoque ? "destructive" : "default"}
                >
                  {isAdicionando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Adicionando...
                    </>
                  ) : semEstoque ? (
                    "Sem Estoque"
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Adicionar
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
        <Card className="mt-8 p-6 border-2 border-primary">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Carrinho ({carrinho.length}{" "}
            {carrinho.length === 1 ? "item" : "itens"})
          </h3>

          <div className="space-y-3">
            {carrinho.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-semibold">{item.produto.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    R$ {item.preco_unitario.toFixed(2)} x {item.quantidade}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    📦 Estoque disponível: {item.estoque_disponivel || 0}{" "}
                    unidades
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white rounded-lg border px-3 py-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        alterarQuantidade(item.id, item.quantidade - 1)
                      }
                      disabled={item.quantidade <= 1}
                    >
                      -
                    </Button>
                    <span className="font-bold text-lg w-8 text-center">
                      {item.quantidade}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        alterarQuantidade(item.id, item.quantidade + 1)
                      }
                    >
                      +
                    </Button>
                  </div>

                  <div className="text-right min-w-[80px]">
                    <p className="font-bold text-lg">
                      R$ {item.subtotal.toFixed(2)}
                    </p>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removerDoCarrinho(item.id)}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t-2">
            <span className="text-2xl font-bold">Total:</span>
            <span className="text-3xl font-bold text-green-600">
              R$ {total.toFixed(2)}
            </span>
          </div>

          <Button className="w-full mt-4" size="lg">
            Finalizar Venda
          </Button>
        </Card>
      )}
    </div>
  );
}