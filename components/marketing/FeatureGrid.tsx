"use client";

// components/marketing/FeatureGrid.tsx
// Notion.com-inspired feature grid showcase: Product pillars, Company logo wall, and Modular building blocks.

import { useState } from "react";
import {
  BookOpen,
  FileText,
  FolderKanban,
  Zap,
  CheckCircle2,
  Users,
  ArrowRight,
  Sparkles,
  Columns,
  Layers,
  Code2,
  Table,
  CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type TabId = "ai" | "docs" | "wikis" | "projects";

export function FeatureGrid() {
  const [activeTab, setActiveTab] = useState<TabId>("ai");

  return (
    <section id="features" className="w-full bg-background py-20 px-6 border-t border-border/30">
      <div className="max-w-6xl mx-auto space-y-20">
        
        {/* ── Section 1: Customer Logo Wall / Trusted By ───────────────────────── */}
        <div className="space-y-6 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Trusted by teams at innovative companies worldwide
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-300 font-extrabold text-lg tracking-tight select-none">
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 fill-current text-amber-500" /> OPENAI</span>
            <span className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-purple-500" /> FIGMA</span>
            <span className="flex items-center gap-1.5"><Code2 className="h-4 w-4 text-blue-500" /> VERCEL</span>
            <span className="flex items-center gap-1.5"><Columns className="h-4 w-4 text-green-500" /> RAMP</span>
            <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-pink-500" /> MATCHGROUP</span>
          </div>
        </div>

        {/* ── Section 2: Product Pillars Showcase (Notion Style) ──────────────── */}
        <div className="space-y-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
              Every team, side-by-side.
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground font-medium">
              Four powerful tools in one connected workspace. No more jumping between separate apps and disconnected files.
            </p>
          </div>

          {/* Tab Selectors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto p-1.5 bg-muted/60 rounded-2xl border border-border/60 select-none">
            <button
              onClick={() => setActiveTab("ai")}
              className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "ai"
                  ? "bg-background text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-4 w-4 text-amber-500 fill-amber-400" /> Voltaic AI
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "docs"
                  ? "bg-background text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4 text-green-500" /> Docs
            </button>
            <button
              onClick={() => setActiveTab("wikis")}
              className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "wikis"
                  ? "bg-background text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-4 w-4 text-blue-500" /> Wikis
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                activeTab === "projects"
                  ? "bg-background text-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FolderKanban className="h-4 w-4 text-purple-500" /> Projects
            </button>
          </div>

          {/* Showcase Display Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-card border border-border/80 rounded-3xl p-6 sm:p-10 shadow-xl">
            
            {/* Copy Side */}
            <div className="lg:col-span-5 space-y-6">
              {activeTab === "ai" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-500 flex items-center justify-center border border-amber-400/30">
                    <Zap className="h-6 w-6 fill-amber-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground">Voltaic AI Assistant</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                    Ask questions, draft copy, or extract action items across your entire team workspace. Powered by Gemini 3.6 multimodal intelligence.
                  </p>
                  <ul className="space-y-2.5 pt-1">
                    <li className="flex items-center gap-2.5 text-xs font-semibold text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Search and summarize every page & document
                    </li>
                    <li className="flex items-center gap-2.5 text-xs font-semibold text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Auto-generate meeting notes and task lists
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === "docs" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center border border-green-500/20">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground">Real-time Collaborative Docs</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                    Write specs, design systems, and meeting agendas together in real-time. Features Yjs CRDT multiplayer syncing.
                  </p>
                  <ul className="space-y-2.5 pt-1">
                    <li className="flex items-center gap-2.5 text-xs font-semibold text-foreground/80">
                      <Users className="h-4 w-4 text-green-500 flex-shrink-0" /> Live multi-user cursor presence
                    </li>
                    <li className="flex items-center gap-2.5 text-xs font-semibold text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Slash `/` block commands & markdown
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === "wikis" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center border border-blue-500/20">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground">Centralized Team Wikis</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                    Consolidate company handbooks, engineering guidelines, and onboarding paths in one searchable location.
                  </p>
                  <ul className="space-y-2.5 pt-1">
                    <li className="flex items-center gap-2.5 text-xs font-semibold text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Infinitely nested folder structures
                    </li>
                    <li className="flex items-center gap-2.5 text-xs font-semibold text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Instantly searchable document index
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === "projects" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center border border-purple-500/20">
                    <FolderKanban className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-foreground">Flexible Projects & Roadmaps</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm font-medium">
                    Track sprint epics, bug fixes, and feature roadmaps with Kanban board views and relational table views.
                  </p>
                  <ul className="space-y-2.5 pt-1">
                    <li className="flex items-center gap-2.5 text-xs font-semibold text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Interactive Kanban drag & drop board
                    </li>
                    <li className="flex items-center gap-2.5 text-xs font-semibold text-foreground/80">
                      <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" /> Integrated directly into docs & pages
                    </li>
                  </ul>
                </div>
              )}

              <div className="pt-2">
                <Link href="/register">
                  <Button className="bg-[#2383e2] hover:bg-[#1f75cb] text-white font-bold rounded-xl gap-2 px-6 shadow-md border-none">
                    Get started with {activeTab.toUpperCase()} free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Visual Mockup Side */}
            <div className="lg:col-span-7 bg-muted/40 border border-border/60 rounded-2xl p-5 sm:p-7 shadow-inner">
              <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-5">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <span className="text-[11px] font-mono font-bold text-muted-foreground">
                  voltaic.app/workspace/{activeTab}
                </span>
                <div className="w-8" />
              </div>

              {activeTab === "ai" && (
                <div className="space-y-3 font-sans animate-fade-in">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-semibold text-amber-500 flex items-center gap-2">
                    <Zap className="h-4 w-4 fill-amber-400" /> Voltaic AI Search Output
                  </div>
                  <div className="p-4 bg-card border border-border rounded-xl space-y-2 text-xs font-mono text-muted-foreground">
                    <span className="text-foreground font-bold font-sans text-sm block">Query: &quot;Find our brand color tokens and linter rules&quot;</span>
                    <p>• Color tokens defined in <span className="text-primary underline">tailwind.config.ts</span></p>
                    <p>• Linters set up in <span className="text-primary underline">.eslintrc.json</span></p>
                  </div>
                </div>
              )}

              {activeTab === "docs" && (
                <div className="space-y-3 font-sans animate-fade-in">
                  <div className="p-3 bg-card border border-border rounded-xl space-y-2">
                    <span className="text-sm font-bold text-foreground">✍️ Live Document Editor</span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Every element in Voltaic is a block. Press <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px]">/</kbd> to add headings, callouts, or tables.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "wikis" && (
                <div className="space-y-2 text-xs font-medium text-foreground animate-fade-in">
                  <div className="p-3 bg-card border border-border rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-2 font-bold">📂 Company Playbook</span>
                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded font-bold text-muted-foreground">Wiki Root</span>
                  </div>
                  <div className="pl-4 space-y-2 border-l-2 border-primary/30">
                    <div className="p-2.5 bg-muted/60 rounded-lg flex items-center justify-between">
                      <span>📄 Engineering Guidelines</span>
                      <span className="text-[10px] text-muted-foreground">Updated 2h ago</span>
                    </div>
                    <div className="p-2.5 bg-muted/60 rounded-lg flex items-center justify-between">
                      <span>📄 Employee Onboarding</span>
                      <span className="text-[10px] text-muted-foreground">Updated 1d ago</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "projects" && (
                <div className="grid grid-cols-2 gap-3 animate-fade-in">
                  <div className="p-3 bg-card border border-border rounded-xl space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">To Do</span>
                    <div className="p-2 bg-muted rounded-lg text-xs font-bold text-foreground">Build Column Splits</div>
                  </div>
                  <div className="p-3 bg-card border border-border rounded-xl space-y-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">In Progress</span>
                    <div className="p-2 bg-primary/10 border border-primary/20 rounded-lg text-xs font-bold text-primary">Landing Page Redesign</div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* ── Section 3: Modular Building Blocks Spotlight ─────────────────────── */}
        <div className="space-y-8 bg-card border border-border/80 rounded-3xl p-8 sm:p-12 shadow-lg">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold bg-amber-400/20 text-amber-500 px-3 py-1 rounded-full uppercase tracking-wider">
              Modular Architecture
            </span>
            <h3 className="text-2xl sm:text-4xl font-black text-foreground">
              Customize what you build.
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              Start simple with a blank page. Expand it with dynamic multi-column layouts, interactive task boards, formulas, and databases.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 w-fit">
                <Columns className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Multi-Column Drag & Drop</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Drag blocks to the left or right edge to split text into side-by-side columns instantly.
              </p>
              <Link href="/editor-widget" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline pt-2">
                Try Canvas Widget →
              </Link>
            </div>

            <div className="p-6 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 w-fit">
                <Table className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Inline Tables & Databases</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Filter, sort, and group items with custom properties, status tags, and assignees.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
              <div className="p-2.5 rounded-xl bg-green-500/10 text-green-500 w-fit">
                <CheckSquare className="h-5 w-5" />
              </div>
              <h4 className="text-base font-bold text-foreground">Interactive Checklists</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Turn plain notes into action items with live checkboxes and progress tracking.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
