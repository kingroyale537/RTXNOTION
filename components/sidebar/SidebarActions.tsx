// components/sidebar/SidebarActions.tsx
// Quick-action row below the workspace header: Search, New Page, etc.

"use client";

import { useRouter } from "next/navigation";
import { Search, PenSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUIStore } from "@/store/uiStore";
import { usePageStore } from "@/store/pageStore";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  workspaceId: string;
  workspaceSlug: string;
}

export function SidebarActions({ workspaceId, workspaceSlug }: Props) {
  const router = useRouter();
  const { setCommandOpen } = useUIStore();
  const { addPageToTree } = usePageStore();
  const { emitPageCreated } = useSocket(workspaceId);

  async function createPage() {
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, title: "Untitled", emoji: "📄" }),
      });

      if (!res.ok) throw new Error("Failed to create page");
      const json = await res.json();
      const page = json.data;

      // Optimistically add to tree and broadcast
      addPageToTree(
        { ...page, children: [], _count: { children: 0 } },
        null
      );
      emitPageCreated({ ...page, children: [], _count: { children: 0 } });

      router.push(`/${workspaceSlug}/${page.id}`);
    } catch {
      toast.error("Could not create page");
    }
  }

  return (
    <TooltipProvider delayDuration={400}>
      <div className="flex items-center gap-1 px-2 py-1.5">
        {/* Search */}
        <button
          onClick={() => setCommandOpen(true)}
          className={cn(
            "flex-1 flex items-center gap-2 px-2 h-8 rounded-md text-sm",
            "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            "transition-colors cursor-pointer"
          )}
          id="sidebar-search"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search</span>
          <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* New page */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              onClick={createPage}
              id="new-page-btn"
            >
              <PenSquare className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">New page</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
