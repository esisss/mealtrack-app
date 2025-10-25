import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stackServerApp } from "@/stack/server";

export async function middleware(request: NextRequest) {
  const user = await stackServerApp.getUser();
  const { pathname } = request.nextUrl;
  const loggedOffRoutes = ["/handler/sign-in", "/handler/sign-up", "/"];
  const loggedInRoutes = [
    "/dashboard",
    "/grocery-list",
    "/pantry",
    "/planner",
    "/recipes",
    "/settings",
  ];

  if (user && loggedOffRoutes.includes(pathname)) {
    console.log("User is logged in");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!user && loggedInRoutes.includes(pathname)) {
    console.log("User is not logged in");
    return NextResponse.redirect(new URL("/handler/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard",
    "/grocery-list",
    "/pantry",
    "/planner",
    "/recipes",
    "/settings",
    "/handler/sign-in",
    "/handler/sign-up",
  ],
};
