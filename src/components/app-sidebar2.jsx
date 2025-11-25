"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { NavMain } from "@/components/nav-main"
import { NavDocuments2 } from "@/components/nav-documents2"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

export function AppSidebar2({ ...props }) {
  const [user, setUser] = useState({ name: "", email: "" })

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

 
const data = {

 
  linhas: [
    { name: "Produtos", url: "/produtos" },
    { name: "Pedidios", url: "/matrizPedidos" },
    { name: "Filiais", url: "/filiais" },
 
  ],
};


  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="hover:bg-transparent transition-none">
    <SidebarHeader>
  <div className="flex items-center gap-4 p-5">
    <img
      className="h-10 w-10"
      src="/logos/logo.png"
      alt="Logo"
    />
    <h1 className="text-base font-bold">Dulci´s Veneris Inc.</h1>
  </div>
</SidebarHeader>

      </SidebarHeader>

      <SidebarContent>
        
        <NavDocuments2 items={data.linhas} />
      </SidebarContent>

      <SidebarFooter>
        {user.email ? <NavUser user={user} /> : null}

         {/* Se usuário não estiver logado, mostrar link de login */}
        {!user.email && (
          <div className="px-4 py-2 text-center text-sm">
            <Link href="/login" className="text-lg font-semibold hover:underline decoration-dotted">
              Faça seu login
            </Link>
          </div>
        )}

      </SidebarFooter>

       
    </Sidebar>
  )
}
