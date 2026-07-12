// components/sidebar/PageTreeItem.tsx
// A single page node in the sidebar tree with expand, context menu, and hover actions.

"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronRight, Plus, Trash2, FileText, MoreHorizontal,
  Star, Archive, Copy, Link2,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { usePageStore } from "@/store/pageStore";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import { PageSubTree } from "./PageTree";
import type { PageTree } from "@/types";
import toast from "react-hot-toast";

interface Props {
  page: PageTree;
  depth: number;
  workspaceId: string;
  workspaceSlug: string;
}

export function PageTreeItem({ page, depth, workspaceId, workspaceSlug }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [hovering, setHovering] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const { expandedPageIds, toggleExpanded, addPageToTree, removePageFromTree, updatePageInTree } =
    usePageStore();
  const { emitPageCreated, emitPageDeleted } = useSocket(workspaceId);

  const isExpanded = expandedPageIds.has(page.id);
  const hasChildren = (page.children?.length ?? 0) > 0 || (page._count?.children ?? 0) > 0;
  const isActive = pathname === `/${workspaceSlug}/${page.id}`;

  const handleNavigate = () => router.push(`/${workspaceSlug}/${page.id}`);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpanded(page.id);
  };

  const handleAddChild = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/pages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            parentId: page.id,
            title: "Untitled",
            emoji: "📄",
          }),
        });
        if (!res.ok) throw new Error();
        const json = await res.json();
        const newPage = { ...json.data, children: [], _count: { children: 0 } };

        addPageToTree(newPage, page.id);
        emitPageCreated(newPage);
        router.push(`/${workspaceSlug}/${newPage.id}`);
      } catch {
        toast.error("Could not create page");
      }
    },
    [workspaceId, page.id, workspaceSlug, addPageToTree, emitPageCreated, router]
  );

  const handleArchive = useCallback(async () => {
    try {
      await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });
      removePageFromTree(page.id);
      emitPageDeleted(page.id);
      toast.success("Page moved to trash");
      if (isActive) router.push(`/${workspaceSlug}`);
    } catch {
      toast.error("Could not delete page");
    }
  }, [page.id, removePageFromTree, emitPageDeleted, isActive, router, workspaceSlug]);

  const handleFavorite = useCallback(async () => {
    try {
      await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: true }),
      });
      toast.success("Added to favorites");
    } catch {
      toast.error("Failed");
    }
  }, [page.id]);

  const handleCopyLink = useCallback(() => {
    const url = `${window.location.origin}/${workspaceSlug}/${page.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied");
  }, [workspaceSlug, page.id]);

  const indent = depth * 12;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 h-8 rounded-md text-sm cursor-pointer",
          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          "transition-colors duration-100",
          isActive && "bg-sidebar-accent text-sidebar-foreground font-medium"
        )}
        style={{ paddingLeft: `${8 + indent}px`, paddingRight: "4px" }}
        onClick={handleNavigate}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        aria-selected={isActive}
        role="treeitem"
      >
        {/* Expand toggle */}
        <button
          onClick={handleToggleExpand}
          className={cn(
            "flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-sm",
            "hover:bg-sidebar-border transition-colors",
            !hasChildren && "invisible group-hover:visible"
          )}
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          <ChevronRight
            className={cn(
              "h-3.5 w-3.5 text-muted-foreground transition-transform duration-150",
              isExpanded && "rotate-90"
            )}
          />
        </button>

        {/* Icon */}
        <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-base leading-none">
          {page.iconValue && page.iconType === "EMOJI" ? (
            page.iconValue
          ) : (
            <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </span>

        {/* Title */}
        <span className="flex-1 truncate text-[13px]">{page.title || "Untitled"}</span>

        {/* Hover action buttons */}
        {(hovering || menuOpen) && (
          <div className="flex items-center gap-0.5 ml-auto flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleAddChild}
                    className="h-5 w-5 flex items-center justify-center rounded-sm hover:bg-sidebar-border transition-colors"
                    aria-label="Add child page"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Add page inside</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Context menu */}
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className="h-5 w-5 flex items-center justify-center rounded-sm hover:bg-sidebar-border transition-colors"
                  aria-label="Page options"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-52">
                <DropdownMenuItem onClick={handleFavorite} className="gap-2">
                  <Star className="h-4 w-4" /> Add to favorites
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopyLink} className="gap-2">
                  <Link2 className="h-4 w-4" /> Copy link
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleAddChild} className="gap-2">
                  <Plus className="h-4 w-4" /> Add sub-page
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleArchive}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Move to trash
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Nested children */}
      {isExpanded && hasChildren && page.children && (
        <PageSubTree
          pages={page.children}
          depth={depth + 1}
          workspaceId={workspaceId}
          workspaceSlug={workspaceSlug}
        />
      )}
    </div>
  );
}
