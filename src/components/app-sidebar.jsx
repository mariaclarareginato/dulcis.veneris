"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  IconCamera,
  IconFileAi,
  IconFileDescription,
  IconInnerShadowTop,
} from "@tabler/icons-react"

import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
    menus: [
      {
        title: "Catálogo",
        items: [
          { title: "Chocolates", url: "/caixa/chocolates" },
          { title: "Pães de mel", url: "/caixa/paes-de-mel" },
          { title: "Trufas", url: "/caixa/trufas" },
          { title: "Bolachas", url: "/caixa/bolachas" },
        ],
      },
      {
        title: "Capturar",
        icon: IconCamera,
        items: [
          { title: "Propostas ativas", url: "#" },
          { title: "Archived", url: "#" },
        ],
      },
      {
        title: "Proposta",
        icon: IconFileDescription,
        items: [
          { title: "Active Proposals", url: "#" },
          { title: "Archived", url: "#" },
        ],
      },
      {
        title: "Prompts",
        icon: IconFileAi,
        items: [
          { title: "Active Proposals", url: "#" },
          { title: "Archived", url: "#" },
        ],
      },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Dulci´s Veneris Inc.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Exibe email do usuário logado */}
        <div className="px-4 py-2 text-sm text-gray-700">
          {user.email ? `Logado como: ${user.email}` : "Usuário não logado"}
        </div>

        {data.menus.map((menu) => (
          <SidebarMenu key={menu.title}>
            <SidebarMenuButton asChild>
              <button className="flex items-center gap-2">
                {menu.icon && <menu.icon className="!size-5" />}
                <span>{menu.title}</span>
              </button>
            </SidebarMenuButton>
            {menu.items?.map((item) => (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>{item.title}</Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
