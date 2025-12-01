"use client";
 
import React from "react";
 
export function SiteFooter() {
  return (
    <footer className="mt-auto py-6 px-6 md:px-16 w-full border-t">
    
        <div className="text-lg text-muted-foreground font-bold text-center">
          &copy; {new Date().getFullYear()} Dulcis Veneris. Todos os direitos reservados.
        </div>
      
    </footer>
  );
}
 
 