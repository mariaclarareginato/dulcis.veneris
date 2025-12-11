

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader2 } from "@/components/site-header2";
import {  SidebarProvider } from "@/components/ui/sidebar";

export default function RegistroLayout({ children }) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      }}
    >
      
        <div className="min-h-screen flex flex-col w-full">
              <SiteHeader2 />
              <main className="flex-1 p-6">{children}</main>
              <SiteFooter />
            </div>

    </SidebarProvider>
  );
}
