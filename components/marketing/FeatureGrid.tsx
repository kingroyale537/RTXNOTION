// components/marketing/FeatureGrid.tsx
"use client";

import { useState } from "react";
import { BookOpen, FileText, LayoutGrid, CheckCircle2, Users, ShieldAlert, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type TabId = "wikis" | "docs" | "projects";

export function FeatureGrid() {
  const [activeTab, setActiveTab] = useState<TabId>("wikis");

  return (
    <section id="features" className="w-full bg-background py-20 px-6 border-t border-border/30">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Headings */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            A unified suite for every team.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            No more jumping between docs, task trackers, and directories. RTX Notion brings it all into a single, clean workspace.
          </p>
        </div>

        {/* Tab Selectors (Notion-style rounded grid buttons) */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xl mx-auto p-1.5 bg-muted/50 rounded-xl border border-border/40 select-none">
          {(["wikis", "docs", "projects"] as TabId[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-3 rounded-lg text-sm font-semibold capitalize transition-all duration-200 ${
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Tab Showcase Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card border border-border/60 rounded-2xl p-6 sm:p-10 shadow-lg shadow-black/5">
          
          {/* Tab Explanatory Copy (Left 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {activeTab === "wikis" && (
              <div className="space-y-4 animate-fade-in">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <BookOpen className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-extrabold text-foreground">Enterprise Wiki & Knowledge Base</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Centralize your team&apos;s rules, guidelines, onboarding documents, and tech specs. Never ask &quot;where is that document?&quot; again.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Infinite nesting of folders and files
                  </li>
                  <li className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Advanced search query indexer
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "docs" && (
              <div className="space-y-4 animate-fade-in">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-extrabold text-foreground">Real-time Collaborative Documents</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Co-author project proposals, marketing blogs, and design systems. Features rich formatting, tables, lists, and inline media embeds.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Users className="h-4 w-4 text-green-500" /> Multi-user cursor presence tags
                  </li>
                  <li className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Slash `/` block inserter options
                  </li>
                </ul>
              </div>
            )}

            {activeTab === "projects" && (
              <div className="space-y-4 animate-fade-in">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <LayoutGrid className="h-5 w-5" />
                </div>
                <h3 className="text-2xl font-extrabold text-foreground">Flexible Projects & Roadmap</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Track epics, sprints, bug reports, and roadmap schedules. Customize cards, assignees, priorities, and project categories.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Kanban Drag & Drop project view
                  </li>
                  <li className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" /> Fully integrated into documents and wikis
                  </li>
                </ul>
              </div>
            )}

            <div className="pt-4">
              <Link href="/register">
                <Button className="bg-[#2383e2] hover:bg-[#1f75cb] text-white font-semibold rounded-lg gap-1 border-none shadow-none text-sm">
                  Try {activeTab} free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Screen Mockup (Right 7 cols) */}
          <div className="lg:col-span-7 bg-muted/30 border border-border/50 rounded-xl p-4 sm:p-6 shadow-inner select-none">
            
            {/* Window header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                workspace://rtxnotion
              </span>
              <div className="w-10" />
            </div>

            {/* Wikis Mockup */}
            {activeTab === "wikis" && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <span>📂</span> Engineering Directory
                </div>
                <div className="pl-6 space-y-2.5 border-l border-border/80">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground/80 bg-muted/65 p-1.5 rounded-md">
                    <span>📄</span> Onboarding Guide
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground pl-1.5">
                    <span>📄</span> Coding Guidelines & Linters
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground pl-1.5">
                    <span>📄</span> Deployment Checklist (Vercel)
                  </div>
                </div>
              </div>
            )}

            {/* Docs Mockup */}
            {activeTab === "docs" && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-xl font-extrabold text-foreground">🚀 Marketing Campaign Plan</div>
                <p className="text-xs text-muted-foreground leading-normal">
                  Collaborative plan for the RTX Notion product release. Written by the Marketing team.
                </p>
                <div className="bg-muted/70 p-3 rounded-lg border border-border/20 text-xs font-mono text-foreground flex items-center gap-1.5 relative overflow-hidden">
                  <span className="text-blue-500 font-bold">@Sarah:</span>
                  <span>We should launch on Product Hunt next Tuesday.</span>
                  <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                </div>
              </div>
            )}

            {/* Projects Mockup */}
            {activeTab === "projects" && (
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                {/* Todo Column */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">To Do</div>
                  <div className="bg-card border border-border/60 p-2.5 rounded-lg shadow-sm space-y-1.5">
                    <span className="text-xs font-bold text-foreground block">Fix auth redirect loop</span>
                    <span className="text-[9px] bg-red-400/10 text-red-500 font-bold px-1.5 py-0.5 rounded">High</span>
                  </div>
                </div>
                {/* In Progress Column */}
                <div className="space-y-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">In Progress</div>
                  <div className="bg-card border border-border/60 p-2.5 rounded-lg shadow-sm space-y-1.5">
                    <span className="text-xs font-bold text-foreground block">Build GSAP Landing Page</span>
                    <span className="text-[9px] bg-blue-400/10 text-blue-500 font-bold px-1.5 py-0.5 rounded text-center">Active</span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
}
