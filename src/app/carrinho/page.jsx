"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card, CardHeader, CardTitle, CardContent, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLoggedUser } from "@/lib/auth-client";

export default function Carrinho({ produtos = [] }) {
  const [carrinho, setCarrinho] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 🔹 Busca usuário logado
  useEffect(() => {
    const user = getLoggedUser();
    if (user) setUserData(user);
    setLoading(false);
  }, []);

  // 🔹 Função centralizada para buscar carrinho
  const fetchCarrinho = async (user = userData) => {
    if (!user) return;
    try {
      const res = await fetch(`/api/carrinho?usuarioId=${user.id}&lojaId=${user.loja_id}`);
      const data = await res.json();
      setCarrinho(data.itens || []);
    } catch (err) {
      console.error("Erro ao buscar carrinho:", err);
    }
  };

  // 🔹 Atualiza carrinho sempre que o usuário estiver pronto
  useEffect(() => {
    if (userData) fetchCarrinho(userData);
  }, [userData]);

  // 🔹 Adicionar produto
  const adicionarAoCarrinho = async (produto) => {
    if (!userData) {
      alert("Usuário não identificado!");
      return;
    }

    try {
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

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao adicionar");

      await fetchCarrinho(userData); // garante atualização antes do alert
      alert(`✅ ${produto.nome} adicionado ao carrinho!`);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // 🔹 Alterar quantidade
  const alterarQuantidade = async (itemId, quantidade) => {
    if (quantidade < 1) return;
    try {
      await fetch(`/api/carrinho/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade }),
      });
      await fetchCarrinho(userData);
    } catch (err) {
      console.error("Erro ao alterar quantidade:", err);
    }
  };

  // 🔹 Remover item
  const removerDoCarrinho = async (itemId) => {
    try {
      await fetch(`/api/carrinho/${itemId}`, { method: "DELETE" });
      await fetchCarrinho(userData);
    } catch (err) {
      console.error("Erro ao remover item:", err);
    }
  };

  const total = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  if (loading) return <p className="p-6 text-gray-500">Carregando...</p>;
  if (!userData) return <p className="p-6 text-red-500 font-bold">Nenhum usuário logado!</p>;

  return (
<div className="p-6 w-full mx-auto">
  <h2 className="text-2xl sm:text-4xl font-bold mb-6 text-center">
  Carrinho de: {userData.nome}
</h2>


  {carrinho.length === 0 ? (
    <p className="text-red-500 font-bold text-lg text-center">Seu carrinho está vazio.</p>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {carrinho.map((item) => (
        <Card
          key={item.id}
          className="rounded-2xl shadow-md hover:shadow-lg transition-all flex flex-col overflow-hidden"
        >
          {/* Imagem */}
          <div className="relative w-full h-full h-48 overflow-hidden">
            {item.produto?.img ? (
              <img
                src={item.produto.img}
                alt={item.produto.nome}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-lg">
                Sem imagem
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <CardContent className="p-4 flex flex-col flex-1 justify-between space-y-3">
            <div>
              <h3 className="text-lg font-bold line-clamp-1">{item.produto.nome}</h3>
             
            </div>

            {/* Preço */}
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-lg font-bold">Preço:</span>
              <span className="text-lg font-bold">
                R$ {item.produto.preco_venda.toFixed(2)}
              </span>
            </div>

            {/* Quantidade */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-8 h-8"
                  onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                >
                  -
                </Button>
                <span className="text-base font-semibold">{item.quantidade}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-8 h-8"
                  onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                >
                  +
                </Button>
              </div>
              <p className="font-bold text-lg">R$ {item.subtotal.toFixed(2)}</p>
            </div>

            {/* Remover */}
            <Button
              variant="destructive"
              size="lg"
              className="mt-3 w-full"
              onClick={() => removerDoCarrinho(item.id)}
            >
              Remover
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )}

  {/* Total + botão final */}
  {carrinho.length > 0 && (
    <div className="mt-8 flex flex-col items-end">
      <p className="text-2xl font-bold mb-4">
        Total: <span className="text-green-600">R$ {total.toFixed(2)}</span>
      </p>

      <Button
        onClick={() => router.push("/caixa")}
        className="text-xl font-bold w-full md:w-auto mt-20"
      >
        Adicionar produtos +
      </Button>
    </div>
  )}
</div>

  );
}
