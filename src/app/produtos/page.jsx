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
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
        <h1 className="text-4xl font-extrabold">Produtos </h1>
       
        <p className="text-muted-foreground  font-bold mt-4">Crie um novo produto, ou tire qualquer um deles do estoque.</p>
        
       
       
        <Button className="p-7 mt-5" onClick={() => window.location.href = "/novoproduto"}>
          <p className="font-extrabold">Criar novo produto</p>
        </Button>
        
</div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {produtos.map((p) => (
            <Card key={p.id}>
              <CardHeader>
                <CardTitle className="font-extrabold text-xl">{p.nome}</CardTitle>
                <img src={p.img} className="mt-5 mb-10 w-full h-full object-cover"></img>
                
              </CardHeader>
              <CardContent className="space-y-3 mt-5">
                <p>Código: <strong>{p.codigo}</strong></p>
                <p>Preço: <strong>R$ {Number(p.preco_venda).toFixed(2)}</strong></p>
                <p>Custo: <strong>R$ {Number(p.custo).toFixed(2)}</strong></p>
                <p>Status: <strong> {p.ativo ? "ATIVO" : "FORA DE LINHA"}</strong></p>

                 <br></br>

                {p.ativo && (
                  <Button 
                   
                    onClick={() => tirarDeLinha(p)}
                  >
                   <p className="font-bold"> Tirar de linha </p>
                  </Button>
                )}

                 {!p.ativo && (
                  <Button
                    variant="destructive"
                    onClick={() => colocarNaLinha(p)}
                  >
                    Colocar na linha
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