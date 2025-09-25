// prisma/seed.js
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Exemplo: adicionar alguns produtos
  await prisma.produto.createMany({
    data: [
      {
        sku: "SKU001",
        codigo: "COD001",
        nome: "Produto A",
        descricao: "Primeiro produto de teste",
        preco_venda: 100.0,
        custo: 70.0,
        categoria: "Categoria 1",
      },
      {
        sku: "SKU002",
        codigo: "COD002",
        nome: "Produto B",
        descricao: "Segundo produto",
        preco_venda: 150.0,
        custo: 90.0,
        categoria: "Categoria 2",
      },
    ],
  })
}

main()
  .then(async () => {
    console.log("✅ Seed concluído com sucesso!")
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
