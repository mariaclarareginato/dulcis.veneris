"use client";
 
import React from "react";
 
export function SiteFooter() {
  return (
    <footer className="mt-auto py-6 px-4 md:px-16 w-full border-t">
    
        <div className="text-m text-muted-foreground font-bold text-center">
          © {new Date().getFullYear()} Dulcis Veneris. Todos os direitos reservados.
        </div>
      
    </footer>
  );
}
 
 