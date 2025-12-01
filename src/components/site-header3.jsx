"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { CartDropdown } from "./ui/CartDropdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader3() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita problemas de hidratação
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  // Tema atual real (resolve "system")
  const currentTheme = theme === "system" ? systemTheme : theme;

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
         
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="flex items-center gap-1">
                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Toggle theme</span>
                
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="font-bold text-lg" onClick={() => setTheme("light")}>Tema claro</DropdownMenuItem>
              <DropdownMenuItem className="font-bold text-lg" onClick={() => setTheme("dark")}>Tema escuro</DropdownMenuItem>
              <DropdownMenuItem className="font-bold text-lg" onClick={() => setTheme("system")}>Tema do sistema</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


        </div>
    
    </header>
  );
}
