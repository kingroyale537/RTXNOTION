// components/workspace/AiSidebar.tsx
// Right-side AI Agent Chat Sidebar matching Notion's agent pane with high mockup fidelity.

"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
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
  X,
  Pin,
  Maximize2,
  FileText,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { usePageStore } from "@/store/pageStore";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "model";
  content: string;
}

const AGENTS = [
  {
    id: "welcome-notion",
    name: "Welcome to Notion",
    description: "These Notes are private to you. Nobody else can see what's here. Think of this as your personal scratchpad — dump quick thoughts, rough drafts, reminders, or anything you need to remember. I can help you search or summarize every note.",
  },
  {
    id: "workspace-copilot",
    name: "Workspace Copilot",
    description: "I am your workspace-wide copilot. I can help find connections, search documents, rewrite pages, and draft summaries for you.",
  },
  {
    id: "team-hq-agent",
    name: "Team HQ Agent",
    description: "The agent for Team HQ. I am configured with access to projects, tasks, meetings, and docs to help coordinate team operations.",
  },
];

export function AiSidebar() {
  const params = useParams();
  const { data: session } = useSession();
  const { currentWorkspace } = useWorkspaceStore();
  const { aiSidebarOpen, setAiSidebarOpen, activeAgentId, setActiveAgentId } = useUIStore();
  const { currentPage } = usePageStore();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWorkspaceSearch, setIsWorkspaceSearch] = useState(true);
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedAgent = AGENTS.find((a) => a.id === activeAgentId) || AGENTS[0];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Click outside listener for dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAgentDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function sendMessage(textToSend: string) {
    if (!textToSend.trim() || isLoading) return;

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
          messages: messages,
          workspaceId: isWorkspaceSearch ? currentWorkspace?.id : undefined,
          pageId: currentPage?.id || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to fetch response");
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

  if (!aiSidebarOpen) return null;

  return (
    <aside className="flex flex-col h-full bg-[#191919] border-l border-[#2a2a2a] text-[#f3f4f6] select-none overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="h-12 border-b border-[#2a2a2a] px-3 flex items-center justify-between flex-shrink-0 bg-[#191919]">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowAgentDropdown(!showAgentDropdown)}
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#2c2c2c] transition text-sm font-semibold text-[#f3f4f6]"
          >
            <span>🌴 {selectedAgent.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {showAgentDropdown && (
            <div className="absolute top-full left-0 mt-1.5 w-56 bg-[#222222] border border-[#2a2a2a] rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              {AGENTS.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => {
                    setActiveAgentId(agent.id);
                    setShowAgentDropdown(false);
                    setMessages([]); // Clear chat history when switching agents
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition hover:bg-[#2c2c2c] flex flex-col gap-0.5 ${
                    agent.id === activeAgentId ? "bg-[#2c2c2c] text-white font-medium" : "text-gray-300"
                  }`}
                >
                  <span className="font-semibold text-sm">🌴 {agent.name}</span>
                  <span className="text-[10px] text-gray-500 truncate">{agent.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-gray-400">
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-[#2c2c2c] text-gray-400 hover:text-white">
            <Share2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-[#2c2c2c] text-gray-400 hover:text-white">
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-[#2c2c2c] text-gray-400 hover:text-white">
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-[#2c2c2c] text-gray-400 hover:text-white">
            <Pin className="h-3.5 w-3.5" />
          </Button>
          <Button
            onClick={() => setAiSidebarOpen(false)}
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-[#2c2c2c] text-gray-400 hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </header>

      {/* ── Main Chat Area ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <div className="space-y-6">
            {/* Quick Action Suggestion Badge */}
            <button
              onClick={() => sendMessage("Show me around my Notes")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#2c2c2c] border border-[#3c3c3c] hover:bg-[#333] transition text-xs font-semibold text-gray-200 self-start shadow-sm"
            >
              <FileText className="h-3.5 w-3.5 text-gray-400" />
              <span>Show me around my 📁 Notes</span>
            </button>

            {/* Welcome Description */}
            <div className="text-gray-300 text-xs leading-relaxed font-medium space-y-3 px-1">
              <p>{selectedAgent.description}</p>
              <p>Try adding a note, or tell me to add one for you.</p>
            </div>

            {/* Illustration Card */}
            <div className="bg-[#222222] border border-[#2c2c2c] rounded-xl p-4 flex flex-col items-center justify-center space-y-3 relative shadow-inner overflow-hidden max-w-sm mx-auto">
              <div className="absolute top-2 left-2 text-[10px] text-gray-500 font-mono">Mockup Demo</div>
              <div className="w-full flex justify-center py-4 bg-[#191919]/50 rounded-lg border border-[#2c2c2c]/40 relative group">
                {/* Simulated New note dropdown button */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#2563eb] text-white text-[11px] font-semibold cursor-default relative">
                  <span>New note</span>
                  <ChevronDown className="h-3 w-3" />
                  {/* Cursor selector */}
                  <div className="absolute bottom-[-10px] right-[-10px] pointer-events-none transform animate-bounce">
                    <span className="text-lg">👆</span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 text-center">
                Click <span className="text-gray-200 font-semibold">New note</span> to add a fast entry or drag-and-drop to categorize.
              </p>
            </div>

            {/* Quick Action Icons */}
            <div className="flex items-center gap-3 pt-2 text-gray-500">
              <button className="hover:text-gray-300 transition">
                <Copy className="h-4 w-4" />
              </button>
              <button className="hover:text-gray-300 transition">
                <Plus className="h-4 w-4" />
              </button>
              <button className="hover:text-gray-300 transition">
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button className="hover:text-gray-300 transition">
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-[90%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    m.role === "user"
                      ? "bg-[#2563eb] text-white"
                      : "bg-[#222222] border border-[#2a2a2a] text-[#e3e3e3] whitespace-pre-wrap font-medium"
                  }`}
                >
                  {m.content}
                </div>

                {/* Response Action bar */}
                {m.role === "model" && (
                  <div className="flex items-center gap-2 mt-2 px-1 text-gray-500 hover:text-gray-400 transition select-none">
                    <button
                      onClick={() => copyToClipboard(m.content)}
                      className="p-1 rounded hover:bg-[#2c2c2c] transition"
                      title="Copy response"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <button className="p-1 rounded hover:bg-[#2c2c2c] transition">
                      <ThumbsUp className="h-3 w-3" />
                    </button>
                    <button className="p-1 rounded hover:bg-[#2c2c2c] transition">
                      <ThumbsDown className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-400" />
                <span>Thinking…</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* ── Chat Input ────────────────────────────────────────────────────── */}
      <div className="p-4 bg-[#191919] border-t border-[#2a2a2a] flex-shrink-0">
        <div className="border border-[#3c3c3c] focus-within:border-[#2563eb] focus-within:ring-1 focus-within:ring-[#2563eb] rounded-xl bg-[#222222] p-2 transition duration-200">
          {/* Top badge pill inside text field */}
          <div className="inline-flex items-center gap-1 bg-[#2c2c2c] px-2 py-0.5 rounded text-[10px] text-gray-300 font-semibold mb-1">
            <FileText className="h-3 w-3 text-gray-400" />
            <span>{currentPage ? `Page: ${currentPage.title || "Untitled"}` : "Workspace Context"}</span>
          </div>

          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your own"
            className="w-full resize-none bg-transparent outline-none border-none text-xs text-[#f3f4f6] placeholder-gray-500 min-h-[48px] px-1 py-1"
            rows={1}
          />

          <div className="flex items-center justify-between pt-1">
            {/* Left toolbar */}
            <div className="flex items-center gap-1.5 text-gray-500">
              <button className="p-1.5 rounded hover:bg-[#2c2c2c] transition" title="Add resource">
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button className="p-1.5 rounded hover:bg-[#2c2c2c] transition" title="Settings">
                <Sliders className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  setIsWorkspaceSearch(!isWorkspaceSearch);
                  toast.success(
                    isWorkspaceSearch
                      ? "Global search mode active"
                      : "Workspace search mode active"
                  );
                }}
                className={`p-1.5 rounded transition ${
                  isWorkspaceSearch ? "text-purple-400 hover:bg-purple-500/10" : "hover:bg-[#2c2c2c]"
                }`}
                title="Workspace search toggle"
              >
                <Globe className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Right toolbar */}
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-1 text-[10px] font-semibold bg-[#2c2c2c] hover:bg-[#333] transition border border-[#3c3c3c] px-2 py-0.5 rounded text-gray-300 cursor-pointer">
                <span>Auto</span>
                <ChevronDown className="h-3 w-3" />
              </div>
              <button className="p-1.5 rounded hover:bg-[#2c2c2c] text-gray-500 transition">
                <Mic className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => sendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="w-6.5 h-6.5 rounded-full bg-[#2563eb] hover:bg-[#2563eb]/90 flex items-center justify-center text-white disabled:bg-[#2c2c2c] disabled:text-gray-600 transition"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
