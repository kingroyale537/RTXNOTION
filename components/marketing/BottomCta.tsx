// components/marketing/BottomCta.tsx
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BottomCta() {
  return (
    <section className="w-full bg-background py-20 px-6 border-t border-border/30 relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#2383e2]/5 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Get started today.
        </h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
          Create your personal workspace, invite your teammates, and start building your knowledge base in seconds.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/register" className="w-full sm:w-auto">
            <Button className="w-full h-11 text-base font-semibold bg-[#2383e2] hover:bg-[#1f75cb] text-white px-8 rounded-lg gap-2 border-none shadow-none">
              Get RTX Notion free <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full h-11 text-base font-semibold px-8 rounded-lg">
              Log in to account
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
