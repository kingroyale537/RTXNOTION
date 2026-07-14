"use client";

// app/solutions/personal/page.tsx
// Personal solutions landing page.

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { User, BookOpen, CheckSquare, Sparkles, Smile, ShieldAlert } from "lucide-react";



export default function PersonalPage() {
  const features = [
    {
      icon: Smile,
      title: "Distraction-Free Notebook",
      description: "Write down thoughts, daily journals, recipes, and shopping lists in a clean, elegant visual workspace.",
    },
    {
      icon: CheckSquare,
      title: "Daily Tasks & Habit Trackers",
      description: "Organize your life. Track fitness goals, study lists, and weekly schedules using databases and cards.",
    },
    {
      icon: BookOpen,
      title: "Infinite Knowledge Cabinet",
      description: "Save web links, books to read, movie lists, and travel plans inside organized nested subpages.",
    },
    {
      icon: Sparkles,
      title: "Personal AI Assistant",
      description: "Summarize web articles, rephrase draft emails, and brainstorm project ideas with embedded AI commands.",
    },
    {
      icon: User,
      title: "100% Free Forever",
      description: "All core features, block editing elements, page favorites, and basic searches are completely free for individuals.",
    },
    {
      icon: ShieldAlert,
      title: "Secure Local Backup",
      description: "Self-host on your machine or use local configurations to keep control of your personal data folders.",
    },
  ];

  return (
    <MarketingPageLayout
      badge="Solutions"
      title="RTX Notion for Personal Use"
      subtitle="Organize your life. Clear your mind."
      description="Track your daily routines, list personal goals, and write meeting notes in a beautiful, customizable workspace designed for single-user productivity."
      gradientFrom="from-[#10b981]"
      gradientTo="to-[#3b82f6]"
      features={features}
    />
  );
}
