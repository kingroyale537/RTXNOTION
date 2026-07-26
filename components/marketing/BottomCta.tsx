"use client";

// components/marketing/BottomCta.tsx
// High-converting Notion-style bottom CTA banner.

import Link from "next/link";
import { ArrowRight, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoltaicLogo } from "./VoltaicLogo";

export function BottomCta() {
  return (
    <section className="w-full bg-background py-20 px-6 border-t border-border/30 relative overflow-hidden">
      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full bg-amber-400/5 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
        <div className="inline-flex items-center justify-center mb-2">
          <VoltaicLogo size="lg" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
          Get started for free today.
        </h2>

        <p className="text-base sm:text-xl text-muted-foreground max-w-xl mx-auto font-medium leading-relaxed">
          Create your workspace, invite your teammates, and start building your knowledge base in seconds.
        </p>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 text-base font-bold bg-[#2383e2] hover:bg-[#1f75cb] text-white px-8 rounded-xl gap-2 shadow-md hover:shadow-lg border-none transition-all">
              Get Voltaic free <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-12 text-base font-semibold px-7 rounded-xl border-border">
              Request a demo
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground font-medium">
          Free for individuals • No credit card required • Cancel anytime
        </p>
      </div>
    </section>
  );
}
