// components/sidebar/SidebarHeader.tsx
// Workspace name + switcher dropdown.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronsUpDown, Check, Plus, Settings, LogOut
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { cn, getInitials } from "@/lib/utils";
import type { WorkspaceWithMembers } from "@/types";
import type { Role } from "@prisma/client";
import { signOut } from "next-auth/react";

interface Props {
  workspace: WorkspaceWithMembers;
  currentUserRole: Role;
}

export function SidebarHeader({ workspace, currentUserRole }: Props) {
  const router = useRouter();
  const { workspaces } = useWorkspaceStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="px-2 py-3 h-14 flex items-center">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-9 px-2 hover:bg-sidebar-accent text-sidebar-foreground font-medium"
            id="workspace-switcher"
          >
            <div className="flex items-center gap-2 min-w-0">
              {/* Workspace avatar */}
              <span className="flex-shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center text-sm">
                {workspace.logo ?? getInitials(workspace.name)}
              </span>
              <span className="truncate text-sm font-semibold">{workspace.name}</span>
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64"
          side="bottom"
          align="start"
          sideOffset={4}
        >
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Workspaces
          </DropdownMenuLabel>

          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => router.push(`/${ws.slug}`)}
              className="gap-2"
            >
              <span className="w-5 h-5 rounded flex items-center justify-center bg-primary/10 text-xs flex-shrink-0">
                {ws.logo ?? getInitials(ws.name)}
              </span>
              <span className="truncate flex-1">{ws.name}</span>
              {ws.id === workspace.id && <Check className="h-3.5 w-3.5 text-primary" />}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => router.push("/dashboard?create=workspace")}
            className="gap-2 text-primary"
          >
            <Plus className="h-4 w-4" />
            Create workspace
          </DropdownMenuItem>

          {currentUserRole === "ADMIN" && (
            <DropdownMenuItem
              onClick={() => router.push(`/${workspace.slug}/settings`)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              Settings
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={cn("gap-2 text-destructive focus:text-destructive")}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
