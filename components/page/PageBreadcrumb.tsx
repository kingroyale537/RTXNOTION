// components/page/PageBreadcrumb.tsx
// Top navigation bar: sidebar toggle, breadcrumb path, presence avatars, share.

"use client";

import { usePathname } from "next/navigation";
import { PanelLeft, Share2, MoreHorizontal, Star, Link, Lock, ChevronDown, Sparkles } from "lucide-react";
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

export function PageBreadcrumb({ workspaceSlug, workspaceId, pageId }: Props) {
  const { toggleSidebar, sidebarOpen, setSharePageId, toggleAiSidebar, aiSidebarOpen } = useUIStore();
  const { currentPage } = usePageStore();

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/${workspaceSlug}${pageId ? `/${pageId}` : ""}`;
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
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
          {pageId && (
            <PresenceAvatars pageId={pageId} currentPageOnly />
          )}

          {pageId && (
            <>
              {/* Share button */}
              <div className="flex items-center bg-[#2c2c2c] hover:bg-[#333] transition border border-[#3c3c3c] px-2 py-1 rounded text-xs font-semibold text-gray-200 cursor-pointer gap-1"
                   onClick={() => setSharePageId(pageId)}>
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
                    className="h-8 w-8 text-gray-400 hover:bg-[#2c2c2c] hover:text-white"
                    id="favorite-btn"
                    onClick={() => toast.success("Added to favorites")}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add to favorites</TooltipContent>
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

              {/* Options */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:bg-[#2c2c2c] hover:text-white"
                    id="more-options-btn"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>More options</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}
