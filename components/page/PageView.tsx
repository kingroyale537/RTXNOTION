// components/page/PageView.tsx
// Client component: PageHeader + TipTap Editor + presence tracking.

"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { usePageStore } from "@/store/pageStore";
import { useSocket } from "@/hooks/useSocket";
import { usePresence } from "@/hooks/usePresence";
import { PageHeader } from "@/components/page/PageHeader";
import { PageBreadcrumb } from "@/components/page/PageBreadcrumb";
import { DatabaseView } from "@/components/page/DatabaseView";
import { VersionHistorySidebar } from "@/components/page/VersionHistorySidebar";
import { useUIStore } from "@/store/uiStore";
import { cn } from "@/lib/utils";
import type { PageWithRelations } from "@/types";
import { MeetingNotesModal } from "@/components/modals/MeetingNotesModal";
import { MeetingPillBanner } from "@/components/desktop/MeetingPillBanner";

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

export function PageView({ page, workspaceId, workspaceSlug, currentUserId, canEdit }: Props) {
  const { setCurrentPage } = usePageStore();
  const { socket } = useSocket(workspaceId);
  const { historyOpen, setHistoryOpen } = useUIStore();
  
  // Choose default view based on page properties
  const isDefaultDatabase = page.title === "Notes" || page.title === "Team HQ" || (page._count?.children ?? 0) > 0;
  const [viewMode, setViewMode] = useState<"editor" | "database">(isDefaultDatabase ? "database" : "editor");

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

      <div className="flex-1 flex overflow-hidden">
        {/* Scrollable page content */}
        <div className="flex-1 overflow-auto bg-[#191919] text-[#f3f4f6]">
          <div className="min-h-full pb-16">
            {/* Cover image + emoji icon + editable title */}
            <PageHeader
              page={page}
              workspaceId={workspaceId}
              workspaceSlug={workspaceSlug}
              readOnly={!canEdit}
            />

            {/* View Mode Tabs */}
            <div className="max-w-4xl mx-auto px-8 md:px-16 mb-6 flex items-center gap-1.5 border-b border-[#2a2a2a]/60 pb-2.5">
              <button
                onClick={() => setViewMode("editor")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  viewMode === "editor"
                    ? "bg-[#2c2c2c] text-white border border-[#3c3c3c]"
                    : "text-gray-400 hover:bg-[#2c2c2c]/40 hover:text-white"
                )}
              >
                📝 Page Editor
              </button>
              <button
                onClick={() => setViewMode("database")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                  viewMode === "database"
                    ? "bg-[#2c2c2c] text-white border border-[#3c3c3c]"
                    : "text-gray-400 hover:bg-[#2c2c2c]/40 hover:text-white"
                )}
              >
                📊 Database View ({page._count?.children ?? 0})
              </button>
            </div>

            {/* View rendering */}
            <div className="max-w-4xl mx-auto px-8 md:px-16">
              {viewMode === "editor" ? (
                <Editor
                  pageId={page.id}
                  workspaceId={workspaceId}
                  initialContent={page.content as object | null}
                  canEdit={canEdit}
                  socket={socket}
                />
              ) : (
                <DatabaseView
                  pageId={page.id}
                  workspaceId={workspaceId}
                  workspaceSlug={workspaceSlug}
                  canEdit={canEdit}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sliding page history sidebar */}
        <VersionHistorySidebar
          pageId={page.id}
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
        />

        {/* Floating Meeting Pill Popup Widget */}
        <MeetingPillBanner />

        {/* AI Meeting Notes Modal */}
        <MeetingNotesModal
          onInsertContent={(markdown) => {
            if (typeof window !== "undefined" && (window as any).__tiptapView) {
              const view = (window as any).__tiptapView;
              const { tr } = view.state;
              view.dispatch(tr.insertText("\n\n" + markdown));
            }
          }}
        />
      </div>
    </div>
  );
}
