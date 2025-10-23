"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-background shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-foreground hover:text-primary transition-colors italic"
            >
              MealWise
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/recipes"
                className="border-transparent text-muted-foreground hover:text-foreground hover:border-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Recipes
              </Link>
              <Link
                href="/features"
                className="border-transparent text-muted-foreground hover:text-foreground hover:border-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="border-transparent text-muted-foreground hover:text-foreground hover:border-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>

          {/* Center - Navigation Links */}

          {/* Right side - Auth Buttons */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
            <ThemeToggle />
            <Link
              href="/signin"
              className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Sign up
            </Link>
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="-mr-2 flex items-center space-x-2 sm:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-expanded={isOpen}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <>
                  <span className="sr-only">Close menu</span>
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </>
              ) : (
                <>
                  <span className="sr-only">Open main menu</span>
                  <svg
                    className="block h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with accordion */}
      <div
        className={`sm:hidden ${isOpen ? "block" : "hidden"}`}
        id="mobile-menu"
      >
        <Accordion type="single" collapsible className="w-full px-4 pb-4">
          <AccordionItem value="navigation">
            <AccordionTrigger className="text-base font-medium">
              Navigation
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-1">
                <Link
                  href="/recipes"
                  className="block pl-3 pr-4 py-2 text-base text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Recipes
                </Link>
                <Link
                  href="/features"
                  className="block pl-3 pr-4 py-2 text-base text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/pricing"
                  className="block pl-3 pr-4 py-2 text-base text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Pricing
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="account">
            <AccordionTrigger className="text-base font-medium">
              Account
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                <Link
                  href="/signin"
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="block px-3 py-2 text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </nav>
  );
}
