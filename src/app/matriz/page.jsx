"use client";

import { useEffect, useState, useMemo } from "react";
import { use } from "react";
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
  }, [router]);


 

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
   
     <button onClick={() => router.push('/registro')}>
       Registrar novo usuário 
    </button>

  );
}
