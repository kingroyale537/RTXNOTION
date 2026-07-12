// components/marketing/Footer.tsx
"use client";

import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border/30 py-16 px-6 relative z-10 select-none">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        
        {/* Logo and Name column */}
        <div className="col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-7.5 h-7.5 rounded-lg bg-foreground text-background font-bold text-base select-none">
              N
            </div>
            <span className="font-bold tracking-tight text-base text-foreground">
              RTX Notion
            </span>
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs">
            A self-hosted, collaborative workspace designed to organize your docs, wikis, and projects in one beautiful environment.
          </p>
          <p className="text-[10px] text-muted-foreground/80">
            &copy; {new Date().getFullYear()} RTX Notion. All rights reserved.
          </p>
        </div>

        {/* Product Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Product</h4>
          <ul className="space-y-2 text-xs font-medium text-muted-foreground">
            <li><Link href="#features" className="hover:text-foreground transition-colors">Wikis</Link></li>
            <li><Link href="#features" className="hover:text-foreground transition-colors">Docs</Link></li>
            <li><Link href="#features" className="hover:text-foreground transition-colors">Projects</Link></li>
            <li><Link href="#features" className="hover:text-foreground transition-colors">Calendar</Link></li>
          </ul>
        </div>

        {/* Resources Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Resources</h4>
          <ul className="space-y-2 text-xs font-medium text-muted-foreground">
            <li><Link href="/help" className="hover:text-foreground transition-colors">Help Center</Link></li>
            <li><Link href="https://academy.notion.com" className="hover:text-foreground transition-colors">Academy</Link></li>
            <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
            <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
          </ul>
        </div>

        {/* Solutions Column */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Solutions</h4>
          <ul className="space-y-2 text-xs font-medium text-muted-foreground">
            <li><Link href="/startups" className="hover:text-foreground transition-colors">Startups</Link></li>
            <li><Link href="/personal" className="hover:text-foreground transition-colors">Personal</Link></li>
            <li><Link href="/enterprise" className="hover:text-foreground transition-colors">Enterprise</Link></li>
            <li><Link href="/solutions" className="hover:text-foreground transition-colors">By Team</Link></li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
