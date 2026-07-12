// components/sidebar/Sidebar.tsx
// Main sidebar: header → workspace switcher, scrollable page tree, footer.

"use client";

import { useUIStore } from "@/store/uiStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarHeader } from "./SidebarHeader";
import { PageTree } from "./PageTree";
import { SidebarFooter } from "./SidebarFooter";
import { SidebarActions } from "./SidebarActions";
import type { WorkspaceWithMembers } from "@/types";
import type { Role } from "@prisma/client";

interface Props {
  workspace: WorkspaceWithMembers;
  currentUserId: string;
  currentUserRole: Role;
}

export function Sidebar({ workspace, currentUserId, currentUserRole }: Props) {
  const { sidebarOpen } = useUIStore();
  if (!sidebarOpen) return null;

  return (
    <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border select-none">
      {/* Workspace header / switcher */}
      <SidebarHeader workspace={workspace} currentUserRole={currentUserRole} />

      <Separator className="bg-sidebar-border" />

      {/* Quick actions row */}
      <SidebarActions workspaceId={workspace.id} workspaceSlug={workspace.slug} />

      <Separator className="bg-sidebar-border" />

      {/* Scrollable page tree */}
      <ScrollArea className="flex-1 px-2 py-2">
        <PageTree workspaceId={workspace.id} workspaceSlug={workspace.slug} />
      </ScrollArea>

      {/* User profile footer */}
      <Separator className="bg-sidebar-border" />
      <SidebarFooter currentUserId={currentUserId} />
    </aside>
  );
}
