import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { GitHubLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MealWise — Plan meals. Shop smarter. Spend less",
  description:
    "Recipes vault, weekly meal planner, grocery list generator, and food spend tracker—all in one simple app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <Toaster
                position="top-right"
                containerStyle={{ top: "2rem", right: "2rem" }}
                toastOptions={{
                  style: {
                    border: "1px solid #713200",
                    padding: "16px",
                  },
                }}
              />
              {children}
              <footer className="w-full py-6 border-t">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-8">
                  <p className="text-sm text-muted-foreground">
                    Built by{" "}
                    <Link
                      href="https://github.com/esisss/mealtrack-app"
                      className="font-medium underline underline-offset-4"
                    >
                      @esisss
                    </Link>
                  </p>
                  <div className="flex items-center gap-4">
                    <Link
                      href="https://github.com/esisss"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <GitHubLogoIcon className="h-5 w-5" />
                    </Link>
                    <Link
                      href="https://www.linkedin.com/in/jesus-esis-93945b170/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <LinkedInLogoIcon className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </footer>
            </ThemeProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
