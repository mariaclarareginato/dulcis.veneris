"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { NavMain } from "@/components/nav-main"
import { NavDocuments3 } from "@/components/nav-documents3"
import { NavUser2 } from "@/components/nav-user2"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"

export function AppSidebar3({ ...props }) {
  const [user, setUser] = useState({ name: "", email: "" })

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const data = {
    linhas: [
      { name: "Caixas e usuários", url: "/caixas" },
      { name: "Despesas e lucro", url: "/despesas.lucro" },
      { name: "Pedidos", url: "/pedidos" },
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


        <NavDocuments3 items={data.linhas} />
      </SidebarContent>

      <SidebarFooter>
        {user.email ? (
          <NavUser2 user={user} />
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
