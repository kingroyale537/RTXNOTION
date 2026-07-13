// app/(main)/[workspaceSlug]/ai/page.tsx
// Notion AI chat assistant page: workspace-aware, styled with pixel-perfect mockup fidelity.

"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Search,
  Settings,
  Globe,
  Sliders,
  Mic,
  ArrowUp,
  Copy,
  Plus,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "model";
  content: string;
}

const PRESET_SUGGESTIONS = [
  {
    title: "Track and organize any kind of work",
    prompt: "Show me how to track tasks, organize my schedule, and structure projects using RTX Notion.",
    emoji: "📋",
  },
  {
    title: "Draft a product requirements document (PRD)",
    prompt: "Write a complete PRD template for a collaborative web app, listing key features, database structure, and milestones.",
    emoji: "📄",
  },
  {
    title: "Summarize this workspace",
    prompt: "Analyze the pages in my current workspace and write a concise, bullet-pointed summary of what we are working on.",
    emoji: "⚡",
  },
];

export default function AiChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { currentWorkspace } = useWorkspaceStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWorkspaceSearch, setIsWorkspaceSearch] = useState(true);
  const [keyMissingError, setKeyMissingError] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const userName = session?.user?.name?.split(" ")[0] ?? "friend";

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(textToSend: string) {
    if (!textToSend.trim() || isLoading) return;
    
    setKeyMissingError(false);
    const userPrompt = textToSend.trim();
    setInputValue("");
    
    const newMessages = [...messages, { role: "user" as const, content: userPrompt }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          prompt: userPrompt,
          messages: messages, // history
          workspaceId: isWorkspaceSearch ? currentWorkspace?.id : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (res.status === 400 && json.error?.includes("GEMINI_API_KEY")) {
          setKeyMissingError(true);
          toast.error("Gemini API key is not configured");
        } else {
          toast.error(json.error ?? "Failed to fetch response");
        }
        return;
      }

      setMessages([...newMessages, { role: "model" as const, content: json.data.text }]);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", { duration: 1500 });
  }

  async function insertToNewPage(content: string) {
    if (!currentWorkspace) return;
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: currentWorkspace.id,
          title: "AI Response Draft",
          emoji: "✨",
          contentText: content,
        }),
      });

      if (!res.ok) throw new Error();
      const json = await res.json();
      toast.success("Created new page with AI text!");
      router.push(`/${currentWorkspace.slug}/${json.data.id}`);
    } catch {
      toast.error("Could not create page");
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#191919] text-[#f3f4f6]">
      {/* Header bar */}
      <header className="h-11 border-b border-[#2a2a2a] flex items-center justify-between px-6 bg-[#191919] select-none text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span className="font-semibold text-gray-200">Notion AI</span>
          <span>/</span>
          <span>Welcome to Notion AI</span>
          <ChevronDown className="h-3 w-3" />
        </div>
      </header>

      {/* Main chat section */}
      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-8 flex flex-col">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto w-full pt-10 flex-1 flex flex-col justify-center">
            {/* Welcoming message */}
            <div className="space-y-4 mb-10">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                Hi {userName}. I&apos;m Notion AI 👋
              </h1>
              <p className="text-gray-300 text-base leading-relaxed font-medium">
                Yes, another AI, I know. But I actually get work done for you — not just talk about it.
              </p>
              <p className="text-gray-300 text-base leading-relaxed font-medium">
                Think of Notion as your home base for work. Meetings, tasks, and projects are all in one place, all connected.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Let&apos;s get started. Tell me what you&apos;re here to do or jump in with what most people start with:
              </p>
            </div>

            {/* API Key Missing Instruction Box */}
            {keyMissingError || messages.length === 0 && (
              <div className="mb-6 p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-300">
                  <span className="font-bold text-yellow-500 block mb-1">GEMINI_API_KEY NOT CONFIGURED</span>
                  To enable Notion AI features, you need to add your Gemini API Key to your `.env` file or Vercel environment variables:
                  <div className="bg-black/40 p-2.5 rounded border border-[#2e2e2e] mt-2 font-mono text-[10px] select-text">
                    GEMINI_API_KEY=your_gemini_key_here
                  </div>
                  <p className="mt-2 text-gray-400">
                    Get a free API key at <a href="https://aistudio.google.com/" target="_blank" className="text-primary underline hover:text-white transition">Google AI Studio</a>.
                  </p>
                </div>
              </div>
            )}

            {/* Suggestions list */}
            <div className="grid grid-cols-1 gap-3">
              {PRESET_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(s.prompt)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#222222] border border-[#2e2e2e] hover:border-[#3e3e3e] hover:bg-[#252525] text-left transition duration-200"
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <span className="text-sm font-semibold text-gray-300 hover:text-white transition">
                    {s.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto w-full space-y-6 flex-1">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-white"
                      : "bg-[#222222] border border-[#2e2e2e] text-[#e3e3e3] whitespace-pre-wrap"
                  }`}
                >
                  {m.content}
                </div>

                {/* AI response actions menu */}
                {m.role === "model" && (
                  <div className="flex items-center gap-2 mt-2 px-2 text-gray-500 hover:text-gray-400 transition select-none">
                    <button
                      onClick={() => copyToClipboard(m.content)}
                      className="p-1 rounded hover:bg-[#2d2d2d] transition"
                      title="Copy response"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => insertToNewPage(m.content)}
                      className="p-1 rounded hover:bg-[#2d2d2d] transition"
                      title="Save to new page"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-3 w-[1px] bg-[#2e2e2e] mx-1" />
                    <button className="p-1 rounded hover:bg-[#2d2d2d] transition">
                      <ThumbsUp className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1 rounded hover:bg-[#2d2d2d] transition">
                      <ThumbsDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* AI generating loader */}
            {isLoading && (
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                <span>Notion AI is thinking…</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Input Bar */}
      <div className="p-6 max-w-2xl mx-auto w-full select-none bg-gradient-to-t from-[#191919] via-[#191919] to-transparent">
        <div className="relative border border-[#3e3e3e] focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-xl bg-[#222222] p-2 transition shadow-xl">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isWorkspaceSearch
                ? "Describe your own (Workspace Search active)"
                : "Describe your own"
            }
            className="w-full resize-none bg-transparent outline-none border-none text-sm text-[#f3f4f6] placeholder-gray-500 min-h-[48px] px-3 pt-2 pb-8"
            rows={1}
          />

          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            {/* Input Toolbar Left */}
            <div className="flex items-center gap-1.5 text-gray-500">
              <button className="p-1 rounded hover:bg-[#2d2d2d] transition" title="Add source">
                <Plus className="h-4 w-4" />
              </button>
              <button className="p-1 rounded hover:bg-[#2d2d2d] transition" title="AI Settings">
                <Sliders className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setIsWorkspaceSearch(!isWorkspaceSearch);
                  toast.success(
                    isWorkspaceSearch
                      ? "Search disabled (Global knowledge only)"
                      : "Search enabled (Scanning workspace pages)"
                  );
                }}
                className={`p-1 rounded transition ${
                  isWorkspaceSearch ? "text-purple-400 hover:bg-purple-500/10" : "hover:bg-[#2d2d2d]"
                }`}
                title="Search Workspace Pages context"
              >
                <Globe className="h-4 w-4" />
              </button>
            </div>

            {/* Input Toolbar Right */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[11px] font-semibold bg-[#2d2d2d] hover:bg-[#3d3d3d] transition border border-[#3a3a3a] px-2 py-0.5 rounded text-gray-300 cursor-pointer">
                <span>Auto</span>
                <ChevronDown className="h-3 w-3" />
              </div>
              <button className="p-1 rounded hover:bg-[#2d2d2d] text-gray-500 transition">
                <Mic className="h-4 w-4" />
              </button>
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="w-7 h-7 rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center text-white disabled:bg-[#2d2d2d] disabled:text-gray-600 transition"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
