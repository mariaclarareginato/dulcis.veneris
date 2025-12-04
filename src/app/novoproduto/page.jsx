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
      <Card className="w-full max-w-lg
             bg-transparent rounded-xl
             backdrop-blur-md
             shadow-[0_0_35px_10px_rgba(0,0,0,.25)]
             dark:shadow-[0_0_35px_10px_rgba(255,0,0,.25)]
             transition-all duration-300">
        <CardHeader>
          <br></br>
          <CardTitle className="text-4xl font-extrabold">
            Criar novo produto
          </CardTitle>
        </CardHeader>

       <br></br>
        <CardContent className="space-y-4">
          <div>
            <Label className="m-3 text-lg">SKU</Label>
            <Input name="sku" value={form.sku} onChange={handleChange} />
          </div>

          <div>
            <Label className="m-3 text-lg">Código interno</Label>
            <Input name="codigo" value={form.codigo} onChange={handleChange} />
          </div>

          <div>
            <Label className="m-3 text-lg">Nome</Label>
            <Input name="nome" value={form.nome} onChange={handleChange} />
          </div>

           <div>
  <Label className="m-3 text-lg">Categoria</Label>

  <Select
    className="text-lg h-70 font-semibold"
    value={form.categoria}
    onValueChange={(v) => setForm({ ...form, categoria: v })}
  >
    <SelectTrigger
      className="sm:min-h-[50px] font-semibold text-base w-full text-lg min-h-[90px] whitespace-normal break-words text-left"
    >
      <SelectValue placeholder="Clique aqui para selecionar o tipo do produto" />
    </SelectTrigger>

    <SelectContent className="text-lg font-semibold">
      <SelectItem className="text-lg font-semibold" value="Chocolates">Chocolates</SelectItem>
      <SelectItem className="text-lg font-semibold" value="Pães-de-mel">Pães-de-mel</SelectItem>
      <SelectItem className="text-lg font-semibold" value="Bolachas">Bolachas</SelectItem>
      <SelectItem className="text-lg font-semibold" value="Trufas">Trufas</SelectItem>
      <SelectItem className="text-lg font-semibold" value="Outros">Outros</SelectItem>
    </SelectContent>
  </Select>
</div>


          <div>
            <Label className="m-3 text-lg">Descrição</Label>
            <Input name="descricao" value={form.descricao} onChange={handleChange} />
          </div>

          <div>
            <Label className="m-3 text-lg">Preço venda</Label>
            <Input
              name="preco_venda"
              type="number"
              value={form.preco_venda}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label className="m-3 text-lg">Custo</Label>
            <Input
              name="custo"
              type="number"
              value={form.custo}
              onChange={handleChange}
            />
          </div>

        

    <div className="flex flex-col gap-2">
     

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
<br></br>
 <label htmlFor="img"
    variant="destructive"
    className="cursor-pointer p-4 rounded-xl border font-semibold text-lg">
  
    Clique aqui para selecionar a imagem do produto
  
</label>

 
  {/* Preview img */}

  {preview && (
    <img
      src={preview}
      alt="Preview"
      className="mt-6 w-32 h-32 object-cover rounded-xl border"
    />
  )}
</div>

          <Button
            onClick={criarProduto}
            disabled={loading}
            className="w-50  text-xl p-6 font-bold mt-4"
          >
            {loading ? "Salvando..." : "Criar produto"}
          </Button>
          <br></br>
          <br></br>
        </CardContent>
      </Card>
    </div>
  );
}
