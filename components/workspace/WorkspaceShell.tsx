// components/workspace/WorkspaceShell.tsx
// Client shell: syncs workspace to store, renders sidebar + resizable content.

"use client";

import { useEffect, useState } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUIStore } from "@/store/uiStore";
import { useSocket } from "@/hooks/useSocket";
import { usePageTree } from "@/hooks/usePageTree";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { AiSidebar } from "@/components/workspace/AiSidebar";
import { CommandPalette } from "@/components/modals/CommandPalette";
import { ShareModal } from "@/components/modals/ShareModal";
import type { WorkspaceWithMembers } from "@/types";
import type { Role } from "@prisma/client";
import { cn } from "@/lib/utils";

import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { ExecutiveBriefing } from "@/components/dashboard/ExecutiveBriefing";
import { KeynoteView } from "@/components/editor/KeynoteView";

interface Props {
  workspace: WorkspaceWithMembers;
  currentUserId: string;
  currentUserRole: Role;
  children: React.ReactNode;
}

export function WorkspaceShell({ workspace, currentUserId, currentUserRole, children }: Props) {
  const { setCurrentWorkspace } = useWorkspaceStore();
  const { sidebarOpen, aiSidebarOpen, setCommandOpen } = useUIStore();

  const [briefingOpen, setBriefingOpen] = useState(false);
  const [keynoteOpen, setKeynoteOpen] = useState(false);

  // Sync workspace into Zustand store
  useEffect(() => {
    setCurrentWorkspace(workspace);
  }, [workspace, setCurrentWorkspace]);

  // Connect to Socket.io workspace room
  useSocket(workspace.id);

  // Fetch and sync page tree
  usePageTree(workspace.id);

  // Calculate dynamic default sizes
  let mainSize = 100;
  if (sidebarOpen) mainSize -= 18;
  if (aiSidebarOpen) mainSize -= 25;

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
        <Panel defaultSize={mainSize} order={2} id="content-panel">
          <main className="h-full overflow-auto flex flex-col bg-[#191919] text-[#f3f4f6]">
            {children}
          </main>
        </Panel>

        {/* ── AI Sidebar panel ───────────────────────────────────────────── */}
        {aiSidebarOpen && (
          <>
            <PanelResizeHandle
              className="w-1 bg-transparent hover:bg-primary/20 transition-colors"
            />
            <Panel
              defaultSize={25}
              minSize={20}
              maxSize={40}
              id="ai-sidebar-panel"
              order={3}
            >
              <AiSidebar />
            </Panel>
          </>
        )}
      </PanelGroup>

      {/* Persistent Mobile iOS Bottom Navigation */}
      <MobileBottomNav 
        onOpenSearch={() => setCommandOpen(true)}
        onOpenBriefing={() => setBriefingOpen(true)}
        onOpenKeynote={() => setKeynoteOpen(true)}
      />

      {/* Steve Jobs Edition Modals */}
      <ExecutiveBriefing 
        isOpen={briefingOpen} 
        onClose={() => setBriefingOpen(false)} 
      />

      <KeynoteView 
        isOpen={keynoteOpen} 
        onClose={() => setKeynoteOpen(false)} 
      />

      {/* Global overlays */}
      <CommandPalette workspaceId={workspace.id} workspaceSlug={workspace.slug} />
      <ShareModal workspaceSlug={workspace.slug} />
    </div>
  );
}
