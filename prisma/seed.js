import 'dotenv/config'; // <--- garante que .env seja carregado
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.produto.createMany({
    data: [
      {
        sku: "PROD001",
        codigo: "001",
        nome: "Refrigerante Cola 2L",
        descricao: "Refrigerante sabor cola, 2 litros",
        img: "https://meusite.com/images/refrigerante_cola_2l.png",
        preco_venda: 9.99,
        custo: 5.5,
        categoria: "Bebidas",
      },
      {
        sku: "PROD002",
        codigo: "002",
        nome: "Suco Laranja 1L",
        descricao: "Suco natural de laranja",
        img: "https://meusite.com/images/suco_laranja_1l.png",
        preco_venda: 7.5,
        custo: 4.0,
        categoria: "Bebidas",
      },
    ],
  });

  console.log("Seed concluída!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
