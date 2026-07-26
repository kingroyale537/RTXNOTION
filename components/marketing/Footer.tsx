"use client";

// components/marketing/Footer.tsx
import Link from "next/link";
import { VoltaicLogo } from "./VoltaicLogo";
import { Globe, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border/30 py-16 px-6 relative z-10 select-none">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
        
        {/* Logo and Name column */}
        <div className="col-span-2 space-y-4">
          <Link href="/" className="inline-block">
            <VoltaicLogo size="md" />
          </Link>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-xs font-medium">
            Voltaic is the connected workspace for your docs, wikis, and projects. Self-hosted, real-time, and powered by AI.
          </p>
          <div className="flex items-center gap-3 text-muted-foreground">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors p-1">
              <Github className="h-4 w-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors p-1">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors p-1">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
          <p className="text-[11px] text-muted-foreground/80 font-medium">
            &copy; {new Date().getFullYear()} Voltaic Technologies Inc. All rights reserved.
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
            <li><Link href="/editor-widget" className="hover:text-foreground transition-colors font-bold text-primary">Canvas Widget →</Link></li>
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
            <li><Link href="/solutions/personal" className="hover:text-foreground transition-colors">Personal Use</Link></li>
            <li><Link href="/solutions/enterprise" className="hover:text-foreground transition-colors">Enterprise</Link></li>
            <li><Link href="/solutions/teams" className="hover:text-foreground transition-colors">By Team</Link></li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
