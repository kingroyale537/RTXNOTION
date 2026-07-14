"use client";

// app/product/wikis/page.tsx
// Wikis landing page.

import { MarketingPageLayout } from "@/components/marketing/MarketingPageLayout";
import { BookOpen, Search, Share2, Shield, Network, Sparkles } from "lucide-react";



export default function WikisPage() {
  const features = [
    {
      icon: BookOpen,
      title: "Infinite Nesting Hierarchy",
      description: "Organize pages inside pages. Keep your team guides, onboarding documents, and specs structured recursively.",
    },
    {
      icon: Search,
      title: "Instant Global Search",
      description: "Find documents, comments, and block items instantly with full-text search across your workspace nodes.",
    },
    {
      icon: Share2,
      title: "Teamspaces & Permissions",
      description: "Isolate projects inside teamspaces. Configure fine-grained edit and read permissions for external members.",
    },
    {
      icon: Sparkles,
      title: "Voltaic AI Integration",
      description: "Leverage embedded AI agents to summarize wiki pages, answer cross-document questions, and draft team guidelines.",
    },
    {
      icon: Network,
      title: "Real-Time Collaboration",
      description: "Edit wikis simultaneously with other engineers and designers, backed by Yjs CRDT synchronization.",
    },
    {
      icon: Shield,
      title: "Verifiable Version History",
      description: "Audit page changes and rollback document versions seamlessly to recover overwritten wiki sections.",
    },
  ];

  return (
    <MarketingPageLayout
      badge="Product"
      title="Wikis"
      subtitle="Centralize your company knowledge."
      description="Say goodbye to scattered folders and disconnected files. Voltaic Wikis consolidate your engineering manuals, company playbooks, and product guidelines in one clean, instantly searchable workspace."
      gradientFrom="from-[#a855f7]"
      gradientTo="to-[#6366f1]"
      features={features}
    />
  );
}
