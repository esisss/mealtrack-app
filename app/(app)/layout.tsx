import { AppSidebar } from "@/components/app/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/auth";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <div className="min-h-screen ">
      <SidebarProvider>
        <AppSidebar id={user?.id!} displayName={user?.displayName!} />
        <main className="w-screen">
          <SidebarTrigger className="sticky top-3 left-3 mx-2 bg-accent-foreground" />
          <div className="m-2">{children}</div>
        </main>
      </SidebarProvider>
    </div>
  );
}
