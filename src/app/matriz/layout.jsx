
import { AppSidebar } from "@/components/app-sidebar2"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header3"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function MatrizLayout({ children }) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-6">
          {children}
          <SiteFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
