"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { getLoggedUser } from "@/lib/auth-client";

export default function MatrizPage({ params }) {
  const router = useRouter();
 

  //  Estados
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  //  1. BUSCA DADOS DO USUÁRIO LOGADO
  useEffect(() => {
    const user = getLoggedUser();

    if (!user) {
      // Se não estiver logado, redireciona para login
      router.push("/login");
      return;
    }

    setUserData(user);
    setLoading(false);
  }, [router]);



    //  LOADING ENQUANTO VERIFICA AUTENTICAÇÃO
  if (!userData) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  //  ESTADO DE CARREGAMENTO
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-16 h-16 border-4 border-red-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }
 

  //  ESTADO DE ERRO
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p className="text-lg text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Tentar Novamente
        </Button>
      </div>
    );
  }



  //  RENDERIZAÇÃO PRINCIPAL
  return (
   
     <Button onClick={() => router.push('/registro')}>
       Registrar novo usuário 
    </Button>

  );
}