"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Page({ usuarioId = 1, lojaId = 1 }) {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);

  // Busca produtos do backend
  useEffect(() => {
    fetch("/api/produtos")
      .then((res) => res.json())
      .then((data) => setProdutos(data))
      .catch((err) => console.error(err));
  }, []);

  // Busca carrinho (venda aberta)
  const fetchCarrinho = async () => {
    const res = await fetch(`/api/carrinho?usuarioId=${usuarioId}&lojaId=${lojaId}`);
    const data = await res.json();
    setCarrinho(data.itens || []);
  };

  useEffect(() => {
    fetchCarrinho();
  }, []);

  // Adiciona produto ao carrinho (venda)
  const adicionarAoCarrinho = async (produto) => {
    await fetch(`/api/carrinho?usuarioId=${usuarioId}&lojaId=${lojaId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produtoId: produto.id, quantidade: 1 }),
    });
    fetchCarrinho();
  };

  // Alterar quantidade de um item
  const alterarQuantidade = async (itemId, quantidade) => {
    if (quantidade < 1) return;
    await fetch(`/api/carrinho/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantidade }),
    });
    fetchCarrinho();
  };

  // Remover item do carrinho
  const removerDoCarrinho = async (itemId) => {
    await fetch(`/api/carrinho/${itemId}`, { method: "DELETE" });
    fetchCarrinho();
  };

  const total = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Produtos</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map((produto) => (
          <Card key={produto.id} className="rounded-2xl shadow-md hover:shadow-lg transition">
            {produto.img && (
              <div className="relative w-full h-72 overflow-hidden rounded-t-2xl">
                <Image src={produto.img} alt={produto.nome} fill className="object-cover" />
              </div>
            )}

            <CardContent>
              <h3 className="text-lg font-bold mb-1">{produto.nome}</h3>
              <p className="text-sm text-muted-foreground mb-2">
                {produto.sku} | {produto.categoria}
              </p>
              <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                {produto.descricao || "Sem descrição"}
              </p>
              <div className="flex justify-between items-center font-semibold mb-1">
                <span>Preço:</span>
                <span>R$ {produto.preco_venda.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
                <span>Custo:</span>
                <span>R$ {produto.custo.toFixed(2)}</span>
              </div>
              <Button className="w-full" onClick={() => adicionarAoCarrinho(produto)}>
                Adicionar ao Carrinho
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {carrinho.length > 0 && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-bold mb-2">Carrinho</h3>
          {carrinho.map((item) => (
            <div key={item.id} className="flex justify-between items-center mb-2">
              <span>
                {item.produto.nome} x {item.quantidade}
              </span>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}>
                  -
                </Button>
                <span>{item.quantidade}</span>
                <Button size="sm" onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}>
                  +
                </Button>
                <Button variant="destructive" size="sm" onClick={() => removerDoCarrinho(item.id)}>
                  Remover
                </Button>
              </div>
              <span>R$ {item.subtotal.toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-2 text-lg">
            <span>Total:</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
