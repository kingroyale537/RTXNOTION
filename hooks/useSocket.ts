// hooks/useSocket.ts
// Singleton Socket.io client hook.
// Manages connection lifecycle, workspace room subscriptions, and dispatches
// incoming real-time events to the appropriate Zustand store slices.

"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { usePageStore } from "@/store/pageStore";
import { usePresenceStore } from "@/store/presenceStore";
import type { PageTree, PresenceUser } from "@/types";

// ─── Module-level singleton socket ────────────────────────────────────────────
let socketInstance: Socket | null = null;

function getSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io(
      process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001",
      {
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        transports: ["websocket", "polling"],
      }
    );
  }
  return socketInstance;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSocket(workspaceId?: string) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const joinedWorkspaceRef = useRef<string | null>(null);

  // Store actions
  const { addPageToTree, removePageFromTree, updatePageInTree } = usePageStore();
  const { setPagePresence } = usePresenceStore();

  // Connect once when user is authenticated
  useEffect(() => {
    if (!session?.user) return;
    const socket = getSocket();
    socketRef.current = socket;

    if (!socket.connected) {
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("[Socket] Connected:", socket.id);
      // Re-join workspace room after reconnect
      if (joinedWorkspaceRef.current) {
        socket.emit("join-workspace", { workspaceId: joinedWorkspaceRef.current });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] Disconnected:", reason);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [session]);

  // Join workspace room when workspaceId changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !workspaceId) return;
    if (joinedWorkspaceRef.current === workspaceId) return;

    joinedWorkspaceRef.current = workspaceId;
    socket.emit("join-workspace", { workspaceId });

    // ── Workspace-level event handlers ────────────────────────────────────
    const onPageCreated = (data: { workspaceId: string; page: PageTree }) => {
      if (data.workspaceId === workspaceId) {
        addPageToTree(data.page, data.page.parentId);
      }
    };

    const onPageDeleted = (data: { workspaceId: string; pageId: string }) => {
      if (data.workspaceId === workspaceId) {
        removePageFromTree(data.pageId);
      }
    };

    const onPageMetaUpdate = (data: {
      workspaceId: string;
      pageId: string;
      title?: string;
      emoji?: string | null;
    }) => {
      if (data.workspaceId === workspaceId) {
        updatePageInTree(data.pageId, {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.emoji !== undefined && { iconValue: data.emoji }),
        });
      }
    };

    const onPresenceUpdate = (data: {
      pageId: string;
      users: PresenceUser[];
    }) => {
      setPagePresence(data.pageId, data.users);
    };

    socket.on("page-created", onPageCreated);
    socket.on("page-deleted", onPageDeleted);
    socket.on("page-meta-update", onPageMetaUpdate);
    socket.on("presence-update", onPresenceUpdate);

    return () => {
      socket.off("page-created", onPageCreated);
      socket.off("page-deleted", onPageDeleted);
      socket.off("page-meta-update", onPageMetaUpdate);
      socket.off("presence-update", onPresenceUpdate);
    };
  }, [workspaceId, addPageToTree, removePageFromTree, updatePageInTree, setPagePresence]);

  // ── Emitter helpers ─────────────────────────────────────────────────────────
  const emitPageCreated = useCallback(
    (page: PageTree) => {
      socketRef.current?.emit("page-created", { workspaceId, page });
    },
    [workspaceId]
  );

  const emitPageDeleted = useCallback(
    (pageId: string) => {
      socketRef.current?.emit("page-deleted", { workspaceId, pageId });
    },
    [workspaceId]
  );

  const emitPageMetaUpdate = useCallback(
    (pageId: string, patch: { title?: string; emoji?: string | null }) => {
      socketRef.current?.emit("page-meta-update", {
        workspaceId,
        pageId,
        ...patch,
        updatedBy: (session?.user as { id?: string })?.id ?? "",
      });
    },
    [workspaceId, session]
  );

  return {
    socket: socketRef.current,
    emitPageCreated,
    emitPageDeleted,
    emitPageMetaUpdate,
    isConnected: socketRef.current?.connected ?? false,
  };
}
