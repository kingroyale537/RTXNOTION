"use client";

// app/solutions/startups/page.tsx
// Startups solutions landing page.

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { Rocket, Sparkles, BookOpen, Key, DollarSign, Zap } from "lucide-react";



export default function StartupsPage() {
  const features = [
    {
      icon: Rocket,
      title: "One Workspace to Rule Them All",
      description: "Keep engineering specs, fundraising pipelines, and employee onboarding manuals in one clean, unified directory.",
    },
    {
      icon: DollarSign,
      title: "Startups Credit Deal",
      description: "Apply for early-stage credits. Startups under Series A get $1,000 in credits to run RTX Notion Workspace Pro free.",
    },
    {
      icon: Zap,
      title: "Pre-Built Startup Templates",
      description: "Skip setup. Launch product roadmap wikis, investor databases, and CRM sheets instantly using our template hub.",
    },
    {
      icon: Sparkles,
      title: "Embedded AI Assistance",
      description: "Brainstorm marketing outlines, summarize competitor docs, and draft customer support responses using workspace agents.",
    },
    {
      icon: BookOpen,
      title: "Centralized Pitch Decks",
      description: "Host draft pitch materials and investor FAQs side-by-side with your product execution roadmaps.",
    },
    {
      icon: Key,
      title: "Flexible Credentials Setup",
      description: "Sign in with Google, GitHub, or Microsoft accounts immediately. Scale up authentication options as you hire.",
    },
  ];

  return (
    <MarketingPageLayout
      badge="Solutions"
      title="RTX Notion for Startups"
      subtitle="Move fast. Keep context aligned."
      description="In early-stage startups, speed is everything. RTX Notion consolidates your roadmaps, team wikis, and task lists into one environment, so you spend less time searching and more time shipping."
      gradientFrom="from-[#f59e0b]"
      gradientTo="to-[#ef4444]"
      features={features}
    />
  );
}
