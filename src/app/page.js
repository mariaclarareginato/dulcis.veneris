"use client";

// Importações

import React from "react";
import { useRouter } from 'next/navigation';
 


export default function Home() {
    const router = useRouter();
    
  return (
    <div className="relative w-full h-screen overflow-hidden">
    

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
  <h1 className="text-2xl md:text-3xl font-bold text-gray-200 leading-snug max-w-2xl">
    Bem-Vindo ao sistema Dulcis Veneris! 
  </h1>

  {/* Logo */}

  <img
  
  src="logos/logo.png"
   
  />

 
      {/* Botões */}
 
        <br />
 
        <div className="flex gap-8 ">
          <button
            className="inline-flex items-center justify-center
                       text-base font-semibold text-white
                       bg-red-800 rounded-2xl
                       !px-8 !py-4    
                       shadow-lg
                       transition-all duration-300 ease-out
                       hover:bg-red-600 hover:scale-105 hover:shadow-xl
                       active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-500/40"onClick={() => router.push("/login")}
          >
            Entrar
          </button>
 
        
        </div>
      </div>
    </div>
  );
}
 