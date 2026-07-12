// components/page/PageView.tsx
// Client component: PageHeader + TipTap Editor + presence tracking.

"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { usePageStore } from "@/store/pageStore";
import { useSocket } from "@/hooks/useSocket";
import { usePresence } from "@/hooks/usePresence";
import { PageHeader } from "@/components/page/PageHeader";
import { PageBreadcrumb } from "@/components/page/PageBreadcrumb";
import type { PageWithRelations } from "@/types";

// Lazy-load the editor to avoid SSR issues with ProseMirror / Yjs
const Editor = dynamic(
  () => import("@/components/editor/Editor").then((m) => m.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="px-8 md:px-16 py-8">
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-muted"
              style={{ width: `${90 - i * 10}%`, opacity: 1 - i * 0.12 }}
            />
          ))}
        </div>
      </div>
    ),
  }
);

interface Props {
  page: PageWithRelations;
  workspaceId: string;
  workspaceSlug: string;
  currentUserId: string;
  canEdit: boolean;
}

export function PageView({ page, workspaceId, workspaceSlug, canEdit }: Props) {
  const { setCurrentPage } = usePageStore();
  const { socket } = useSocket(workspaceId);

  // Sync current page to Zustand
  useEffect(() => {
    setCurrentPage(page);
    return () => setCurrentPage(null);
  }, [page, setCurrentPage]);

  // Join presence for this page
  usePresence({ pageId: page.id, socket });

  return (
    <div className="flex flex-col h-full">
      {/* Sticky top navigation bar */}
      <PageBreadcrumb
        workspaceId={workspaceId}
        workspaceSlug={workspaceSlug}
        pageId={page.id}
      />

      {/* Scrollable page content */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full">
          {/* Cover image + emoji icon + editable title */}
          <PageHeader
            page={page}
            workspaceId={workspaceId}
            workspaceSlug={workspaceSlug}
            readOnly={!canEdit}
          />

          {/* TipTap block editor — SSR-safe lazy load */}
          <div className="max-w-4xl mx-auto">
            <Editor
              pageId={page.id}
              workspaceId={workspaceId}
              initialContent={page.content as object | null}
              canEdit={canEdit}
              socket={socket}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
