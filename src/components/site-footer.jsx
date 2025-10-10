"use client";
 
import React from "react";
 
export function SiteFooter() {
  return (
    <footer className="mt-auto py-6 px-4 md:px-16 w-full border-t">
      <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center gap-4">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Dulcis Veneris. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
 
 