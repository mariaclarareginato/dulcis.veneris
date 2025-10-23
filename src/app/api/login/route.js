import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { email, senha } = await req.json();
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return NextResponse.json(
        { message: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return NextResponse.json({ message: "Senha incorreta" }, { status: 401 });
    }

    const token = jwt.sign(
      { id: usuario.id, loja_id: usuario.loja_id, perfil: usuario.perfil },
      process.env.JWT_SECRET || "chave-secreta",
      { expiresIn: "8h" }
    );

    return NextResponse.json({
      token,
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        loja_id: usuario.loja_id, // ✅ chave necessária para o caixa
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Erro interno no login" },
      { status: 500 }
    );
  }
}
