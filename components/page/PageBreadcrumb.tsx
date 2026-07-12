// components/page/PageBreadcrumb.tsx
// Top navigation bar: sidebar toggle, breadcrumb path, presence avatars, share.

"use client";

import { usePathname } from "next/navigation";
import { PanelLeft, Share2, MoreHorizontal, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PresenceAvatars } from "@/components/presence/PresenceAvatars";
import { useUIStore } from "@/store/uiStore";
import { usePageStore } from "@/store/pageStore";
import { cn } from "@/lib/utils";

interface Props {
  workspaceSlug: string;
  workspaceId: string;
  pageId?: string;
}

export function PageBreadcrumb({ workspaceSlug, workspaceId, pageId }: Props) {
  const { toggleSidebar, sidebarOpen, setSharePageId } = useUIStore();
  const { currentPage } = usePageStore();

  return (
    <TooltipProvider delayDuration={400}>
      <header className="flex items-center h-12 px-4 border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0 gap-2">
        {/* Sidebar toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={toggleSidebar}
              id="toggle-sidebar"
            >
              <PanelLeft className={cn("h-4 w-4 transition-transform", !sidebarOpen && "rotate-180")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{sidebarOpen ? "Close sidebar" : "Open sidebar"}</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-5" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 text-sm text-muted-foreground">
          <span className="hover:text-foreground transition-colors truncate">
            {workspaceSlug}
          </span>
          {currentPage && (
            <>
              <span>/</span>
              <span className="flex items-center gap-1.5 text-foreground font-medium truncate">
                {currentPage.iconValue && (
                  <span className="text-base leading-none">{currentPage.iconValue}</span>
                )}
                {currentPage.title || "Untitled"}
              </span>
            </>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Live presence avatars */}
          {pageId && (
            <PresenceAvatars pageId={pageId} currentPageOnly />
          )}

          {pageId && (
            <>
              <Separator orientation="vertical" className="h-5" />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    id="version-history-btn"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Version history</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    id="favorite-btn"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Add to favorites</TooltipContent>
              </Tooltip>

              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs font-medium shadow-sm shadow-primary/20"
                onClick={() => setSharePageId(pageId)}
                id="share-btn"
              >
                <Share2 className="h-3.5 w-3.5" />
                Share
              </Button>
            </>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}
