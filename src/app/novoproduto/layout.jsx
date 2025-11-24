
import { AppSidebar2 } from "@/components/app-sidebar2";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader3 } from "@/components/site-header3";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function CriarProdutosLayout({ children }) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      <AppSidebar2 variant="inset" />
      <SidebarInset>
        <SiteHeader3 />
        <div className="flex flex-1 flex-col p-6">
          {children}
          <SiteFooter />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
