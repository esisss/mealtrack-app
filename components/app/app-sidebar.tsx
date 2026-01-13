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

export function AppSidebar() {
  const { open, setOpen } = useSidebar();
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
                <Image
                  width={200}
                  height={200}
                  src={`https://picsum.photos/seed/${t.author}/200/200`}
                  alt={t.author}
                  className=" object-cover"
                  loading="lazy"
                />
              </div>
              <Link href="/handler/sign-out">
                <button className="text-primary-foreground px-2 py-1 rounded-md">
                  <LogOut className="w-6 h-6 text-foreground" />
                </button>
              </Link>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
