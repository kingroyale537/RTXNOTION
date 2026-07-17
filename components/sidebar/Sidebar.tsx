// components/sidebar/Sidebar.tsx
// Main sidebar: Workspace Switcher → Horizontal Icons → Illustration Card → Segmented Lists (Private, Teamspaces, Agents) → Footer.

"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Home as HomeIcon,
  MessageSquare,
  Mic,
  Inbox,
  Search,
  Plus,
  Compass,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  BookOpen,
  FileText,
  Sliders,
  Sparkles,
  Users,
  Settings,
  FolderDot,
  CheckSquare,
  Calendar,
  PenSquare,
  Trash2,
} from "lucide-react";
import { useUIStore } from "@/store/uiStore";
import { usePageStore } from "@/store/pageStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarHeader } from "./SidebarHeader";
import { PageTree } from "./PageTree";
import { SidebarFooter } from "./SidebarFooter";
import { TrashModal } from "../modals/TrashModal";
import { cn } from "@/lib/utils";
import type { WorkspaceWithMembers } from "@/types";
import type { Role } from "@prisma/client";
import toast from "react-hot-toast";

interface Props {
  workspace: WorkspaceWithMembers;
  currentUserId: string;
  currentUserRole: Role;
}

export function Sidebar({ workspace, currentUserId, currentUserRole }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    sidebarOpen,
    toggleAiSidebar,
    aiSidebarOpen,
    setCommandOpen,
    setActiveAgentId,
    setTrashOpen,
  } = useUIStore();
  const { pageTree, addPageToTree } = usePageStore();

  if (!sidebarOpen) return null;

  const homePath = `/${workspace.slug}`;

  // Partition pages in the tree. If Team HQ exists, put it under Teamspaces.
  const privatePages = pageTree.filter((p) => p.title !== "Team HQ");
  const teamspacePages = pageTree.filter((p) => p.title === "Team HQ");

  // Create a new top-level page
  async function handleAddPage(title = "Untitled", parentId: string | null = null) {
    try {
      const res = await fetch(`/api/workspaces/${workspace.id}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          title,
          emoji: "📄",
          parentId,
        }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const newPage = { ...json.data, children: [], _count: { children: 0 } };
      addPageToTree(newPage, parentId);
      router.push(`/${workspace.slug}/${newPage.id}`);
      toast.success(`Created "${title}"`);
    } catch {
      toast.error("Could not create page");
    }
  }

  // Create a default Team HQ workspace template if clicked
  async function handleCreateTeamHQ() {
    toast.loading("Setting up Team HQ...", { id: "teamhq" });
    try {
      // 1. Create Team HQ parent page
      const res = await fetch(`/api/workspaces/${workspace.id}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: workspace.id,
          title: "Team HQ",
          emoji: "🏢",
        }),
      });
      if (!res.ok) throw new Error();
      const parentJson = await res.json();
      const parentPage = { ...parentJson.data, children: [], _count: { children: 0 } };
      addPageToTree(parentPage, null);

      // 2. Create Projects, Tasks, Meetings, Docs child pages
      const childrenTitles = [
        { title: "Projects", emoji: "🗂️" },
        { title: "Tasks", emoji: "✅" },
        { title: "Meetings", emoji: "📅" },
        { title: "Docs", emoji: "📄" },
      ];

      for (const item of childrenTitles) {
        const childRes = await fetch(`/api/workspaces/${workspace.id}/pages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId: workspace.id,
            parentId: parentPage.id,
            title: item.title,
            emoji: item.emoji,
          }),
        });
        if (childRes.ok) {
          const childJson = await childRes.json();
          addPageToTree({ ...childJson.data, children: [], _count: { children: 0 } }, parentPage.id);
        }
      }

      toast.success("Team HQ created successfully!", { id: "teamhq" });
      router.push(`/${workspace.slug}/${parentPage.id}`);
    } catch {
      toast.error("Could not create Team HQ", { id: "teamhq" });
    }
  }

  return (
    <aside className="flex flex-col h-full bg-[#191919] border-r border-[#2a2a2a] select-none text-[#f3f4f6]">
      {/* Workspace Switcher / Header */}
      <SidebarHeader workspace={workspace} currentUserRole={currentUserRole} />

      <Separator className="bg-[#2a2a2a]" />

      {/* ── Horizontal Navigation Icons Row ───────────────────────────────── */}
      <div className="px-3.5 py-2.5 flex items-center justify-between text-gray-400">
        <button
          onClick={() => router.push(homePath)}
          className={cn(
            "p-2 rounded-lg hover:bg-[#2c2c2c] hover:text-white transition-all",
            pathname === homePath && "bg-[#2c2c2c] text-white"
          )}
          title="Home"
        >
          <HomeIcon className="h-4 w-4" />
        </button>
        <button
          onClick={toggleAiSidebar}
          className={cn(
            "p-2 rounded-lg hover:bg-[#2c2c2c] hover:text-white transition-all",
            aiSidebarOpen && "bg-[#2c2c2c] text-white"
          )}
          title="AI Agent Chat"
        >
          <MessageSquare className="h-4 w-4 text-purple-400" />
        </button>
        <button
          onClick={() => {
            toggleAiSidebar();
            setActiveAgentId("workspace-copilot");
            toast.success("Voice agent listening...");
          }}
          className="p-2 rounded-lg hover:bg-[#2c2c2c] hover:text-white transition-all"
          title="Voice Agent"
        >
          <Mic className="h-4 w-4 text-blue-400" />
        </button>
        <button
          onClick={() => toast.success("No new notifications")}
          className="p-2 rounded-lg hover:bg-[#2c2c2c] hover:text-white transition-all"
          title="Inbox"
        >
          <Inbox className="h-4 w-4" />
        </button>
        <button
          onClick={() => setCommandOpen(true)}
          className="p-2 rounded-lg hover:bg-[#2c2c2c] hover:text-white transition-all"
          title="Search (⌘K)"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* ── Premium Onboarding Card ───────────────────────────────────────── */}
      <div className="mx-3.5 mb-3 p-3 rounded-xl bg-gradient-to-br from-[#222222] to-[#151515] border border-[#2a2a2a] relative overflow-hidden flex flex-col gap-2 shadow-inner">
        <div className="w-full h-16 rounded-lg bg-[#191919]/60 border border-[#2c2c2c] overflow-hidden relative flex items-center justify-center">
          <div className="absolute top-1 left-1.5 text-[8px] text-gray-600 font-mono tracking-widest">VOLTAIC AI</div>
          <div className="flex gap-1 items-end h-6">
            <div className="w-2 h-4 bg-purple-500/20 border border-purple-500/35 rounded-sm" />
            <div className="w-2 h-8 bg-blue-500/30 border border-blue-500/40 rounded-sm relative">
              <div className="absolute top-[-5px] left-1/2 transform -translate-x-1/2 text-[9px] animate-pulse">☀️</div>
            </div>
            <div className="w-2 h-5 bg-pink-500/20 border border-pink-500/35 rounded-sm" />
          </div>
          <div className="absolute top-2 right-3 text-[10px] opacity-40">☁️</div>
        </div>
        <div className="flex flex-col gap-0.5">
          <h4 className="text-[11px] font-bold text-white tracking-wide">Build your ideal Voltaic</h4>
          <p className="text-[9px] text-gray-400 font-medium">Create pages, databases, and agents</p>
        </div>
      </div>

      <Separator className="bg-[#2a2a2a]" />

      {/* ── Scrollable Lists ──────────────────────────────────────────────── */}
      <ScrollArea className="flex-1 px-2.5 py-3">
        <div className="space-y-4">
          {/* 1. Private Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <span>Private</span>
              <button
                onClick={() => handleAddPage("Notes")}
                className="hover:text-white transition"
                title="Add personal page"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            {privatePages.length > 0 ? (
              <div className="space-y-0.5">
                <PageTree
                  workspaceId={workspace.id}
                  workspaceSlug={workspace.slug}
                  pages={privatePages}
                />
              </div>
            ) : (
              <button
                onClick={() => handleAddPage("Notes")}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-gray-400 hover:bg-[#2c2c2c] hover:text-white transition text-left"
              >
                <FileText className="h-3.5 w-3.5 text-gray-500" />
                <span>Notes (Click to create)</span>
              </button>
            )}
          </div>

          {/* 2. Teamspaces Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <span>Teamspaces</span>
              {teamspacePages.length === 0 && (
                <button
                  onClick={handleCreateTeamHQ}
                  className="hover:text-white transition"
                  title="Initialize TeamHQ space"
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </div>
            {teamspacePages.length > 0 ? (
              <div className="space-y-0.5">
                <PageTree
                  workspaceId={workspace.id}
                  workspaceSlug={workspace.slug}
                  pages={teamspacePages}
                />
              </div>
            ) : (
              <button
                onClick={handleCreateTeamHQ}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-gray-400 hover:bg-[#2c2c2c] hover:text-white transition text-left group"
              >
                <div className="flex items-center gap-2">
                  <Compass className="h-3.5 w-3.5 text-gray-500" />
                  <span>Team HQ</span>
                </div>
                <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 transition" />
              </button>
            )}
          </div>

          {/* 3. Agents Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 text-[10px] font-bold uppercase tracking-wider text-gray-500">
              <span>Agents</span>
              <button
                onClick={() => {
                  toggleAiSidebar();
                  toast.success("Create custom agents in the AI side panel");
                }}
                className="hover:text-white transition"
                title="New custom agent"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  toggleAiSidebar();
                  setActiveAgentId("welcome-voltaic");
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-gray-300 hover:bg-[#2c2c2c] hover:text-white transition text-left"
              >
                <span>🌴</span>
                <span className="truncate">Welcome to Voltaic</span>
              </button>
              <button
                onClick={() => {
                  toggleAiSidebar();
                  setActiveAgentId("workspace-copilot");
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-gray-300 hover:bg-[#2c2c2c] hover:text-white transition text-left"
              >
                <span>🤖</span>
                <span className="truncate">Workspace Copilot</span>
              </button>
              <button
                onClick={() => {
                  toggleAiSidebar();
                  setActiveAgentId("team-hq-agent");
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-gray-300 hover:bg-[#2c2c2c] hover:text-white transition text-left"
              >
                <span>🏢</span>
                <span className="truncate">Team HQ Agent</span>
              </button>
              <button
                onClick={() => {
                  toggleAiSidebar();
                  toast.success("Design custom instructions in AI Orchestration");
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-gray-500 hover:bg-[#2c2c2c] hover:text-white transition text-left"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New agent</span>
              </button>
            </div>
          </div>

          {/* 4. Help & Library */}
          <div className="space-y-0.5 pt-2">
            <button
              onClick={() => toast.success("Accessing Voltaic documentation...")}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-gray-400 hover:bg-[#2c2c2c] hover:text-white transition text-left"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Library</span>
            </button>
            <button
              onClick={() => toast.success("Opening Help center...")}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-gray-400 hover:bg-[#2c2c2c] hover:text-white transition text-left"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Help</span>
            </button>
            <button
              onClick={() => setTrashOpen(true)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs text-gray-400 hover:bg-[#2c2c2c] hover:text-white transition text-left"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Trash</span>
            </button>
          </div>
        </div>
      </ScrollArea>

      <Separator className="bg-[#2a2a2a]" />

      {/* ── Footer Chat Trigger & User Area ───────────────────────────────── */}
      <div className="p-3.5 space-y-2">
        <button
          onClick={toggleAiSidebar}
          className="w-full h-8 flex items-center justify-center gap-2 rounded-lg bg-[#2c2c2c] border border-[#3c3c3c] text-xs font-semibold text-gray-200 hover:bg-[#333] transition-all shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>New chat</span>
          <PenSquare className="h-3.5 w-3.5 text-gray-500 ml-auto mr-1" />
        </button>

        <SidebarFooter currentUserId={currentUserId} />
      </div>

      <TrashModal workspaceId={workspace.id} />
    </aside>
  );
}
