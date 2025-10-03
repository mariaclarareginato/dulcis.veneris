import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export default async function handler(req, res) {
  const lojas = await prisma.loja.findMany({
    where: { ativo: true },
    select: { id: true, nome: true, cidade: true, estado: true },
  })
  res.status(200).json({ lojas })
}
