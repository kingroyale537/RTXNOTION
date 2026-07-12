// components/workspace/WorkspaceShell.tsx
// Client shell: syncs workspace to store, renders sidebar + resizable content.

"use client";

import { useEffect } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore } from "@/store/uiStore";
import { useSocket } from "@/hooks/useSocket";
import { usePageTree } from "@/hooks/usePageTree";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { CommandPalette } from "@/components/modals/CommandPalette";
import type { WorkspaceWithMembers } from "@/types";
import type { Role } from "@prisma/client";

interface Props {
  workspace: WorkspaceWithMembers;
  currentUserId: string;
  currentUserRole: Role;
  children: React.ReactNode;
}

export function WorkspaceShell({ workspace, currentUserId, currentUserRole, children }: Props) {
  const { setCurrentWorkspace } = useWorkspaceStore();
  const { sidebarOpen } = useUIStore();

  // Sync workspace into Zustand store
  useEffect(() => {
    setCurrentWorkspace(workspace);
  }, [workspace, setCurrentWorkspace]);

  // Connect to Socket.io workspace room
  useSocket(workspace.id);

  // Fetch and sync page tree
  usePageTree(workspace.id);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <PanelGroup direction="horizontal" className="h-full">
        {/* ── Sidebar panel ─────────────────────────────────────────────── */}
        {sidebarOpen && (
          <>
            <Panel
              defaultSize={18}
              minSize={12}
              maxSize={30}
              className="hidden md:block"
              id="sidebar-panel"
              order={1}
            >
              <Sidebar
                workspace={workspace}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            </Panel>
            <PanelResizeHandle
              className="w-1 bg-transparent hover:bg-primary/20 transition-colors"
            />
          </>
        )}

        {/* ── Main content panel ─────────────────────────────────────────── */}
        <Panel defaultSize={sidebarOpen ? 82 : 100} order={2} id="content-panel">
          <main className="h-full overflow-auto flex flex-col">
            {children}
          </main>
        </Panel>
      </PanelGroup>

      {/* Global overlays */}
      <CommandPalette workspaceId={workspace.id} workspaceSlug={workspace.slug} />
    </div>
  );
}
