// components/sidebar/Sidebar.tsx
// Main sidebar: header → workspace switcher, scrollable page tree, footer.

"use client";

import Link from "next/link";
import { Home as HomeIcon, Sparkles } from "lucide-react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  if (!sidebarOpen) return null;

  const homePath = `/${workspace.slug}`;
  const aiPath = `/${workspace.slug}/ai`;

  return (
    <aside className="flex flex-col h-full bg-sidebar border-r border-sidebar-border select-none">
      {/* Workspace header / switcher */}
      <SidebarHeader workspace={workspace} currentUserRole={currentUserRole} />

      <Separator className="bg-sidebar-border" />

      {/* Quick actions row */}
      <SidebarActions workspaceId={workspace.id} workspaceSlug={workspace.slug} />

      <Separator className="bg-sidebar-border" />

      {/* Static navigation links */}
      <div className="px-2 py-2 space-y-0.5">
        <Link
          href={homePath}
          className={`flex items-center gap-2.5 px-2.5 h-8 rounded-md text-xs font-semibold transition-colors ${
            pathname === homePath
              ? "bg-sidebar-accent text-sidebar-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          }`}
        >
          <HomeIcon className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <Link
          href={aiPath}
          className={`flex items-center gap-2.5 px-2.5 h-8 rounded-md text-xs font-semibold transition-colors ${
            pathname === aiPath
              ? "bg-sidebar-accent text-sidebar-foreground"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>Notion AI</span>
        </Link>
      </div>

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
