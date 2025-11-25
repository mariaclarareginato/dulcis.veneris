import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    const data = await req.formData();
    const file = data.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Nome original do arquivo
    const fileName = file.name.replaceAll(" ", "_");

    // Caminho absoluto: /public/catalogo/
    const filePath = path.join(process.cwd(), "public", "catalogo", fileName);

    // Lê o arquivo em buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Salva o arquivo no disco
    await writeFile(filePath, buffer);

    // Caminho público acessível pelo navegador:
    const publicPath = `/catalogo/${fileName}`;

    return NextResponse.json({
      message: "Upload realizado com sucesso",
      url: publicPath,
    });

  } catch (err) {
    console.error("Erro no upload:", err);
    return NextResponse.json(
      { error: "Erro ao fazer upload" },
      { status: 500 }
    );
  }
}
