"use client"

import * as React from "react"
import {
  IconCamera,  
  IconFileAi,
  IconFileDescription,
  IconInnerShadowTop,
 
  
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
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

const data = {
  user: {
    name: "Carlos Madeira",
    email: "carlos@diretoria.com",
    avatar: "/avatars/shadcn.jpg",
  },
 
  navClouds: [
    {
      title: "Capturar",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Propostas ativas",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposta",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],




  catalogo: [
    {
      name: "Catálogo",
      url: "/caixa",  // todos
    },
  ],




  linhas: [
 
    {
      name: "Chocolates",
      url: "/caixa/chocolates",
    },
    {
      name: "Pães de mel",
      url: "/caixa/paes-de-mel",
    },
    {
      name: "Trufas",
      url: "/caixa/trufas",
    },
    {
      name: "Bolachas",
      url: "/caixa/bolachas",
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Dulci´s Veneris Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.catalogo}/>
   
        <NavDocuments items={data.linhas} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
