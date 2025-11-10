import { SiteFooter } from "@/components/site-footer";
import { SiteHeader2 } from "@/components/site-header2";
import { SidebarProvider } from "@/components/ui/sidebar";
import { CarrinhoProvider } from "@/contexts/CarrinhoContext";

export default function PagamentoLayout({ children }) {
  return (
    <SidebarProvider>
      <CarrinhoProvider>
      <div className="min-h-screen flex flex-col w-full">
        <SiteHeader2 />
        <main className="flex-1 p-6">{children}</main>
        <SiteFooter />
      </div>
      </CarrinhoProvider>
    </SidebarProvider>
  );
}