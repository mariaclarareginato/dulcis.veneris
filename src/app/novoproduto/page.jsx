"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

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

   const inputClass = "w-full border text-lg bg-transparent rounded-lg px-3 py-2 font-semibold";

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
            <input className={inputClass} name="sku" value={form.sku} onChange={handleChange} />
          </div>

          <div>
            <Label className="m-3 text-lg">Código interno</Label>
            <input className={inputClass} name="codigo" value={form.codigo} onChange={handleChange} />
          </div>

          <div>
            <Label className="m-3 text-lg">Nome</Label>
            <input className={inputClass} name="nome" value={form.nome} onChange={handleChange} />
          </div>

           <div>
  <Label className="m-3 text-lg">Categoria</Label>

  {/* CATEGORIA */}
<DropdownMenu>
  <DropdownMenuTrigger
    className="sm:min-h-[50px] font-semibold text-base w-full text-lg min-h-[90px] whitespace-normal break-words text-left px-4 border rounded-xl opacity-70 flex justify-between items-center"
  >
    {form.categoria || ""}
  
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 9l6 6 6-6" 
      />
   
  </DropdownMenuTrigger>

  <DropdownMenuContent className="max-h-48 text-lg font-semibold overflow-y-auto">
    {["Chocolates", "Pães-de-mel", "Bolachas", "Trufas", "Outros"].map((cat) => (
      <DropdownMenuItem
        key={cat}
        className="text-lg font-semibold"
        onClick={() => setForm({ ...form, categoria: cat })}
      >
        {cat}
      </DropdownMenuItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
</div>


          <div>
            <Label className="m-3 text-lg">Descrição</Label>
            <input className={inputClass} name="descricao" value={form.descricao} onChange={handleChange} />
          </div>

          <div>
            <Label className="m-3 text-lg">Preço venda</Label>
            <input
              name="preco_venda"
              type="number"
              value={form.preco_venda}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <Label className="m-3 text-lg">Custo</Label>
            <input
              name="custo"
              type="number"
              value={form.custo}
              onChange={handleChange}
              className={inputClass}
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
