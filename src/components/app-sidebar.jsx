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
    const userData = sessionStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

 
const data = {

  catalogo: [
    {
      name: "Catálogo",
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
    <SidebarHeader>
  <div className="flex items-center justify-center p-5 w-full text-center">
    <h1 className="text-5xl font-extrabold">✧Dulcis Veneris✧</h1>
  </div>
</SidebarHeader>


      </SidebarHeader>

      <SidebarContent>
         <NavMain items={data.catalogo} />
         
         <div className="flex items-center my-6 opacity-60">
  <span className="flex-1 border-t border-white/800"></span>
  <span className="flex-1 border-t border-white/800"></span>
</div>

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
