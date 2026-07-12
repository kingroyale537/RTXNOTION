// store/pageStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { PageTree, PageWithRelations } from "@/types";

interface PageStore {
  // State
  pageTree: PageTree[];
  currentPage: PageWithRelations | null;
  expandedPageIds: Set<string>;
  isLoadingTree: boolean;
  isLoadingPage: boolean;

  // Tree actions
  setPageTree: (tree: PageTree[]) => void;
  addPageToTree: (page: PageTree, parentId: string | null) => void;
  removePageFromTree: (pageId: string) => void;
  updatePageInTree: (pageId: string, patch: Partial<PageTree>) => void;

  // Current page actions
  setCurrentPage: (page: PageWithRelations | null) => void;
  updateCurrentPageMeta: (patch: Partial<PageWithRelations>) => void;

  // Expanded sidebar nodes
  toggleExpanded: (pageId: string) => void;
  setExpanded: (pageId: string, expanded: boolean) => void;

  // Loading
  setIsLoadingTree: (v: boolean) => void;
  setIsLoadingPage: (v: boolean) => void;
}

// ─── Recursive tree helpers ────────────────────────────────────────────────────
function insertIntoTree(
  tree: PageTree[],
  newPage: PageTree,
  parentId: string | null
): PageTree[] {
  if (!parentId) return [...tree, newPage];
  return tree.map((node) => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children ?? []), newPage] };
    }
    return { ...node, children: insertIntoTree(node.children ?? [], newPage, parentId) };
  });
}

function removeFromTree(tree: PageTree[], pageId: string): PageTree[] {
  return tree
    .filter((n) => n.id !== pageId)
    .map((n) => ({ ...n, children: removeFromTree(n.children ?? [], pageId) }));
}

function updateInTree(
  tree: PageTree[],
  pageId: string,
  patch: Partial<PageTree>
): PageTree[] {
  return tree.map((n) => {
    if (n.id === pageId) return { ...n, ...patch };
    return { ...n, children: updateInTree(n.children ?? [], pageId, patch) };
  });
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const usePageStore = create<PageStore>()(
  devtools((set) => ({
    pageTree: [],
    currentPage: null,
    expandedPageIds: new Set<string>(),
    isLoadingTree: false,
    isLoadingPage: false,

    setPageTree: (pageTree) => set({ pageTree }),

    addPageToTree: (page, parentId) =>
      set((s) => ({
        pageTree: insertIntoTree(s.pageTree, page, parentId),
        expandedPageIds: parentId
          ? new Set([...Array.from(s.expandedPageIds), parentId])
          : s.expandedPageIds,
      })),

    removePageFromTree: (pageId) =>
      set((s) => ({ pageTree: removeFromTree(s.pageTree, pageId) })),

    updatePageInTree: (pageId, patch) =>
      set((s) => ({ pageTree: updateInTree(s.pageTree, pageId, patch) })),

    setCurrentPage: (currentPage) => set({ currentPage }),

    updateCurrentPageMeta: (patch) =>
      set((s) => ({
        currentPage: s.currentPage ? { ...s.currentPage, ...patch } : null,
      })),

    toggleExpanded: (pageId) =>
      set((s) => {
        const next = new Set(s.expandedPageIds);
        if (next.has(pageId)) next.delete(pageId);
        else next.add(pageId);
        return { expandedPageIds: next };
      }),

    setExpanded: (pageId, expanded) =>
      set((s) => {
        const next = new Set(s.expandedPageIds);
        if (expanded) next.add(pageId);
        else next.delete(pageId);
        return { expandedPageIds: next };
      }),

    setIsLoadingTree: (isLoadingTree) => set({ isLoadingTree }),
    setIsLoadingPage: (isLoadingPage) => set({ isLoadingPage }),
  }))
);
