import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function middleware(request: NextRequest) {
  const user = await stackServerApp.getUser();
  const { pathname } = request.nextUrl;

  // If user is logged in and tries to access home, redirect to dashboard
  if (user && (pathname === "/" || pathname === "/home")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If user is not logged in and tries to access dashboard, redirect to home
  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/(home)", "/dashboard/:path*"],
};
