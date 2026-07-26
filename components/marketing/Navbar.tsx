"use client";

// components/marketing/Navbar.tsx
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ArrowRight, ChevronDown, Sparkles, BookOpen, FileText, FolderKanban, Calendar, Zap, Shield, Rocket, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoltaicLogo } from "./VoltaicLogo";

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
    <header className="sticky top-0 z-50 w-full">
      {/* Top Announcement Banner (Notion style) */}
      <div className="bg-[#121212] text-white text-xs font-medium py-2 px-4 text-center border-b border-white/10 flex items-center justify-center gap-2 group cursor-pointer">
        <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full text-[11px] font-bold">
          <Zap className="h-3 w-3 fill-amber-400" /> NEW
        </span>
        <span className="truncate">
          Introducing Voltaic AI 2.0 – Ask, write, and automate across your entire workspace.
        </span>
        <Link href="/product/wikis" className="underline font-bold hover:text-amber-300 flex items-center gap-1 transition-colors">
          Explore AI <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Main Navbar */}
      <nav
        className={`w-full transition-all duration-300 ${
          scrolled
            ? "border-b border-border/40 bg-background/90 backdrop-blur-md py-3 shadow-sm"
            : "bg-background py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center group">
              <VoltaicLogo size="md" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-7">
              {/* Product Menu */}
              <div className="relative group/menu">
                <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5">
                  Product <ChevronDown className="h-3.5 w-3.5 opacity-70 group-hover/menu:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-border bg-popover/95 backdrop-blur-md p-3 shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-50">
                  <div className="space-y-1">
                    <Link href="/product/wikis" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 mt-0.5">
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">Wikis</div>
                        <div className="text-xs text-muted-foreground">Centralize team knowledge</div>
                      </div>
                    </Link>
                    <Link href="/product/docs" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors">
                      <div className="p-2 rounded-lg bg-green-500/10 text-green-500 mt-0.5">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">Docs</div>
                        <div className="text-xs text-muted-foreground">Simple, powerful documents</div>
                      </div>
                    </Link>
                    <Link href="/product/projects" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors">
                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 mt-0.5">
                        <FolderKanban className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">Projects</div>
                        <div className="text-xs text-muted-foreground">Manage tasks & roadmaps</div>
                      </div>
                    </Link>
                    <Link href="/product/calendar" className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted transition-colors">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 mt-0.5">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-foreground">Calendar</div>
                        <div className="text-xs text-muted-foreground">Align time and work</div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Solutions Menu */}
              <div className="relative group/menu">
                <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5">
                  Solutions <ChevronDown className="h-3.5 w-3.5 opacity-70 group-hover/menu:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-border bg-popover/95 backdrop-blur-md p-3 shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-50">
                  <div className="space-y-1">
                    <Link href="/solutions/enterprise" className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors text-sm font-medium">
                      <Shield className="h-4 w-4 text-blue-500" /> Enterprise
                    </Link>
                    <Link href="/solutions/startups" className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors text-sm font-medium">
                      <Rocket className="h-4 w-4 text-orange-500" /> Startups
                    </Link>
                    <Link href="/solutions/personal" className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors text-sm font-medium">
                      <Sparkles className="h-4 w-4 text-purple-500" /> Personal Use
                    </Link>
                  </div>
                </div>
              </div>

              {/* Resources Menu */}
              <div className="relative group/menu">
                <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5">
                  Resources <ChevronDown className="h-3.5 w-3.5 opacity-70 group-hover/menu:rotate-180 transition-transform duration-200" />
                </button>
                <div className="absolute left-0 mt-2 w-60 rounded-2xl border border-border bg-popover/95 backdrop-blur-md p-3 shadow-xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-50">
                  <div className="space-y-1">
                    <Link href="/resources/academy" className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors text-sm font-medium">
                      <GraduationCap className="h-4 w-4 text-emerald-500" /> Academy
                    </Link>
                    <Link href="/resources/blog" className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors text-sm font-medium">
                      <FileText className="h-4 w-4 text-indigo-500" /> Blog & Release Notes
                    </Link>
                    <Link href="/resources/help" className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors text-sm font-medium">
                      <BookOpen className="h-4 w-4 text-amber-500" /> Help Center
                    </Link>
                  </div>
                </div>
              </div>

              <Link href="/resources/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
            </div>
          </div>

          {/* Right CTAs */}
          <div className="hidden lg:flex items-center gap-4">
            {status === "loading" ? (
              <div className="h-9 w-24 bg-muted animate-pulse rounded-lg" />
            ) : session ? (
              <>
                <Link href="/dashboard">
                  <Button className="h-9 font-semibold text-sm bg-foreground text-background hover:bg-foreground/90 gap-1.5 rounded-lg px-4 shadow-sm">
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
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2">
                  Request a demo
                </Link>
                <Link href="/login" className="text-sm font-semibold text-foreground hover:text-muted-foreground transition-colors px-2 border-l border-border pl-4">
                  Log in
                </Link>
                <Link href="/register">
                  <Button className="h-9 font-semibold text-sm bg-[#2383e2] hover:bg-[#1f75cb] text-white rounded-lg px-4 border-none shadow-sm hover:shadow-md transition-all">
                    Get Voltaic free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger Menu Trigger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-muted-foreground transition-colors p-2 rounded-lg"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isOpen && (
          <div className="lg:hidden border-b border-border bg-background/95 backdrop-blur-lg px-6 py-6 space-y-4 animate-fade-in absolute top-[110px] left-0 w-full shadow-2xl z-50">
            <div className="space-y-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Product</div>
              <div className="grid grid-cols-2 gap-2 pl-2">
                <Link href="/product/wikis" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground py-1">Wikis</Link>
                <Link href="/product/docs" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground py-1">Docs</Link>
                <Link href="/product/projects" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground py-1">Projects</Link>
                <Link href="/product/calendar" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground py-1">Calendar</Link>
              </div>
            </div>

            <hr className="border-border/60" />

            <div className="space-y-3">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Resources & Pricing</div>
              <div className="grid grid-cols-2 gap-2 pl-2">
                <Link href="/resources/pricing" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground py-1">Pricing</Link>
                <Link href="/resources/academy" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground py-1">Academy</Link>
                <Link href="/resources/blog" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground py-1">Blog</Link>
                <Link href="/resources/help" onClick={() => setIsOpen(false)} className="text-sm font-medium text-foreground py-1">Help Center</Link>
              </div>
            </div>

            <hr className="border-border/60" />

            {session ? (
              <div className="flex flex-col gap-2">
                <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90 gap-1.5 rounded-lg">
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
              <div className="flex flex-col gap-2.5 pt-2">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full rounded-lg font-medium">
                    Log in
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-[#2383e2] hover:bg-[#1f75cb] text-white rounded-lg border-none shadow-none font-semibold">
                    Get Voltaic free
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
