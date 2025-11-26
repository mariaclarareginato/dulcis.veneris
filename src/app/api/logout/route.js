import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // Cria a resposta de sucesso
    const response = NextResponse.json(
      { message: "Logout realizado com sucesso" },
      { status: 200 }
    );

    // Remove o cookie do token
    response.cookies.set("token", "", {
      httpOnly: true,
      path: "/",
      maxAge: 0, // Expira imediatamente
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err) {
    console.error("Erro no logout:", err);
    return NextResponse.json(
      { message: "Erro ao realizar logout" },
      { status: 500 }
    );
  }
}
