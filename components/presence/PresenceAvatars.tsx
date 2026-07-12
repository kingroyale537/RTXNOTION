// components/presence/PresenceAvatars.tsx
// Shows colored avatar stack of users currently viewing/editing a page.

"use client";

import { usePresenceStore } from "@/store/presenceStore";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  pageId: string;
  currentPageOnly?: boolean;
  maxVisible?: number;
}

export function PresenceAvatars({ pageId, maxVisible = 5 }: Props) {
  const { presence } = usePresenceStore();
  const { data: session } = useSession();
  const currentUserId = (session?.user as { id?: string })?.id;

  const users = (presence[pageId] ?? []).filter((u) => u.userId !== currentUserId);
  if (users.length === 0) return null;

  const visible = users.slice(0, maxVisible);
  const overflow = users.length - maxVisible;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex items-center">
        {visible.map((user, i) => (
          <Tooltip key={user.userId}>
            <TooltipTrigger asChild>
              <div
                className={cn("relative", i > 0 && "-ml-2")}
                style={{ zIndex: visible.length - i }}
              >
                <Avatar
                  className="h-7 w-7 border-2 border-background ring-2 ring-offset-0 cursor-default"
                  style={{ borderColor: user.color }}
                >
                  <AvatarImage src={user.image ?? ""} alt={user.name} />
                  <AvatarFallback
                    className="text-[10px] font-bold text-white"
                    style={{ backgroundColor: user.color }}
                  >
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                {/* Online dot */}
                <span
                  className="absolute bottom-0 right-0 w-2 h-2 rounded-full border border-background animate-pulse-dot"
                  style={{ backgroundColor: user.color }}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p className="font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">Editing now</p>
            </TooltipContent>
          </Tooltip>
        ))}

        {overflow > 0 && (
          <div className="-ml-2 relative" style={{ zIndex: 0 }}>
            <div className="h-7 w-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
              +{overflow}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
