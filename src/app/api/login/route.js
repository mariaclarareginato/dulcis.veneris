import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // garante que roda no Node

const JWT_SECRET = process.env.JWT_SECRET || "dulcis";

export async function POST(req) {
  try {
    const { email, senha } = await req.json();

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });

    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) return NextResponse.json({ message: "Senha incorreta" }, { status: 401 });

    const token = await new SignJWT({
      id: usuario.id,
      perfil: usuario.perfil,
      loja_id: usuario.loja_id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("8h")
      .sign(new TextEncoder().encode(JWT_SECRET));

    const response = NextResponse.json({
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        loja_id: usuario.loja_id,
      },
      message: "Login efetuado com sucesso!",
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 8,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Erro interno no login" }, { status: 500 });
  }
}
