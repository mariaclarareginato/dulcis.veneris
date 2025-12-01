"use client";

import { useState, useEffect } from "react";
import { CartDropdown } from "./ui/CartDropdown";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function SiteHeader() {

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <header className="relative border-b h-50 flex items-center px-4">
     
      <div className="flex items-center gap-2">
        <SidebarTrigger />
      </div>

      {/* LOGO CENTRAL */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
        <img
          src="/logos/logo.png"
          alt="Logo"
          className="h-35 w-35 md:h-40 md:w-40 object-contain"
        />
      </div>

     
      <div className="ml-auto flex items-center gap-2">
        
        <CartDropdown />
      </div>
    </header>
  );
}
