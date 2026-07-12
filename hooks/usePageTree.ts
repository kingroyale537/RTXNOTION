// hooks/usePageTree.ts
// Fetches and manages the workspace page tree, wiring API + WebSocket updates.

"use client";

import { useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { usePageStore } from "@/store/pageStore";
import type { PageTree } from "@/types";

export function usePageTree(workspaceId: string | undefined) {
  const { data: session } = useSession();
  const { setPageTree, setIsLoadingTree } = usePageStore();

  const fetchTree = useCallback(async () => {
    if (!workspaceId || !session) return;
    setIsLoadingTree(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/pages`);
      if (!res.ok) throw new Error("Failed to fetch page tree");
      const json = await res.json();
      setPageTree(json.data as PageTree[]);
    } catch (err) {
      console.error("[usePageTree]", err);
    } finally {
      setIsLoadingTree(false);
    }
  }, [workspaceId, session, setPageTree, setIsLoadingTree]);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  return { refetch: fetchTree };
}
