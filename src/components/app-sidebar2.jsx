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
      { name: "Pedidos", url: "/matrizPedidos" },
      { name: "Filiais", url: "/filiais" },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex items-center justify-center p-5 w-full text-center">
          <h1 className="text-5xl font-extrabold">✧Dulcis Veneris✧</h1>
        </div>
      </SidebarHeader>

      <SidebarContent>


        <NavDocuments2 items={data.linhas} />
      </SidebarContent>

      <SidebarFooter>
        {user.email ? (
          <NavUser user={user} />
        ) : (
          <div className="px-4 py-2 text-center text-sm">
            <Link href="/login" className="text-xl font-bold">
              Faça seu login
            </Link>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
