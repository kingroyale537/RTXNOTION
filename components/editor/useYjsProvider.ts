// components/editor/useYjsProvider.ts
// Manages the Y.Doc + Socket.io Yjs provider for one page.
// Handles connect, binary sync, and awareness (presence/cursors).

"use client";

import { useEffect, useRef, useState } from "react";
import * as Y from "yjs";
import { Awareness, encodeAwarenessUpdate, applyAwarenessUpdate } from "y-protocols/awareness";
import { toUint8Array, fromUint8Array } from "js-base64";
import type { Socket } from "socket.io-client";

export interface YjsProviderState {
  ydoc: Y.Doc | null;
  awareness: Awareness | null;
  isSynced: boolean;
}

interface UseYjsProviderOptions {
  pageId: string;
  socket: Socket | null;
  user: { id: string; name: string; color: string; image?: string | null };
}

export function useYjsProvider({ pageId, socket, user }: UseYjsProviderOptions): YjsProviderState {
  const ydocRef = useRef<Y.Doc | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    if (!socket || !pageId) return;

    // Create a new Y.Doc for this page
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const awareness = new Awareness(ydoc);
    awarenessRef.current = awareness;

    // Set local user state in awareness
    awareness.setLocalState({
      user: { id: user.id, name: user.name, color: user.color },
      cursor: null,
      isTyping: false,
    });

    // ── Yjs update → send to server ────────────────────────────────────────
    function onYjsUpdate(update: Uint8Array) {
      socket!.emit("yjs-update", {
        pageId,
        update: fromUint8Array(update),
      });
    }
    ydoc.on("update", onYjsUpdate);

    // ── Server → apply Yjs update ──────────────────────────────────────────
    function onServerUpdate(data: { pageId: string; update: string }) {
      if (data.pageId !== pageId) return;
      try {
        const update = toUint8Array(data.update);
        Y.applyUpdate(ydoc, update);
      } catch (e) {
        console.error("[Yjs] Failed to apply update", e);
      }
    }
    socket.on("yjs-update", onServerUpdate);

    // ── Server sends full state on join ────────────────────────────────────
    function onYjsState(data: { pageId: string; state: string }) {
      if (data.pageId !== pageId) return;
      try {
        const state = toUint8Array(data.state);
        Y.applyUpdate(ydoc, state);
      } catch (e) {
        console.error("[Yjs] Failed to apply initial state", e);
      }
      setIsSynced(true);
    }
    socket.on("yjs-state", onYjsState);

    // ── Awareness update → broadcast ───────────────────────────────────────
    function onAwarenessUpdate({
      added,
      updated,
      removed,
    }: {
      added: number[];
      updated: number[];
      removed: number[];
    }) {
      const changedClients = [...added, ...updated, ...removed];
      const update = encodeAwarenessUpdate(awareness, changedClients);
      socket!.emit("awareness-update", {
        pageId,
        update: fromUint8Array(update),
      });
    }
    awareness.on("update", onAwarenessUpdate);

    // ── Server awareness → apply ───────────────────────────────────────────
    function onAwarenessState(data: { pageId: string; update: string }) {
      if (data.pageId !== pageId) return;
      try {
        const update = toUint8Array(data.update);
        applyAwarenessUpdate(awareness, update, "server");
      } catch (e) {
        console.error("[Awareness] Failed to apply update", e);
      }
    }
    socket.on("awareness-update", onAwarenessState);

    // ── Request current state from server ──────────────────────────────────
    socket.emit("yjs-join", { pageId });

    // Fallback: mark synced after 2s even if no state received
    const fallbackTimer = setTimeout(() => setIsSynced(true), 2000);

    return () => {
      clearTimeout(fallbackTimer);
      ydoc.off("update", onYjsUpdate);
      awareness.off("update", onAwarenessUpdate);
      socket.off("yjs-update", onServerUpdate);
      socket.off("yjs-state", onYjsState);
      socket.off("awareness-update", onAwarenessState);

      // Remove local awareness state
      awareness.destroy();
      ydoc.destroy();

      ydocRef.current = null;
      awarenessRef.current = null;
      setIsSynced(false);
    };
  }, [pageId, socket, user.id, user.name, user.color]);

  return {
    ydoc: ydocRef.current,
    awareness: awarenessRef.current,
    isSynced,
  };
}
