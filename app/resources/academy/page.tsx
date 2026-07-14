"use client";

// app/resources/academy/page.tsx
// Academy landing page.

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { GraduationCap, Play, BookOpen, Star, HelpCircle } from "lucide-react";



export default function AcademyPage() {
  const guides = [
    {
      title: "Voltaic Basics: Getting Started",
      duration: "10 mins video",
      level: "Beginner",
      desc: "Learn to write docs, insert slash commands, structure nesting hierarchy, and customize page layouts.",
    },
    {
      title: "Advanced Databases & Filtering",
      duration: "15 mins video",
      level: "Intermediate",
      desc: "Configure project trackers, sort page entries, group rows, and add dynamic custom columns.",
    },
    {
      title: "Self-Hosting and Server Diagnostics",
      duration: "20 mins video",
      level: "Advanced",
      desc: "Detailed guide to deploy Voltaic via Docker, seed database tables, and scale WebSocket ports.",
    },
    {
      title: "Co-Writing with AI Agents",
      duration: "8 mins video",
      level: "Beginner",
      desc: "Unlock the power of in-context AI prompts to write guidelines, draft summaries, and translate pages.",
    },
  ];

  return (
    <MarketingPageLayout
      badge="Resources"
      title="Academy"
      subtitle="Master Voltaic workflows."
      description="Level up your workspace skills. Watch step-by-step video courses, read documentation tips, and explore advanced database structures from core contributors."
      gradientFrom="from-[#a855f7]"
      gradientTo="to-[#ec4899]"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto text-left">
        {guides.map((guide, idx) => (
          <div key={idx} className="p-6 rounded-xl bg-[#111] border border-[#202020] hover:border-[#303030] transition duration-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                <span>{guide.duration}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25">{guide.level}</span>
              </div>
              <h4 className="font-bold text-white text-base flex items-center gap-1.5">
                <GraduationCap className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                {guide.title}
              </h4>
              <p className="text-xs text-[#94a3b8] leading-relaxed">{guide.desc}</p>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-white hover:text-indigo-400 font-bold transition pt-2">
              <Play className="h-3.5 w-3.5 fill-current shrink-0" /> Watch Tutorial
            </button>
          </div>
        ))}
      </div>
    </MarketingPageLayout>
  );
}
