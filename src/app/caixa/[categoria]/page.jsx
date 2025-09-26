import Image from "next/image"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default async function CategoriaPage({ params }) {
  const { categoria } = params

  const res = await fetch("http://localhost:3000/api/produtos", {
    cache: "no-store",
  })
  const produtos = await res.json()

  const categoriaNormalizada = decodeURIComponent(categoria).toLowerCase()
  const produtosFiltrados = produtos.filter(
    (p) => p.categoria.toLowerCase() === categoriaNormalizada
  )

  if (produtosFiltrados.length === 0) {
    return (
      <h2 className="text-2xl font-bold mb-6">
        Nenhum produto encontrado em "{categoria}"
      </h2>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-bold mb-6 capitalize">{categoria}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {produtosFiltrados.map((produto) => (
          <Card key={produto.id} className="rounded-2xl shadow-md hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{produto.nome}</CardTitle>
              <CardDescription>{produto.sku}</CardDescription>
            </CardHeader>
            <CardContent>
              {produto.img && (
                <div className="relative w-full h-72 mb-4">
                  <Image
                    src={produto.img}
                    alt={produto.nome}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
  <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
  {produto.descricao || "Sem descrição"}
</p>

              <div className="flex justify-between font-semibold">
                <span>Preço:</span>
                <span>R$ {produto.preco_venda.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
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
