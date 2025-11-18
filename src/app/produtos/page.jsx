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

  async function tirarDeLinha(id) {
    const confirmar = confirm("Tem certeza que deseja tirar este produto de linha?");
    if (!confirmar) return;

    await fetch(`/api/matriz-produtos/${id}/tirar-de-linha`, {
      method: "PUT",
    });

    carregarProdutos(); // atualiza a lista
  }

  useEffect(() => {
    carregarProdutos();
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
        <h1 className="text-4xl font-extrabold">Produtos </h1>
       
        <p className="text-muted-foreground text-lg font-bold mt-4">Crie um novo produto, ou tire qualquer um deles do estoque</p>
        </div>

        <Button onClick={() => window.location.href = "/matriz/produtos/novo"}>
          <p className="font-bold">Criar novo produto</p>
        </Button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {produtos.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="font-extrabold text-xl">{p.nome}</CardTitle>
                <img src={p.img} className="mt-10 w-80 h-80 object-cover"></img>
                
              </CardHeader>
              <CardContent className="space-y-3">
                <p>Código: <strong>{p.codigo}</strong></p>
                <p>Preço: <strong>R$ {Number(p.preco_venda).toFixed(2)}</strong></p>
                <p>Custo: <strong>R$ {Number(p.custo).toFixed(2)}</strong></p>
                <p>Status: <strong> {p.ativo ? "ATIVO" : "FORA DE LINHA"}</strong></p>

                {p.emLinha && (
                  <Button
                    variant="destructive"
                    onClick={() => tirarDeLinha(p.id)}
                  >
                    Tirar de linha
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}