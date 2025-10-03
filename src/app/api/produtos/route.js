// app/api/produtos/route.ts
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const produtos = await prisma.produto.findMany({
      orderBy: { nome: "asc" },
    });
    return new Response(JSON.stringify(produtos), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response("Erro ao buscar produtos", { status: 500 });
  }
}
