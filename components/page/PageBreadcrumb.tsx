// components/page/PageBreadcrumb.tsx
// Top navigation bar: sidebar toggle, breadcrumb path, presence avatars, share, favorites, options dropdown.

"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  PanelLeft,
  Share2,
  MoreHorizontal,
  Star,
  Link,
  Lock,
  ChevronDown,
  Sparkles,
  History,
  Copy,
  Download,
  Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PresenceAvatars } from "@/components/presence/PresenceAvatars";
import { useUIStore } from "@/store/uiStore";
import { usePageStore } from "@/store/pageStore";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  workspaceSlug: string;
  workspaceId: string;
  pageId?: string;
}

// Helper to convert ProseMirror TipTap JSON to clean Markdown
function convertDocToMarkdown(doc: any): string {
  if (!doc || !doc.content || !Array.isArray(doc.content)) return "";

  let markdown = "";
  for (const node of doc.content) {
    if (node.type === "heading") {
      const level = "#".repeat(node.attrs?.level || 1);
      const text = node.content?.map((c: any) => c.text).join("") || "";
      markdown += `${level} ${text}\n\n`;
    } else if (node.type === "paragraph") {
      const text = node.content?.map((c: any) => c.text).join("") || "";
      markdown += `${text}\n\n`;
    } else if (node.type === "bulletList") {
      for (const li of node.content || []) {
        const text = li.content?.[0]?.content?.map((c: any) => c.text).join("") || "";
        markdown += `- ${text}\n`;
      }
      markdown += "\n";
    } else if (node.type === "taskList") {
      for (const task of node.content || []) {
        const checked = task.attrs?.checked ? "[x]" : "[ ]";
        const text = task.content?.[0]?.content?.map((c: any) => c.text).join("") || "";
        markdown += `- ${checked} ${text}\n`;
      }
      markdown += "\n";
    } else if (node.type === "horizontalRule") {
      markdown += "---\n\n";
    } else if (node.type === "codeBlock") {
      const text = node.content?.map((c: any) => c.text).join("") || "";
      const lang = node.attrs?.language || "";
      markdown += `\`\`\`${lang}\n${text}\n\`\`\`\n\n`;
    } else if (node.type === "blockquote") {
      const text = node.content?.map((c: any) => c.text).join("") || "";
      markdown += `> ${text}\n\n`;
    }
  }
  return markdown.trim();
}

export function PageBreadcrumb({ workspaceSlug, workspaceId, pageId }: Props) {
  const router = useRouter();
  const {
    toggleSidebar,
    sidebarOpen,
    setSharePageId,
    toggleAiSidebar,
    aiSidebarOpen,
    historyOpen,
    setHistoryOpen,
  } = useUIStore();
  const { currentPage, updateCurrentPageMeta, updatePageInTree, removePageFromTree, addPageToTree } = usePageStore();

  const [optionsOpen, setOptionsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close options menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOptionsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/${workspaceSlug}${pageId ? `/${pageId}` : ""}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
    }
  };

  const toggleFavorite = async () => {
    if (!currentPage) return;
    const nextState = !currentPage.isFavorite;
    updateCurrentPageMeta({ isFavorite: nextState });
    updatePageInTree(currentPage.id, { isFavorite: nextState } as any);

    try {
      const res = await fetch(`/api/pages/${currentPage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: nextState }),
      });
      if (!res.ok) throw new Error();
      toast.success(nextState ? "Added to favorites" : "Removed from favorites");
    } catch {
      toast.error("Failed to update favorite status");
      updateCurrentPageMeta({ isFavorite: !nextState });
      updatePageInTree(currentPage.id, { isFavorite: !nextState } as any);
    }
  };

  const handleDuplicate = async () => {
    if (!currentPage) return;
    setOptionsOpen(false);
    toast.loading("Duplicating page...", { id: "duplicate-page" });

    try {
      // 1. Create a new empty page
      const createRes = await fetch(`/api/workspaces/${workspaceId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          title: `${currentPage.title} (Copy)`,
          emoji: currentPage.iconValue || "📄",
          parentId: currentPage.parentId,
        }),
      });
      if (!createRes.ok) throw new Error();
      const newPageJson = await createRes.json();
      const newPageId = newPageJson.data.id;

      // 2. Clone active page content
      const patchRes = await fetch(`/api/pages/${newPageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: currentPage.content }),
      });
      if (!patchRes.ok) throw new Error();
      const finalPageJson = await patchRes.json();

      const newPageNode = {
        ...finalPageJson.data,
        children: [],
        _count: { children: 0 },
      };

      // Add to store tree and push client routing
      addPageToTree(newPageNode, currentPage.parentId);
      router.push(`/${workspaceSlug}/${newPageId}`);
      toast.success("Page duplicated successfully!", { id: "duplicate-page" });
    } catch {
      toast.error("Failed to duplicate page", { id: "duplicate-page" });
    }
  };

  const handleExportMarkdown = () => {
    if (!currentPage) return;
    setOptionsOpen(false);
    try {
      const markdown = convertDocToMarkdown(currentPage.content);
      const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${currentPage.title || "untitled"}.md`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Markdown exported successfully!");
    } catch {
      toast.error("Could not export to markdown");
    }
  };

  const handleDeletePage = async () => {
    if (!currentPage) return;
    if (!confirm("Are you sure you want to move this page to trash?")) return;
    setOptionsOpen(false);
    toast.loading("Moving page to trash...", { id: "archive-page" });

    try {
      const res = await fetch(`/api/pages/${currentPage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });
      if (!res.ok) throw new Error();

      removePageFromTree(currentPage.id);
      router.push(`/${workspaceSlug}`);
      toast.success("Moved page to trash", { id: "archive-page" });
    } catch {
      toast.error("Failed to archive page", { id: "archive-page" });
    }
  };

  return (
    <TooltipProvider delayDuration={400}>
      <header className="flex items-center h-12 px-4 border-b border-[#2a2a2a]/60 bg-[#191919] sticky top-0 z-10 flex-shrink-0 gap-2 select-none text-[#f3f4f6]">
        {/* Left Sidebar toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:bg-[#2c2c2c] hover:text-white"
              onClick={toggleSidebar}
              id="toggle-sidebar"
            >
              <PanelLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{sidebarOpen ? "Close sidebar" : "Open sidebar"}</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5 bg-[#2a2a2a]" />

        {/* Dynamic Title / Private badge */}
        <div className="flex items-center gap-2 flex-1 min-w-0 text-sm">
          <span className="flex items-center gap-1.5 text-white font-semibold truncate cursor-pointer hover:bg-[#2c2c2c] px-2 py-1 rounded transition">
            {currentPage ? (
              <>
                <span className="text-base leading-none">{currentPage.iconValue ?? "📄"}</span>
                <span>{currentPage.title || "Untitled"}</span>
              </>
            ) : (
              <>
                <span>🏢</span>
                <span>Workspace</span>
              </>
            )}
          </span>

          <Separator orientation="vertical" className="h-4 bg-[#2a2a2a]" />

          {/* Private status indicator */}
          <div className="flex items-center gap-1 text-[11px] text-gray-400 font-semibold hover:bg-[#2c2c2c] px-2 py-0.5 rounded cursor-pointer transition">
            <Lock className="h-3 w-3 text-gray-400" />
            <span>Private</span>
            <ChevronDown className="h-3 w-3 text-gray-500" />
          </div>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Live presence avatars */}
          {pageId && <PresenceAvatars pageId={pageId} currentPageOnly />}

          {pageId && (
            <>
              {/* Share button */}
              <div
                className="flex items-center bg-[#2c2c2c] hover:bg-[#333] transition border border-[#3c3c3c] px-2 py-1 rounded text-xs font-semibold text-gray-200 cursor-pointer gap-1"
                onClick={() => setSharePageId(pageId)}
              >
                <Lock className="h-3 w-3 text-gray-400" />
                <span>Share</span>
                <ChevronDown className="h-3 w-3 text-gray-500" />
              </div>

              {/* Copy Link */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:bg-[#2c2c2c] hover:text-white"
                    onClick={handleCopyLink}
                    id="copy-link-btn"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy page link</TooltipContent>
              </Tooltip>

              {/* Favorites */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 transition",
                      currentPage?.isFavorite ? "text-yellow-400 fill-yellow-400" : "text-gray-400 hover:bg-[#2c2c2c] hover:text-white"
                    )}
                    id="favorite-btn"
                    onClick={toggleFavorite}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{currentPage?.isFavorite ? "Remove from favorites" : "Add to favorites"}</TooltipContent>
              </Tooltip>

              {/* Toggle AI Sidebar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 transition",
                      aiSidebarOpen ? "bg-[#2c2c2c] text-purple-400" : "text-gray-400 hover:bg-[#2c2c2c] hover:text-white"
                    )}
                    onClick={toggleAiSidebar}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{aiSidebarOpen ? "Close AI assistant" : "Open AI assistant"}</TooltipContent>
              </Tooltip>

              {/* Page History */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 transition",
                      historyOpen ? "bg-[#2c2c2c] text-purple-400" : "text-gray-400 hover:bg-[#2c2c2c] hover:text-white"
                    )}
                    onClick={() => setHistoryOpen(!historyOpen)}
                  >
                    <History className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Page History</TooltipContent>
              </Tooltip>

              {/* Options OptionsDropdown */}
              <div className="relative" ref={dropdownRef}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn("h-8 w-8 text-gray-400 hover:bg-[#2c2c2c] hover:text-white", optionsOpen && "bg-[#2c2c2c]")}
                      onClick={() => setOptionsOpen(!optionsOpen)}
                      id="more-options-btn"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>More options</TooltipContent>
                </Tooltip>

                {optionsOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-44 bg-[#222222] border border-[#2a2a2a] rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-[#f3f4f6]">
                    <button
                      onClick={handleDuplicate}
                      className="w-full text-left px-3 py-2 text-xs transition hover:bg-[#2c2c2c] flex items-center gap-2 font-semibold text-gray-200 hover:text-white"
                    >
                      <Copy className="h-3.5 w-3.5 text-gray-400" />
                      <span>Duplicate page</span>
                    </button>
                    <button
                      onClick={handleExportMarkdown}
                      className="w-full text-left px-3 py-2 text-xs transition hover:bg-[#2c2c2c] flex items-center gap-2 font-semibold text-gray-200 hover:text-white"
                    >
                      <Download className="h-3.5 w-3.5 text-gray-400" />
                      <span>Export to Markdown</span>
                    </button>
                    <Separator className="bg-[#2a2a2a] my-1" />
                    <button
                      onClick={handleDeletePage}
                      className="w-full text-left px-3 py-2 text-xs transition hover:bg-[#2c2c2c] flex items-center gap-2 font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/20"
                    >
                      <Trash className="h-3.5 w-3.5" />
                      <span>Move to trash</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}
