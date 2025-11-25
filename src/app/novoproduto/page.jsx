"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectTrigger, SelectValue,
  SelectContent, SelectItem,
} from "@/components/ui/select";

export default function NovoProduto() {
  const router = useRouter();

  const [form, setForm] = useState({
    sku: "",
    nome: "",
    codigo: "",
    categoria: "",
    descricao: "",
    preco_venda: "",
    custo: "",
    img: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);


  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setForm({ ...form, img: data.url });
  }

  async function criarProduto() {
    setLoading(true);

    try {
      const res = await fetch("/api/matriz-produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          preco_venda: Number(form.preco_venda),
          custo: Number(form.custo),
          ativo: true,
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar produto");

      alert("Produto criado!");
      router.push("/produtos");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar produto");
    }
    setLoading(false);
  }

  return (
    <div className="p-8 flex justify-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold">
            Criar novo produto
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label className="m-3">SKU</Label>
            <Input name="sku" value={form.sku} onChange={handleChange} />
          </div>

          <div>
            <Label className="m-3">Código interno</Label>
            <Input name="codigo" value={form.codigo} onChange={handleChange} />
          </div>

          <div>
            <Label className="m-3">Nome</Label>
            <Input name="nome" value={form.nome} onChange={handleChange} />
          </div>

          <div>
            <Label className="m-3">Categoria</Label>
            <Select
              value={form.categoria}
              onValueChange={(v) => setForm({ ...form, categoria: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chocolates">Chocolates</SelectItem>
                <SelectItem value="Pães-de-mel">Pães-de-mel</SelectItem>
                <SelectItem value="Bolachas">Bolachas</SelectItem>
                <SelectItem value="Trufas">Trufas</SelectItem>
                <SelectItem value="Outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="m-3">Descrição</Label>
            <Input name="descricao" value={form.descricao} onChange={handleChange} />
          </div>

          <div>
            <Label className="m-3">Preço venda</Label>
            <Input
              name="preco_venda"
              type="number"
              value={form.preco_venda}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label className="m-3">Custo</Label>
            <Input
              name="custo"
              type="number"
              value={form.custo}
              onChange={handleChange}
            />
          </div>

        

    <div className="flex flex-col gap-2">
     <Label className="m-3">Imagem</Label>

    <input
    id="img"
    type="file"
    accept="image/*"
    onChange={(e) => {
      handleImage(e);

      // cria URL temporária pra mostrar preview

      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
      }
    }}
    className="hidden"
  />

  <label
    htmlFor="img"
    className="cursor-pointer px-4 py-2 rounded-xl font-semibold w-fit transition"
  >
    Selecionar imagem
  </label>

 
  {/* Preview img */}

  {preview && (
    <img
      src={preview}
      alt="Preview"
      className="mt-2 w-32 h-32 object-cover rounded-xl border"
    />
  )}
</div>

          <Button
            onClick={criarProduto}
            disabled={loading}
            className="w-full mt-4"
          >
            {loading ? "Salvando..." : "Criar produto"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
