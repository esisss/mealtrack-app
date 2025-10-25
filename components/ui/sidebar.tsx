"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  ShoppingCart,
  Package,
  Calendar,
  ChefHat,
  Settings,
  PanelLeft,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/grocery-list", icon: ShoppingCart, label: "Grocery List" },
  { href: "/pantry", icon: Package, label: "Pantry" },
  { href: "/planner", icon: Calendar, label: "Planner" },
  { href: "/recipes", icon: ChefHat, label: "Recipes" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  const navLinks = (
    <nav className="grid items-start gap-2 text-sm font-medium">
      {navItems.map(({ href, icon: Icon, label }) => (
        <Link
          key={label}
          href={href}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
            pathname === href ? "bg-muted text-primary" : ""
          }`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="flex h-full max-h-screen flex-col">
      {/* Mobile Sidebar */}
      <div className="sm:hidden border-r bg-background">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="sm:hidden m-2 border-none fixed bottom-1 left-1 "
            >
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="sm:max-w-xs h-full flex flex-col justify-between"
          >
            <h1 className="text-xl font-bold italic px-4 m-4 ">MealWise</h1>
            <div className="flex-1 overflow-auto py-2">{navLinks}</div>
            <div className="flex items-center gap-3 justify-between m-4">
              <div className="h-8 w-8 rounded-full bg-black"></div>
              <Link href="/handler/sign-out">
                <Button variant="outline" size="icon">
                  <LogOut className="h-8 w-8" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-background sm:flex sm:flex-col h-full fixed top-0 w-[250px] pt-4">
        <aside className="flex h-full flex-col bg-background">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <h1 className="text-xl font-bold italic px-4">MealWise</h1>
            <div className="flex-1 overflow-auto py-2">{navLinks}</div>
            <div className="mt-auto p-4 border-t">
              <div className="flex items-center gap-3 justify-between">
                <div className="h-9 w-9 rounded-full bg-black"></div>
                <Link href="/handler/sign-out">
                  <Button variant="ghost" size="icon">
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only">Sign out</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
