// components/marketing/Footer.tsx
"use client";

import Link from "next/link";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border/30 py-16 px-6 relative z-10 select-none">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        
        {/* Logo and Name column */}
        <div className="col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-[30px] h-[30px] rounded-lg bg-amber-400 text-black select-none">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            <span className="font-bold tracking-tight text-base text-foreground">
              Voltaic
            </span>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
            A self-hosted, collaborative workspace designed to organize your docs, wikis, and projects in one beautiful environment.
          </p>
          <p className="text-[10px] text-muted-foreground/80">
            &copy; {new Date().getFullYear()} Voltaic. All rights reserved.
          </p>
        </div>

        {/* Product Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Product</h4>
          <ul className="space-y-2 text-xs font-medium text-muted-foreground">
            <li><Link href="/product/wikis" className="hover:text-foreground transition-colors">Wikis</Link></li>
            <li><Link href="/product/docs" className="hover:text-foreground transition-colors">Docs</Link></li>
            <li><Link href="/product/projects" className="hover:text-foreground transition-colors">Projects</Link></li>
            <li><Link href="/product/calendar" className="hover:text-foreground transition-colors">Calendar</Link></li>
          </ul>
        </div>
 
        {/* Resources Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Resources</h4>
          <ul className="space-y-2 text-xs font-medium text-muted-foreground">
            <li><Link href="/resources/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
            <li><Link href="/resources/academy" className="hover:text-foreground transition-colors">Academy</Link></li>
            <li><Link href="/resources/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
            <li><Link href="/resources/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
          </ul>
        </div>
 
        {/* Solutions Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Solutions</h4>
          <ul className="space-y-2 text-xs font-medium text-muted-foreground">
            <li><Link href="/solutions/startups" className="hover:text-foreground transition-colors">Startups</Link></li>
            <li><Link href="/solutions/personal" className="hover:text-foreground transition-colors">Personal</Link></li>
            <li><Link href="/solutions/enterprise" className="hover:text-foreground transition-colors">Enterprise</Link></li>
            <li><Link href="/solutions/teams" className="hover:text-foreground transition-colors">By Team</Link></li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
