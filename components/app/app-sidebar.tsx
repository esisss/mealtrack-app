"use client";
import {
  Calendar,
  CookingPot,
  LayoutDashboard,
  LogOut,
  Refrigerator,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { isDesktop } from "@/utils/iseDesktopSized";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Recipes",
    url: "/recipes",
    icon: CookingPot,
  },
  {
    title: "Planner",
    url: "/planner",
    icon: Calendar,
  },
  { title: "Pantry", url: "/pantry", icon: Refrigerator },
  // { title: "Settings", url: "/settings", icon: Settings },
];

const t = {
  author: "jesusesis",
};

import { useState } from "react";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { useRouter } from "next/navigation";

export function AppSidebar({ id, displayName }: { id: string; displayName: string }) {
  const { open, setOpen } = useSidebar();
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    router.push("/handler/sign-out");
  };

  return (
    <Sidebar>
      <SidebarContent >
        <SidebarGroup>
          <SidebarTrigger className="sm:hidden absolute right-3 top-3" />
          <SidebarGroupContent className="h-[calc(100vh-2rem)] flex flex-col justify-between">
            <SidebarMenu>
              <h2 className="text-xl font-bold italic ml-2 my-2">MealWise</h2>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton onClick={() => setOpen(isDesktop() ? true : !open)} asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <div className="mt-4 mx-2 flex items-center justify-between">
              <div className="h-8 w-8 rounded-md overflow-hidden">
                <div>
                  <Image
                    width={200}
                    height={200}
                    src={`https://picsum.photos/seed/${id}/200/200`}
                    alt={displayName || "User"}
                    className=" object-cover"
                    loading="lazy"
                  />
                </div>
                <h3>{displayName || "User"}</h3>
              </div>
              <button
                onClick={() => setIsLogoutDialogOpen(true)}
                className="text-primary-foreground px-2 py-1 rounded-md"
              >
                <LogOut className="w-6 h-6 text-foreground" />
              </button>
            </div>
            <ConfirmationDialog
              isOpen={isLogoutDialogOpen}
              onClose={() => setIsLogoutDialogOpen(false)}
              onConfirm={handleLogout}
              title="Logout"
              description="Are you sure you want to log out?"
              confirmText="Logout"
              variant="destructive"
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
