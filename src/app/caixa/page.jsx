// src/app/caixa/page.jsx
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { prisma } from "@/lib/prisma"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default async function Page() {
  // Busca os produtos no banco
  const produtos = await prisma.produto.findMany({
    orderBy: { nome: "asc" },
  });

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6">
          <h2 className="text-2xl font-bold mb-6">Produtos</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {produtos.map((produto) => (
              <Card
                key={produto.id}
                className="rounded-2xl shadow-md hover:shadow-lg transition"
              >
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
