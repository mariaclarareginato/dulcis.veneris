"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { NavMain } from "@/components/nav-main"
import { NavDocuments } from "@/components/nav-documents"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }) {
  const [user, setUser] = useState({ name: "", email: "" })

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

 
const data = {

  catalogo: [
    {
      name: "Catálogo (produtos em estoque)",
      url: "/caixa",
    },
  ],
  linhas: [
    { name: "Chocolates", url: "/caixa/chocolates" },
    { name: "Pães de mel", url: "/caixa/paes-de-mel" },
    { name: "Trufas", url: "/caixa/trufas" },
    { name: "Bolachas", url: "/caixa/bolachas" },
  ],
};


  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="hover:bg-transparent transition-none">
        <div>
             <h1 className="text-base font-bold text-center p-5">Dulci´s Veneris Inc.</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
         <NavMain items={data.catalogo} />
        <NavDocuments items={data.linhas} />
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
