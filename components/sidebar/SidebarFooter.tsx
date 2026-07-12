// components/sidebar/SidebarFooter.tsx
// Bottom user section: avatar, name, settings link.

"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Settings, LogOut, User } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { getInitials } from "@/lib/utils";

interface Props { currentUserId: string }

export function SidebarFooter({ currentUserId: _ }: Props) {
  const { data: session } = useSession();
  const { currentWorkspace } = useWorkspaceStore();
  const router = useRouter();

  const user = session?.user;
  if (!user) return null;

  return (
    <div className="p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-sidebar-accent transition-colors text-sidebar-foreground" id="user-menu">
            <Avatar className="h-7 w-7 flex-shrink-0">
              <AvatarImage src={user.image ?? ""} alt={user.name ?? ""} />
              <AvatarFallback
                className="text-xs font-semibold text-white"
                style={{ backgroundColor: (user as { color?: string }).color ?? "#6366f1" }}
              >
                {getInitials(user.name ?? user.email ?? "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left min-w-0">
              <p className="text-xs font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56 mb-1">
          <DropdownMenuLabel className="font-normal">
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="gap-2" onClick={() => router.push(`/${currentWorkspace?.slug}/settings`)}>
            <Settings className="h-4 w-4" /> Workspace settings
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2">
            <User className="h-4 w-4" /> Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 text-destructive focus:text-destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
