import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

export default async function Page() {
  const res = await fetch("http://localhost:3000/api/produtos", {
    cache: "no-store",
  })
  const produtos = await res.json()

  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Produtos</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtos.map((produto) => (
      <Card key={produto.id} className="rounded-2xl shadow-md hover:shadow-lg transition">
  {/* Imagem */}
  {produto.img && (
    <div className="relative w-full h-72 overflow-hidden rounded-t-2xl">
      <Image
        src={produto.img}
        alt={produto.nome}
        fill
        className="object-cover"
      />
    </div>
  )}

  {/* Conteúdo do card */}
  <CardContent className="h-auto overflow-visible">
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
    <div className="flex justify-between items-center text-sm text-muted-foreground">
      <span>Custo:</span>
      <span>R$ {produto.custo.toFixed(2)}</span>
    </div>
  </CardContent>
</Card>

        ))}
      </div>
    </>
  )
}
