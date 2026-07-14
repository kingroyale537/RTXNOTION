// components/marketing/Navbar.tsx
"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, ChevronDown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "border-b border-border/40 bg-background/80 backdrop-blur-md py-3"
          : "bg-background py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo and Name */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-400 text-black select-none group-hover:scale-105 transition-transform">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <span className="font-bold tracking-tight text-lg text-foreground">
              Voltaic
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <div className="relative group/menu">
              <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5">
                Product <ChevronDown className="h-3 w-3 opacity-70 group-hover/menu:rotate-180 transition-transform duration-200" />
              </button>
              {/* Simple dropdown panel */}
              <div className="absolute left-0 mt-2 w-48 rounded-xl border border-border bg-popover p-2 shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200">
                <Link href="#features" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors">Wikis & Docs</Link>
                <Link href="#features" className="block px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors">Projects & Tasks</Link>
              </div>
            </div>
            <Link href="#solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Solutions
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Customers
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>
        </div>

        {/* Right CTAs */}
        <div className="hidden md:flex items-center gap-4">
          {status === "loading" ? (
            <div className="h-9 w-24 bg-muted animate-pulse rounded-lg" />
          ) : session ? (
            <>
              <Link href="/dashboard">
                <Button className="h-9 font-medium text-sm bg-foreground text-background hover:bg-foreground/90 gap-1 rounded-lg">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="h-9 font-medium text-sm text-muted-foreground hover:text-foreground rounded-lg"
              >
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Log in
              </Link>
              <Link href="/register">
                <Button className="h-9 font-medium text-sm bg-[#2383e2] hover:bg-[#1f75cb] text-white rounded-lg px-4 border-none shadow-none">
                  Get Voltaic free
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger menu trigger */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-foreground hover:text-muted-foreground transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-6 py-6 space-y-4 animate-fade-in absolute top-[65px] left-0 w-full shadow-lg">
          <Link
            href="#features"
            onClick={() => setIsOpen(false)}
            className="block text-base font-semibold text-foreground"
          >
            Product
          </Link>
          <Link
            href="#solutions"
            onClick={() => setIsOpen(false)}
            className="block text-base font-semibold text-foreground"
          >
            Solutions
          </Link>
          <Link
            href="#testimonials"
            onClick={() => setIsOpen(false)}
            className="block text-base font-semibold text-foreground"
          >
            Customers
          </Link>
          <Link
            href="#pricing"
            onClick={() => setIsOpen(false)}
            className="block text-base font-semibold text-foreground"
          >
            Pricing
          </Link>

          <hr className="border-border/60" />

          {session ? (
            <div className="flex flex-col gap-2">
              <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-foreground text-background hover:bg-foreground/90 gap-1 rounded-lg">
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full text-muted-foreground hover:text-foreground rounded-lg"
              >
                Log out
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full rounded-lg">
                  Log in
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full bg-[#2383e2] hover:bg-[#1f75cb] text-white rounded-lg border-none shadow-none">
                  Get Voltaic free
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
