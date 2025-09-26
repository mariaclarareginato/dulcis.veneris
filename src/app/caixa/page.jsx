import Image from "next/image"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

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
          <Card key={produto.id} className="rounded-2xl shadow-md hover:shadow-lg transition overflow-hidden">
            {produto.img && (
              <div className="relative w-full h-48">
                <Image src={produto.img} alt={produto.nome} fill className="object-cover" />
              </div>
            )}

            <CardHeader>
              <CardTitle>{produto.nome}</CardTitle>
              <CardDescription>
                {produto.sku} | {produto.categoria}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-sm text-muted-foreground">
                {produto.descricao || "Sem descrição"}
              </p>
              <div className="flex justify-between items-center font-semibold">
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
