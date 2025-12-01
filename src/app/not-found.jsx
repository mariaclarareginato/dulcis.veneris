"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-6 py-10">

      {/* Imagem */}
      <img
        className="w-40 h-40 mb-8 md:w-52 md:h-52"
        src="/logos/logo.png"
        alt="Logo"
      />

      <h1 className="text-7xl md:text-9xl font-extrabold drop-shadow-lg z-10 animate-bounce">
        404
      </h1>

      <h2 className="text-3xl md:text-5xl font-extrabold mt-4">
        Página não encontrada
      </h2>

      <p className="mt-6 text-base md:text-lg font-bold max-w-xl">
        Poxa! Parece que você se perdeu, ou não tem acesso a esta página.
      </p>

      <Button
        onClick={() => router.push("/login")}
        className="px-6 py-3 p-6 rounded-2xl mt-10 text-lg font-bold"
      >
        Voltar para o Login
      </Button>

    </div>
  );
}

