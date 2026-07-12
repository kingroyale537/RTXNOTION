// hooks/usePresence.ts
// Manages joining/leaving a page room and syncing live presence.

"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { usePresenceStore } from "@/store/presenceStore";
import type { PresenceUser } from "@/types";

interface UsePresenceOptions {
  pageId: string | undefined;
  socket: import("socket.io-client").Socket | null;
}

export function usePresence({ pageId, socket }: UsePresenceOptions) {
  const { data: session } = useSession();
  const { setPagePresence, clearPagePresence, updateCursor } = usePresenceStore();
  const joinedPageRef = useRef<string | null>(null);

  const user = session?.user as
    | { id: string; name?: string | null; image?: string | null; color: string }
    | undefined;

  // Join / leave page room
  useEffect(() => {
    if (!socket || !pageId || !user) return;
    if (joinedPageRef.current === pageId) return;

    // Leave previous page
    if (joinedPageRef.current) {
      socket.emit("leave-page", {
        pageId: joinedPageRef.current,
        userId: user.id,
      });
    }

    joinedPageRef.current = pageId;

    // Join new page
    socket.emit("join-page", {
      pageId,
      userId: user.id,
      name: user.name ?? "Anonymous",
      color: user.color ?? "#6366f1",
      image: user.image ?? null,
    });

    // ── Incoming presence events ────────────────────────────────────────
    const onPresenceUpdate = (data: { pageId: string; users: PresenceUser[] }) => {
      if (data.pageId === pageId) setPagePresence(pageId, data.users);
    };

    const onCursorUpdate = (data: {
      pageId: string;
      userId: string;
      cursor: { anchor: number; head: number } | null;
    }) => {
      if (data.pageId === pageId) {
        updateCursor(pageId, data.userId, data.cursor);
      }
    };

    socket.on("presence-update", onPresenceUpdate);
    socket.on("cursor-update", onCursorUpdate);

    return () => {
      socket.off("presence-update", onPresenceUpdate);
      socket.off("cursor-update", onCursorUpdate);

      // Leave on cleanup
      if (joinedPageRef.current) {
        socket.emit("leave-page", {
          pageId: joinedPageRef.current,
          userId: user.id,
        });
        clearPagePresence(joinedPageRef.current);
        joinedPageRef.current = null;
      }
    };
  }, [socket, pageId, user, setPagePresence, clearPagePresence, updateCursor]);

  // Emit cursor position update
  const emitCursor = (cursor: { anchor: number; head: number } | null) => {
    if (!socket || !pageId || !user) return;
    socket.emit("cursor-update", { pageId, userId: user.id, cursor });
  };

  return { emitCursor };
}
