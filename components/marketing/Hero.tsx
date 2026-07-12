// components/marketing/Hero.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, FileText, CheckSquare, Calendar, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const graphicLeftRef = useRef<HTMLDivElement>(null);
  const graphicRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // GSAP Entry Animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      titleRef.current,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.2 }
    );
    tl.fromTo(
      subRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 },
      "-=0.5"
    );
    tl.fromTo(
      ctaRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      "-=0.4"
    );

    // Floating badges entry
    tl.fromTo(
      [graphicLeftRef.current, graphicRightRef.current],
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.8, stagger: 0.15 },
      "-=0.3"
    );

    // Infinitely looping subtle floating animations
    gsap.to(graphicLeftRef.current, {
      y: "+=12",
      rotation: "+=2",
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    gsap.to(graphicRightRef.current, {
      y: "-=15",
      rotation: "-=1.5",
      duration: 3.5,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-background pt-16 pb-24 px-6"
    >
      {/* Decorative blurred background nodes */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
        {/* Sparkle Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/60 text-xs font-semibold text-foreground/80 border border-border/40 select-none animate-pulse">
          <Sparkles className="h-3 w-3 text-yellow-500 fill-yellow-500" />
          Introducing RTX Notion AI Workspace
        </div>

        {/* Headline */}
        <h1
          ref={titleRef}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.1]"
        >
          Write, plan, share. <br />
          With AI at your side.
        </h1>

        {/* Sub-headline */}
        <p
          ref={subRef}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium"
        >
          RTX Notion is the unified workspace that connects your docs, wikis, and project management with real-time sync and AI assistance.
        </p>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Button className="w-full h-11 text-base font-semibold bg-[#2383e2] hover:bg-[#1f75cb] text-white px-8 rounded-lg gap-2 shadow-none border-none">
              Get RTX Notion free <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full h-11 text-base font-semibold px-8 rounded-lg">
              Request a demo
            </Button>
          </Link>
        </div>
      </div>

      {/* Floating Workspace Elements (GSAP Animated) */}
      <div className="hidden lg:block">
        {/* Left Side: Mock Workspace Directory Badge */}
        <div
          ref={graphicLeftRef}
          className="absolute left-[8%] top-[35%] w-60 bg-card border border-border p-4 rounded-xl shadow-xl space-y-3 pointer-events-none select-none"
        >
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
          </div>
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
            🚀 Quick Links
          </span>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground bg-muted/60 p-1.5 rounded-md">
              <FileText className="h-3.5 w-3.5 text-blue-500" />
              <span>Getting Started.md</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground p-1.5">
              <CheckSquare className="h-3.5 w-3.5 text-green-500" />
              <span>Team Roadmap</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground p-1.5">
              <Database className="h-3.5 w-3.5 text-purple-500" />
              <span>Engineering Wiki</span>
            </div>
          </div>
        </div>

        {/* Right Side: Mock Database/Task Card Badge */}
        <div
          ref={graphicRightRef}
          className="absolute right-[8%] top-[30%] w-64 bg-card border border-border p-4 rounded-xl shadow-xl space-y-3 pointer-events-none select-none"
        >
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              📅 Today&apos;s Schedule
            </span>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
              Active
            </span>
          </div>
          <div className="space-y-2">
            <div className="space-y-1 bg-muted/30 p-2 rounded-md border border-border/30">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">AI Integration Sync</span>
                <Calendar className="h-3.5 w-3.5 text-orange-400" />
              </div>
              <p className="text-[10px] text-muted-foreground">10:00 AM - 11:30 AM</p>
            </div>
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground p-1">
              <span>Review Q3 roadmap</span>
              <span className="w-2 h-2 rounded-full bg-green-500" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
