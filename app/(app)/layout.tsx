import { AppSidebar } from "@/components/app/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen ">
      <SidebarProvider>
        <AppSidebar />
        <main className="w-screen">
          <SidebarTrigger className="sticky top-3 left-3 mx-2 bg-accent-foreground" />
          <div className="m-2">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
