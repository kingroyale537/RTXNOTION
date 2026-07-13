// components/sidebar/PageTree.tsx
// Renders the recursive page tree in the sidebar.

"use client";

import { usePageStore } from "@/store/pageStore";
import { PageTreeItem } from "./PageTreeItem";
import type { PageTree as PageTreeType } from "@/types";
import { FileText } from "lucide-react";

interface Props {
  workspaceId: string;
  workspaceSlug: string;
  pages?: PageTreeType[];
}

export function PageTree({ workspaceId, workspaceSlug, pages }: Props) {
  const { pageTree: storeTree, isLoadingTree } = usePageStore();
  const activeTree = pages ?? storeTree;

  if (isLoadingTree && !pages) {
    return (
      <div className="space-y-1 px-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-8 rounded-md bg-sidebar-accent animate-pulse"
            style={{ opacity: 1 - i * 0.15 }}
          />
        ))}
      </div>
    );
  }

  if (activeTree.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Page navigation" className="space-y-0.5">
      {activeTree.map((page) => (
        <PageTreeItem
          key={page.id}
          page={page}
          depth={0}
          workspaceId={workspaceId}
          workspaceSlug={workspaceSlug}
        />
      ))}
    </nav>
  );
}

// ─── Recursive sub-tree ────────────────────────────────────────────────────────
export function PageSubTree({
  pages,
  depth,
  workspaceId,
  workspaceSlug,
}: {
  pages: PageTreeType[];
  depth: number;
  workspaceId: string;
  workspaceSlug: string;
}) {
  if (!pages.length) return null;
  return (
    <div className="mt-0.5 space-y-0.5">
      {pages.map((page) => (
        <PageTreeItem
          key={page.id}
          page={page}
          depth={depth}
          workspaceId={workspaceId}
          workspaceSlug={workspaceSlug}
        />
      ))}
    </div>
  );
}
