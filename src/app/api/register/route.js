import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido" })
  }

  const { nome, cpf, email, senha, perfil, lojaId } = req.body
  const currentUser = req.body.currentUser // precisa enviar do front se quiser validação real

  if (!nome || !cpf || !email || !senha || !perfil) {
    return res.status(400).json({ message: "Campos obrigatórios faltando" })
  }

  // Validação de perfil do criador
  if (perfil === "GERENTE" && currentUser.perfil !== "ADMIN") {
    return res.status(403).json({ message: "Apenas admin pode criar gerente" })
  }
  if (perfil === "CAIXA" && !(currentUser.perfil === "ADMIN" || currentUser.perfil === "GERENTE")) {
    return res.status(403).json({ message: "Apenas admin ou gerente podem criar caixa" })
  }

  // Loja obrigatória para CAIXA e GERENTE
  if ((perfil === "CAIXA" || perfil === "GERENTE") && !lojaId) {
    return res.status(400).json({ message: "Selecione uma loja" })
  }

  try {
    const hash = await bcrypt.hash(senha, 10)

    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        cpf,
        email,
        senha_hash: hash,
        perfil,
        loja_id: perfil === "ADMIN" ? null : parseInt(lojaId),
      },
    })

    res.status(201).json({ message: "Usuário criado com sucesso", user: novoUsuario })
  } catch (err) {
    console.error(err)
    if (err.code === "P2002") {
      return res.status(400).json({ message: "CPF ou email já cadastrado" })
    }
    res.status(500).json({ message: "Erro ao criar usuário" })
  }
}
