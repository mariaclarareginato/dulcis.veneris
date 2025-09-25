import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    // Buscar todos os produtos, ordenados pelo nome
    const produtos = await prisma.produto.findMany({
      orderBy: { nome: "asc" },
      include: {
        estoques: true,      // incluir informações de estoque, se quiser
        logs: true,          // incluir logs de auditoria, se quiser
      },
    });

    return new Response(JSON.stringify(produtos), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Erro ao buscar produtos" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
