import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
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
              <div id="modal-root" />
            </ThemeProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
