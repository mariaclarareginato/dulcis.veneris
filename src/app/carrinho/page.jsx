"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLoggedUser } from "@/lib/auth-client";

const formatCurrency = (value) => {
  const num = parseFloat(value || 0);
  return num.toFixed(2);
};

export default function Carrinho() {
  const [carrinho, setCarrinho] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchCarrinho = async (user) => {
    try {
      const res = await fetch(`/api/carrinho?usuarioId=${user.id}&lojaId=${user.loja_id}`);
      const data = await res.json();
      setCarrinho(data.itens || []);
    } catch (err) {
      console.error("Erro ao buscar carrinho:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = getLoggedUser();
    if (!user) {
      setLoading(false);
      return;
    }
    setUserData(user);
    fetchCarrinho(user);
  }, []);

  const alterarQuantidade = async (itemId, quantidade) => {
    if (quantidade < 1) return;
    try {
      await fetch(`/api/carrinho/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantidade }),
      });
      fetchCarrinho(userData);
    } catch (err) {
      console.error("Erro ao alterar quantidade:", err);
    }
  };

  const removerDoCarrinho = async (itemId) => {
    try {
      await fetch(`/api/carrinho/${itemId}`, { method: "DELETE" });
      fetchCarrinho(userData);
    } catch (err) {
      console.error("Erro ao remover item:", err);
    }
  };

  const total = carrinho.reduce((acc, item) => acc + parseFloat(item.subtotal || 0), 0);

  // LOADING UI
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  // SEM LOGIN
  if (!userData) {
    return (
      <p className="p-6 text-lg font-bold text-center">
        Nenhum usuário está logado!
      </p>
    );
  }

  return (
    <div className="p-6 w-full mx-auto">
      <h2 className="text-2xl sm:text-4xl font-bold mb-6 text-center">
        Carrinho de: {userData.nome}
      </h2>
      <br />

      {/* SEM ITENS */}
      {carrinho.length === 0 ? (
        <p className="font-bold text-xl text-center">Seu carrinho está vazio.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {carrinho.map((item) => (
              <Card
                key={item.id}
                className="rounded-2xl shadow-md hover:shadow-lg transition-all flex flex-col overflow-hidden"
              >
                <div className="relative w-full h-70 overflow-hidden">
                  <img
                    src={item.produto?.img || ""}
                    alt={item.produto?.nome || "Produto"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between space-y-3">
                  <h3 className="text-xl font-bold line-clamp-3">{item.produto.nome}</h3>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-lg font-bold">Preço:</span>
                    <span className="text-lg font-bold">
                      R$ {formatCurrency(item.produto.preco_venda)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="font-extrabold text-2xl w-10 h-10"
                        onClick={() => alterarQuantidade(item.id, item.quantidade - 1)}
                      >
                        -
                      </Button>

                      <span className="text-lg font-semibold">{item.quantidade}</span>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="font-extrabold text-xl w-10 h-10"
                        onClick={() => alterarQuantidade(item.id, item.quantidade + 1)}
                      >
                        +
                      </Button>
                    </div>

                    <p className="font-bold text-lg">
                      R$ {formatCurrency(item.subtotal)}
                    </p>
                  </div>

                  <Button
                    size="lg"
                    className="mt-3 w-full text-lg font-bold"
                    onClick={() => removerDoCarrinho(item.id)}
                  >
                    Remover do carrinho
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* TOTAL */}
          <div className="mt-8 flex flex-col items-end">
            <p className="text-2xl font-bold mb-4">
              Total: <span className="text-3xl font-extrabold">R$ {total.toFixed(2)}</span>
            </p>

            <Button
              onClick={() => router.push("/pagamento")}
              className="text-xl font-bold p-10 w-full md:w-auto mt-20"
            >
              Ir para pagamento
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
