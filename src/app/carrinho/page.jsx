"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Carrinho({ usuarioId = 1, lojaId = 1, produtos = [] }) {
  const [carrinho, setCarrinho] = useState([]);

  // Busca carrinho (venda aberta)
  const fetchCarrinho = async () => {
    const res = await fetch(`/api/carrinho?usuarioId=${usuarioId}&lojaId=${lojaId}`);
    const data = await res.json();
    setCarrinho(data.itens || []);
  };

  useEffect(() => {
    fetchCarrinho();
  }, []);

  // Adicionar produto ao carrinho
  const adicionarAoCarrinho = async (produto) => {
    await fetch(`/api/carrinho?usuarioId=${usuarioId}&lojaId=${lojaId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ produtoId: produto.id, quantidade: 1 }),
    });
    fetchCarrinho();
  };

  // Alterar quantidade de item
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
      <h2 className="text-2xl font-bold mb-6">Carrinho</h2>

      {carrinho.length === 0 ? (
        <p className="text-muted-foreground">Seu carrinho está vazio.</p>
      ) : (
        <div className="space-y-4">
          {carrinho.map((item) => (
            <Card key={item.id} className="rounded-xl shadow-md">
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{item.produto.nome}</CardTitle>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removerDoCarrinho(item.id)}
                >
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
        <h3 className="text-xl font-semibold mb-2">Adicionar produtos</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {produtos.map((produto) => (
            <Card key={produto.id} className="p-4 rounded-xl shadow-sm hover:shadow-md transition">
              <CardHeader>
                <CardTitle>{produto.nome}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-2">R$ {produto.preco_venda.toFixed(2)}</CardDescription>
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
