"use client";

// components/marketing/Hero.tsx
// Notion.com-inspired Hero section with interactive workspace preview and AI prompt bar.

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Zap,
  BookOpen,
  FileText,
  FolderKanban,
  Calendar,
  CheckSquare,
  Search,
  Bot,
  Command,
  Send,
  Plus,
  MoreHorizontal,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";

type HeroTab = "ai" | "docs" | "wikis" | "projects" | "calendar";

const SAMPLE_AI_RESPONSES: Record<string, { title: string; body: string; tags: string[] }> = {
  plan: {
    title: "🚀 Q3 Product Launch Plan",
    body: "1. Complete user onboarding redesign\n2. Execute beta test with 50 enterprise leads\n3. Publish documentation and release blog",
    tags: ["Product", "Launch", "High Priority"],
  },
  summarize: {
    title: "📝 Sprint Review Summary",
    body: "Key Achievements: Delivered real-time collaborative editing, 99.9% uptime on WebSocket syncing, and integrated Voltaic AI search.",
    tags: ["Sprint", "Summary", "Engineering"],
  },
  tasks: {
    title: "🎯 Engineering Backlog Tasks",
    body: "• Implement OAuth token refresh handler\n• Optimize Yjs document memory serialization\n• Add drag-and-drop column layout splits",
    tags: ["Backlog", "Frontend", "Backend"],
  },
};

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<HeroTab>("ai");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResult, setAiResult] = useState<{ title: string; body: string; tags: string[] } | null>(
    SAMPLE_AI_RESPONSES.plan
  );
  const [isAiTyping, setIsAiTyping] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.fromTo(
      titleRef.current,
      { y: 35, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.1 }
    );
    tl.fromTo(
      subRef.current,
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 },
      "-=0.5"
    );
    tl.fromTo(
      ctaRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6 },
      "-=0.4"
    );
    tl.fromTo(
      previewRef.current,
      { y: 40, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.9 },
      "-=0.3"
    );
  }, []);

  const triggerAiQuery = (key: string, queryText: string) => {
    setAiPrompt(queryText);
    setIsAiTyping(true);
    setTimeout(() => {
      setAiResult(SAMPLE_AI_RESPONSES[key] || SAMPLE_AI_RESPONSES.plan);
      setIsAiTyping(false);
    }, 600);
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden bg-background pt-12 pb-20 px-4 sm:px-6 flex flex-col items-center"
    >
      {/* Radial Gradient Background */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Main Copy */}
      <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/80 text-xs font-semibold text-foreground border border-border/60 shadow-sm select-none">
          <span className="flex items-center gap-1 text-amber-500 font-bold">
            <Zap className="h-3.5 w-3.5 fill-amber-400" /> Voltaic AI 2.0
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">The connected workspace for docs, wikis & projects</span>
        </div>

        {/* Big Notion-Style Title */}
        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.08]"
        >
          Write, plan, share. <br />
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            With AI at your side.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          ref={subRef}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed"
        >
          Voltaic is the workspace where better, faster work happens. Integrate your docs, wikis, and project management in one seamless environment.
        </p>

        {/* CTAs */}
        <div
          ref={ctaRef}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
        >
          <Link href="/register" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-12 text-base font-bold bg-[#2383e2] hover:bg-[#1f75cb] text-white px-8 rounded-xl gap-2 shadow-md hover:shadow-lg transition-all border-none">
              Get Voltaic free <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-12 text-base font-semibold px-7 rounded-xl border-border">
              Request a demo
            </Button>
          </Link>
        </div>
        <p className="text-xs text-muted-foreground/80 font-medium">
          Free for individual use. No credit card required.
        </p>
      </div>

      {/* ── Interactive Hero Workspace Preview (Notion Style) ────────────────── */}
      <div
        ref={previewRef}
        className="w-full max-w-5xl mt-12 relative z-20 rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden"
      >
        {/* Top Window Bar */}
        <div className="bg-muted/60 border-b border-border/60 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs font-semibold text-muted-foreground ml-3 hidden sm:inline-block">
              acme-team / Product Workspace
            </span>
          </div>

          {/* Product Tabs */}
          <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-border/50 text-xs font-semibold select-none">
            <button
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === "ai"
                  ? "bg-amber-400/20 text-amber-500 font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-3.5 w-3.5 fill-amber-400" /> AI Assistant
            </button>
            <button
              onClick={() => setActiveTab("docs")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === "docs"
                  ? "bg-primary/10 text-primary font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> Docs
            </button>
            <button
              onClick={() => setActiveTab("wikis")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === "wikis"
                  ? "bg-blue-500/10 text-blue-500 font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" /> Wikis
            </button>
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all ${
                activeTab === "projects"
                  ? "bg-purple-500/10 text-purple-500 font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FolderKanban className="h-3.5 w-3.5" /> Projects
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="text-[11px] font-bold bg-green-500/15 text-green-600 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Live Sync
            </span>
          </div>
        </div>

        {/* Tab Preview Content */}
        <div className="p-6 sm:p-8 min-h-[380px] bg-background flex flex-col justify-between">
          
          {/* TAB 1: VOLTAIC AI */}
          {activeTab === "ai" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-400/20 text-amber-500 border border-amber-400/30">
                    <Zap className="h-5 w-5 fill-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Voltaic AI Assistant</h3>
                    <p className="text-xs text-muted-foreground">Ask questions, summarize documents, or generate task lists instantly.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono">Gemini 3.6 Connected</span>
                </div>
              </div>

              {/* Sample Quick Prompt Chips */}
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => triggerAiQuery("plan", "Draft Q3 product launch plan")}
                  className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium border border-border/60 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Draft Q3 Product Launch Plan
                </button>
                <button
                  onClick={() => triggerAiQuery("summarize", "Summarize recent sprint review notes")}
                  className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium border border-border/60 transition-colors flex items-center gap-1.5"
                >
                  <Bot className="h-3.5 w-3.5 text-blue-500" /> Summarize Sprint Notes
                </button>
                <button
                  onClick={() => triggerAiQuery("tasks", "Generate engineering task checklist")}
                  className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium border border-border/60 transition-colors flex items-center gap-1.5"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-green-500" /> Generate Task List
                </button>
              </div>

              {/* Response Preview Box */}
              <div className="bg-card border border-border/70 rounded-xl p-5 shadow-sm space-y-3 relative">
                {isAiTyping ? (
                  <div className="flex items-center gap-3 text-sm text-muted-foreground font-medium py-4">
                    <Zap className="h-4 w-4 text-amber-500 animate-spin" />
                    <span>Voltaic AI is thinking & retrieving workspace context...</span>
                  </div>
                ) : aiResult ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-base text-foreground">{aiResult.title}</h4>
                      <div className="flex gap-1.5">
                        {aiResult.tags.map((tag, idx) => (
                          <span key={idx} className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono leading-relaxed whitespace-pre-line">
                      {aiResult.body}
                    </p>
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* TAB 2: DOCS */}
          {activeTab === "docs" && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📄</span>
                  <h3 className="text-lg font-bold text-foreground">Q3 Product Architecture Spec</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-background">
                      SR
                    </div>
                    <div className="w-6 h-6 rounded-full bg-purple-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-background">
                      AK
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">2 editing now</span>
                </div>
              </div>

              <div className="space-y-3 font-mono text-sm text-muted-foreground leading-relaxed">
                <p className="text-foreground font-sans text-base font-bold">1. Executive Overview</p>
                <p>
                  Voltaic unites document editing, real-time collaboration, and project management in one ultra-fast interface.
                </p>
                <div className="bg-muted/60 p-3 rounded-lg border border-border/40 font-sans text-xs text-foreground flex items-center gap-2">
                  <Command className="h-4 w-4 text-blue-500" />
                  <span>Type <kbd className="bg-card px-1.5 py-0.5 rounded border border-border font-mono text-[11px]">/table</kbd> or <kbd className="bg-card px-1.5 py-0.5 rounded border border-border font-mono text-[11px]">/ai</kbd> to insert blocks</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WIKIS */}
          {activeTab === "wikis" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📚</span>
                  <h3 className="text-lg font-bold text-foreground">Engineering Knowledge Base</h3>
                </div>
                <span className="text-xs bg-muted px-2.5 py-1 rounded-lg text-muted-foreground font-medium">12 Pages</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-card border border-border/80 hover:border-primary/50 transition-all space-y-2">
                  <span className="text-lg">🚀</span>
                  <h4 className="text-sm font-bold text-foreground">Onboarding Manual</h4>
                  <p className="text-xs text-muted-foreground">Setup local environment, environment variables, & seed data.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/80 hover:border-primary/50 transition-all space-y-2">
                  <span className="text-lg">🛠️</span>
                  <h4 className="text-sm font-bold text-foreground">API Reference</h4>
                  <p className="text-xs text-muted-foreground">NextAuth, WebSocket sync contracts, and Prisma endpoints.</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/80 hover:border-primary/50 transition-all space-y-2">
                  <span className="text-lg">🎨</span>
                  <h4 className="text-sm font-bold text-foreground">Design Tokens</h4>
                  <p className="text-xs text-muted-foreground">Typography scale, dark mode tokens, & Tailwind variables.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <h3 className="text-lg font-bold text-foreground">Sprint 14 Kanban Roadmap</h3>
                </div>
                <span className="text-xs bg-blue-500/10 text-blue-500 font-bold px-2.5 py-1 rounded-full">In Progress</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">To Do</div>
                  <div className="p-2.5 bg-card rounded-lg border border-border text-xs font-semibold text-foreground shadow-sm">
                    Implement Passkey Biometrics
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">In Progress</div>
                  <div className="p-2.5 bg-card rounded-lg border border-border text-xs font-semibold text-foreground shadow-sm">
                    Refactor Landing to Notion.com
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 space-y-2">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Done</div>
                  <div className="p-2.5 bg-card rounded-lg border border-border text-xs font-semibold text-foreground shadow-sm">
                    Deploy Voltaic to Vercel
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Interactive AI Prompt Footer Bar */}
          <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ask Voltaic AI to write, plan, summarize, or search..."
                className="w-full h-10 pl-10 pr-10 rounded-xl bg-muted/50 border border-border text-xs font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <Button
              onClick={() => triggerAiQuery("plan", aiPrompt || "Draft launch plan")}
              className="h-10 px-4 bg-foreground text-background hover:bg-foreground/90 font-bold text-xs rounded-xl gap-1.5"
            >
              Ask AI <Send className="h-3.5 w-3.5" />
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
}
