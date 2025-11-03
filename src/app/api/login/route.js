import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "chave-secreta";

export async function POST(req) {
  try {
    const { email, senha } = await req.json();

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario)
      return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida)
      return NextResponse.json({ message: "Senha incorreta" }, { status: 401 });

    const token = jwt.sign(
      { id: usuario.id, loja_id: usuario.loja_id, perfil: usuario.perfil },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    const response = NextResponse.json(
      {
        user: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil,
          loja_id: usuario.loja_id,
        },
        message: "Login efetuado com sucesso!",
      },
      { status: 200 }
    );

    //  grava cookie HTTP-only
    
    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 8, // 8h
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Erro interno no login" }, { status: 500 });
  }
}
