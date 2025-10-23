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

    // 🎯 MUDANÇA CRUCIAL: Crie a resposta antes de adicionar o cookie
    const response = NextResponse.json({
      // REMOVA: token, <--- O token não vai mais no corpo!
      user: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        loja_id: usuario.loja_id,
      },
      message: "Login efetuado com sucesso!"
    }, { status: 200 });
    
    // 🎯 MUDANÇA CRUCIAL: Adiciona o Cookie HTTP ao cabeçalho da resposta
    // 1. token: O Middleware agora pode ler 'token'
    // 2. HttpOnly: Impede que o JS (localStorage) acesse, aumentando a segurança.
    // 3. Path=/: Garante que o cookie seja enviado em todas as rotas.
    // 4. Max-Age: Define o tempo de expiração em segundos (8 horas)
    const maxAge = 60 * 60 * 8; // 8 horas

    response.cookies.set('token', token, {
        httpOnly: true, // Impedir acesso via JS (segurança)
        maxAge: maxAge,
        path: '/', // Disponível em todo o site
        secure: process.env.NODE_ENV === 'production', // Use 'secure' em produção (HTTPS)
        sameSite: 'strict',
    });
    
    // 💡 Opcional: Adicionar o perfil para ajudar no middleware (se precisar de redirecionamento mais esperto)
    response.cookies.set('user_perfil', usuario.perfil, {
        httpOnly: false, // Pode ser lido pelo JS do cliente, se necessário, mas o middleware já consegue ler.
        maxAge: maxAge,
        path: '/', 
        sameSite: 'strict',
    });


    return response; // Retorna a resposta com o cookie

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "Erro interno no login" },
      { status: 500 }
    );
  }
}