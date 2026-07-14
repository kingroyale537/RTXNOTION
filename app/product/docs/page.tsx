"use client";

// app/product/docs/page.tsx
// Docs landing page.

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { FileText, Command, ShieldCheck, PenTool, Sparkles, Code2 } from "lucide-react";



export default function DocsPage() {
  const features = [
    {
      icon: PenTool,
      title: "Block-Based Editing Canvas",
      description: "Write docs with maximum flexibility. Move paragraphs, callout boxes, checklists, and tables smoothly.",
    },
    {
      icon: Command,
      title: "Slash Command '/' Palette",
      description: "Insert headings, lists, inline tables, highlight boxes, and images dynamically without touching your mouse.",
    },
    {
      icon: Code2,
      title: "Syntax Highlighted Code Blocks",
      description: "Share code snippets inside documents. Supports syntax highlights for Javascript, Go, Python, and SQL.",
    },
    {
      icon: Sparkles,
      title: "AI Co-Writer Panel",
      description: "Trigger in-context AI generation to rephrase paragraphs, fix grammar, translate text, and expand outlines.",
    },
    {
      icon: ShieldCheck,
      title: "Continuous Auto-Saving",
      description: "Your document edits are continuously synchronized to the database via secure debounced PATCH callbacks.",
    },
    {
      icon: FileText,
      title: "Collaborative Cursor Pointers",
      description: "See exactly where teammates are typing with color-coded cursors and live presence status.",
    },
  ];

  return (
    <MarketingPageLayout
      badge="Product"
      title="Docs"
      subtitle="Better docs. Faster decisions."
      description="Write documents, specs, and meeting notes with a clean, distraction-free markdown block editor. RTX Notion Docs combines editing speed with real-time multiplayer coordination."
      gradientFrom="from-[#22c55e]"
      gradientTo="to-[#06b6d4]"
      features={features}
    />
  );
}
