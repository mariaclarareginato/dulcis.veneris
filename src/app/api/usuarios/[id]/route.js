import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    await prisma.usuario.delete({
      where: { id: Number(params.id) },
    });

    return NextResponse.json({ message: "Usuário deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json(
      { message: "Erro ao deletar usuário" },
      { status: 500 }
    );
  }
}


export async function PUT(req, { params }) {
  try {
    const data = await req.json();

    const updated = await prisma.usuario.update({
      where: { id: Number(params.id) },
      data: {
        nome: data.nome,
        email: data.email,
        cpf: data.cpf,
        telefone: data.telefone,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao editar usuário:", error);
    return NextResponse.json(
      { message: "Erro ao editar usuário" },
      { status: 500 }
    );
  }
}
