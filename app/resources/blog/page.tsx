"use client";

// app/resources/blog/page.tsx
// Blog landing page.

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { Calendar, User, ArrowRight } from "lucide-react";



export default function BlogPage() {
  const posts = [
    {
      title: "Introducing RTX Notion v1.2: Real-time Biometrics & Database Sorting",
      date: "July 13, 2026",
      author: "Product Team",
      desc: "Our biggest release yet. Learn about the new native WebAuthn Passkeys biometric login options, custom columns sort and filter grids, and Azure AD Microsoft provider integration.",
    },
    {
      title: "How We Scaled Yjs WebSocket Sync to 10,000 Concurrent Collaborators",
      date: "June 28, 2026",
      author: "Engineering Core",
      desc: "A deep dive into our collaborative server architecture. Learn how we optimized Socket.io connection handshakes and resolved Prisma transaction bottlenecks for block elements.",
    },
    {
      title: "Why Startups Choose RTX Notion for Document Management",
      date: "May 15, 2026",
      author: "Workspace Success",
      desc: "Read customer stories from fast-growing startups on how nesting wikis and task checklists inside the same workspace accelerated release speeds and cut communication overhead.",
    },
  ];

  return (
    <MarketingPageLayout
      badge="Resources"
      title="Blog"
      subtitle="Latest updates & engineering logs."
      description="Stay updated with our latest feature releases, design tutorials, and engineering articles written directly by the creators of RTX Notion."
      gradientFrom="from-[#3b82f6]"
      gradientTo="to-[#22c55e]"
    >
      <div className="space-y-8 max-w-4xl mx-auto text-left">
        {posts.map((post, idx) => (
          <div key={idx} className="p-6 rounded-xl bg-[#111] border border-[#202020] hover:border-[#303030] transition duration-200 space-y-4">
            <div className="flex items-center gap-4 text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {post.date}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><User className="h-3 w-3" /> {post.author}</span>
            </div>
            <h4 className="font-extrabold text-white text-lg sm:text-xl">{post.title}</h4>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">{post.desc}</p>
            <button className="flex items-center gap-1.5 text-xs text-white hover:text-indigo-400 font-bold transition">
              Read Article <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </MarketingPageLayout>
  );
}
