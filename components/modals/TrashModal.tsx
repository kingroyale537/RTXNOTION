// components/modals/TrashModal.tsx
// Minimalist Notion-style overlay to search, restore, or permanently delete archived pages.

"use client";

import { useEffect, useState } from "react";
import { Search, RotateCcw, Trash2, FileText, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useUIStore } from "@/store/uiStore";
import { usePageStore } from "@/store/pageStore";
import toast from "react-hot-toast";

interface Props {
  workspaceId: string;
}

interface ArchivedPage {
  id: string;
  title: string;
  iconValue: string | null;
  iconType: string | null;
  updatedAt: string;
}

export function TrashModal({ workspaceId }: Props) {
  const { trashOpen, setTrashOpen } = useUIStore();
  const { addPageToTree, removePageFromTree } = usePageStore();

  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<ArchivedPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch trash items on open
  useEffect(() => {
    if (!trashOpen) return;

    async function fetchTrash() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/workspaces/${workspaceId}/trash`);
        if (!res.ok) throw new Error();
        const json = await res.json();
        setPages(json.data || []);
      } catch {
        toast.error("Failed to load trash list");
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrash();
  }, [trashOpen, workspaceId]);

  // Restore page handler
  async function handleRestore(page: ArchivedPage) {
    toast.loading("Restoring page...", { id: `restore-${page.id}` });
    try {
      const res = await fetch(`/api/pages/${page.id}/trash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();

      // Update state
      setPages((prev) => prev.filter((p) => p.id !== page.id));

      // Append back to the global pageTree store
      const restoredNode = {
        ...json.data,
        children: [],
        _count: { children: 0 },
      };
      addPageToTree(restoredNode, json.data.parentId);

      toast.success(`"${page.title || "Untitled"}" restored!`, { id: `restore-${page.id}` });
    } catch {
      toast.error("Failed to restore page", { id: `restore-${page.id}` });
    }
  }

  // Permanent delete handler
  async function handleDelete(page: ArchivedPage) {
    if (!confirm(`Are you sure you want to permanently delete "${page.title || "Untitled"}"? This cannot be undone.`)) {
      return;
    }
    toast.loading("Deleting permanently...", { id: `delete-${page.id}` });
    try {
      const res = await fetch(`/api/pages/${page.id}/trash`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();

      // Update state
      setPages((prev) => prev.filter((p) => p.id !== page.id));
      removePageFromTree(page.id);

      toast.success("Page deleted permanently.", { id: `delete-${page.id}` });
    } catch {
      toast.error("Failed to delete page", { id: `delete-${page.id}` });
    }
  }

  const filteredPages = pages.filter((p) =>
    (p.title || "Untitled").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Dialog open={trashOpen} onOpenChange={setTrashOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#1c1c1c] border border-[#2a2a2a] text-[#f3f4f6]">
        <div className="p-3 border-b border-[#2a2a2a] flex items-center gap-2 bg-[#191919]">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search archived pages in trash..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm border-none outline-none placeholder-gray-500 text-white"
            autoFocus
          />
        </div>
        <DialogTitle className="sr-only">Trash Manager</DialogTitle>

        <div className="max-h-[350px] min-h-[200px] overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-500 gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-xs">Loading trash...</span>
            </div>
          ) : filteredPages.length > 0 ? (
            filteredPages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#2c2c2c]/40 group transition"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm flex-shrink-0">
                    {page.iconValue && page.iconType === "EMOJI" ? page.iconValue : "📄"}
                  </span>
                  <span className="text-xs font-semibold text-gray-200 truncate max-w-[240px]">
                    {page.title || "Untitled"}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleRestore(page)}
                    className="p-1.5 rounded hover:bg-[#3c3c3c] text-gray-400 hover:text-green-400 transition"
                    title="Restore Page"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(page)}
                    className="p-1.5 rounded hover:bg-[#3c3c3c] text-gray-400 hover:text-red-400 transition"
                    title="Delete Permanently"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-500">
              <FileText className="h-6 w-6 text-gray-600" />
              <span className="text-xs font-semibold">No pages in trash</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
