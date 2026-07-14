// components/marketing/MarketingPageLayout.tsx
// Unified marketing template layout for Product, Resources, and Solutions subpages.

"use client";

import React from "react";
import Link from "next/link";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
}

interface Props {
  badge: string;
  title: string;
  subtitle: string;
  description: string;
  gradientFrom?: string;
  gradientTo?: string;
  features?: Feature[];
  ctaText?: string;
  ctaLink?: string;
  children?: React.ReactNode;
}

export function MarketingPageLayout({
  badge,
  title,
  subtitle,
  description,
  gradientFrom = "from-[#4f46e5]",
  gradientTo = "from-[#06b6d4]",
  features = [],
  ctaText = "Get Voltaic free",
  ctaLink = "/register",
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-black text-[#f3f4f6] flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center">
        
        {/* ── Hero Section ──────────────────────────────────────────────── */}
        <section className="w-full max-w-5xl px-6 pt-24 pb-16 text-center space-y-6 relative overflow-hidden">
          {/* Background ambient radial gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b1b1b] border border-[#2d2d2d] text-xs font-semibold uppercase tracking-wider text-indigo-400">
            {badge}
          </span>

          {/* Title */}
          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
              {title}
            </h1>
            <h2 className={`text-2xl sm:text-4xl font-extrabold bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-clip-text text-transparent leading-normal`}>
              {subtitle}
            </h2>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg text-[#94a3b8] max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={ctaLink}>
              <Button className="h-11 px-6 font-bold text-sm bg-white hover:bg-white/90 text-black rounded-xl gap-2 transition duration-200">
                {ctaText} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" className="h-11 px-6 font-semibold text-sm text-[#94a3b8] hover:text-white hover:bg-white/5 rounded-xl">
                Log in to workspace
              </Button>
            </Link>
          </div>
        </section>

        {/* ── Custom Child Content (Pricing / Blog / Help Center lists) ────── */}
        {children && (
          <section className="w-full max-w-6xl px-6 py-12">
            {children}
          </section>
        )}

        {/* ── Features Grid Section ──────────────────────────────────────── */}
        {features.length > 0 && (
          <section className="w-full max-w-6xl px-6 py-20 border-t border-[#1f1f1f]">
            <div className="text-center mb-16 space-y-2">
              <h3 className="text-2xl sm:text-3xl font-black text-white">Why choose Voltaic</h3>
              <p className="text-sm text-[#94a3b8]">Engineered for collaboration, speed, and clean documentation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <div key={idx} className="p-6 rounded-2xl bg-[#111111] border border-[#1e1e1e] hover:border-[#2d2d2d] transition duration-200 space-y-4 group">
                    <div className="p-2.5 w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-white text-base">{feature.title}</h4>
                      <p className="text-xs text-[#94a3b8] leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Bottom Banner Cta ─────────────────────────────────────────── */}
        <section className="w-full bg-gradient-to-b from-black to-[#050505] py-24 px-6 border-t border-[#1e1e1e] text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white max-w-xl mx-auto leading-tight">
            Start organizing your workspace today.
          </h2>
          <p className="text-sm text-[#94a3b8] max-w-md mx-auto">
            Get started for free. Add unlimited pages, tasks, and invite your team members.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button className="h-11 px-8 font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl gap-2 transition duration-200">
                Sign up free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
