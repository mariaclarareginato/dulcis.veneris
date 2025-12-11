
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { withAuth } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

async function handler(req) {
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Método não permitido" },
      { status: 405 }
    );
  }

  try {
    const body = await req.json();
    const { nome, email, senha, perfil, cpf, telefone, loja_id } = body;
    const criador = req.user;

    // Validação básica
    if (!nome || !email || !senha || !perfil || !cpf || !telefone || !loja_id) {
      return NextResponse.json(
        { message: "Todos os campos são obrigatórios!" },
        { status: 400 }
      );
    }

    // Regras de permissão
    if (criador.perfil === "GERENTE" && perfil !== "CAIXA") {
      return NextResponse.json(
        { message: "Gerentes só podem criar caixas." },
        { status: 403 }
      );
    }

    if (criador.perfil === "CAIXA") {
      return NextResponse.json(
        { message: "Caixas não podem criar usuários." },
        { status: 403 }
      );
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar usuário no banco
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha_hash: hashedPassword, 
        cpf,
        telefone,
        perfil,
        loja_id: Number(loja_id), 
      },
    });

    return NextResponse.json(
      { message: "Usuário criado com sucesso!", usuario: novoUsuario },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Apenas ADMIN e GERENTE podem criar usuários
export const POST = withAuth(handler, ["ADMIN", "GERENTE"]);
