import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" })
  }

  const { email, senha } = req.body

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    })

    if (!usuario) {
      return res.status(401).json({ message: "Usuário não encontrado" })
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash)
    if (!senhaValida) {
      return res.status(401).json({ message: "Senha incorreta" })
    }

    // envia perfil junto para o frontend
    return res.status(200).json({
      message: "Login bem-sucedido",
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    })
  } catch (error) {
    console.error("Erro no login:", error)
    return res.status(500).json({ message: "Erro interno do servidor" })
  }
}
