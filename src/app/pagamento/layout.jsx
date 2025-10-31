import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header2";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function PagamentoLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col w-full">
        <SiteHeader />
        <main className="flex-1 p-6">{children}</main>
        <SiteFooter />
      </div>
    </SidebarProvider>
  );
}
