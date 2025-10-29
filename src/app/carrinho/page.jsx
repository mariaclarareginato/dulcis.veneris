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
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Carrinho de {userData.nome}</h2>

      {carrinho.length === 0 ? (
        <p className="text-red-500 font-bold">Seu carrinho está vazio.</p>
      ) : (
        <div className="space-y-4">
          {carrinho.map((item) => (
            <Card key={item.id} className="rounded-xl shadow-md">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{item.produto.nome}</CardTitle>
                <Button variant="destructive" size="sm" onClick={() => removerDoCarrinho(item.id)}>
                  Remover
                </Button>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div>
                  <CardDescription>{item.produto.descricao}</CardDescription>
                  <p className="font-semibold">R$ {item.produto.preco_venda.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                  >
                    -
                  </Button>
                  <span>{item.quantidade}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                  >
                    +
                  </Button>
                </div>
                <p className="ml-4 font-semibold">R$ {item.subtotal.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
          <div className="mt-4 flex justify-end text-lg font-bold">
            Total: R$ {total.toFixed(2)}
          </div>
        </div>
      )}

      <div className="mt-6">
        <Button onClick={() => router.push("/caixa")} className="text-xl font-semibold mb-2">
          Adicionar produtos +
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {produtos.map((produto) => (
            <Card key={produto.id} className="p-4 rounded-xl shadow-sm hover:shadow-md transition">
              <CardHeader>
                <CardTitle>{produto.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-2">
                  R$ {produto.preco_venda.toFixed(2)}
                </CardDescription>
                <Button className="w-full" onClick={() => adicionarAoCarrinho(produto)}>
                  Adicionar ao carrinho
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
