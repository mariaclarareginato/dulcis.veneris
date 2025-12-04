"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Produtos () {
  
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState (true);
  
  

  
  // Busca os produtos da API

  async function carregarProdutos() {
    try {
      const res = await fetch("/api/matriz-produtos");
      const data = await res.json();
      setProdutos(data);
    } catch (e) {
      console.error("Erro ao carregar produtos", e);
    } finally {
      setLoading(false);
    }
  }

  
  //Funçao para tirar produto de linha 

  useEffect(() => {
    carregarProdutos();
  }, []);


  async function tirarDeLinha(p) {
  const confirmar = confirm(
    `Tem certeza que deseja tirar "${p.nome}" de linha?`
  );
  if (!confirmar) return;

  await fetch(`/api/matriz-produtos/${p.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ativo: false }),
  });

  carregarProdutos();
}

async function colocarNaLinha(p) {
  const confirmar = confirm(
    `Tem certeza que deseja colocar "${p.nome}" na linha?`
  );
  if (!confirmar) return;

  await fetch(`/api/matriz-produtos/${p.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ativo: true }),
  });

  carregarProdutos(); // Atualiza a tabela
}

return (
  <div className="p-4 sm:p-8">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Produtos</h1>
        <p className="text-muted-foreground text-base text-xl font-semibold">
          Crie um novo produto, ou tire qualquer um deles do estoque.
        </p>
      </div>

      <Button
        className="p-6 text-base text-lg font-bold"
        onClick={() => (window.location.href = "/novoproduto")}
      >
        Criar novo produto
      </Button>
    </div>

    {loading ? (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-14 h-14 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
        {produtos.map((p) => (
          <Card key={p.id} className="flex flex-col p-5">
            <CardHeader>
              <CardTitle className="font-extrabold text-xl text-center">
                {p.nome}
              </CardTitle>
              <div className="w-full h-48 overflow-hidden rounded-lg mt-3">
                <img
                  src={p.img}
                  alt={p.nome}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardHeader>

            <CardContent className="flex flex-col p-5 gap-2 justify-between flex-grow">
              <p className="text-lg font-semibold">Código: <strong>{p.codigo}</strong></p>
              <p className="text-lg font-semibold">Preço: <strong>R$ {Number(p.preco_venda).toFixed(2)}</strong></p>
              <p className="text-lg font-semibold">Custo: <strong>R$ {Number(p.custo).toFixed(2)}</strong></p>
              <p className="text-lg font-semibold">Status: <strong>{p.ativo ? "ATIVO" : "FORA DE LINHA"}</strong></p>

              <div className="mt-4">
                {p.ativo ? (
                  <Button
                    className="w-full text-lg font-bold"
                    onClick={() => tirarDeLinha(p)}
                  >
                    Tirar de linha
                  </Button>
                ) : (
                  <Button
                    className="w-full text-lg font-bold"
                    variant="destructive"
                    onClick={() => colocarNaLinha(p)}
                  >
                    Colocar na linha
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )}
  </div>
);
}