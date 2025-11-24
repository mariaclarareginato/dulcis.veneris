"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NovoProduto() {
  const router = useRouter();

  const [form, setForm] = useState({
    nome: "",
    codigo: "",
    preco_venda: "",
    custo: "",
    img: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function criarProduto() {
    setLoading(true);

    try {
      const res = await fetch("/api/matriz-produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: form.nome,
          codigo: form.codigo,
          preco_venda: Number(form.preco_venda),
          custo: Number(form.custo),
          img: form.img,
          ativo: true,
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar produto");

      alert("Produto criado com sucesso!");
      router.push("/matriz/produtos");

    } catch (err) {
      console.error(err);
      alert("Erro ao criar produto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 flex justify-center">
      <Card className="w-full max-w-2xl mt-50">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold">
            Criar novo produto
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">

          <div>
            <Label className="m-3">Nome do produto</Label>
            <Input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Ex: Trufa Bombom 60g"
            />
          </div>

          <div className="mt-3">
            <Label className="m-3">Código</Label>
            <Input
              name="codigo"
              value={form.codigo}
              onChange={handleChange}
              placeholder="Ex: COD060"
            />
          </div>

          <div>
            <Label className="m-3">Preço de venda</Label>
            <Input
              name="preco_venda"
              type="number"
              step="0.01"
              value={form.preco_venda}
              onChange={handleChange}
              placeholder="Ex: 12.90"
            />
          </div>

          <div>
            <Label className="m-3">Custo</Label>
            <Input
              name="custo"
              type="number"
              step="0.01"
              value={form.custo}
              onChange={handleChange}
              placeholder="Ex: 6.50"
            />
          </div>


          <div>
            <Label className="m-3">URL da Imagem</Label>
            <Input
              name="img"
              value={form.img}
              onChange={handleChange}
              placeholder="Link da imagem do produto"
            />
          </div>

          <Button
            className="w-full mt-4 font-bold"
            onClick={criarProduto}
            disabled={loading}
          >
            {loading ? "Salvando..." : "Criar produto"}
          </Button>

        </CardContent>
      </Card>
    </div>
  );
}
