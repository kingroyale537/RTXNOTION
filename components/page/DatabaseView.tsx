// components/page/DatabaseView.tsx
// Renders the database list/table view for a page's children, matching the mockup controls and layout.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Search,
  Sliders,
  ChevronDown,
  Plus,
  FileText,
  Trash2,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageStore } from "@/store/pageStore";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  pageId: string;
  workspaceId: string;
  workspaceSlug: string;
  canEdit: boolean;
}

interface PageTreeItemType {
  id: string;
  title: string;
  emoji: string | null;
  iconValue: string | null;
  updatedAt: Date;
  children?: PageTreeItemType[];
}

export function DatabaseView({ pageId, workspaceId, workspaceSlug, canEdit }: Props) {
  const router = useRouter();
  const { pageTree, addPageToTree, removePageFromTree } = usePageStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Helper to find the current page node in the tree to get its children
  function findNode(tree: any[], targetId: string): any | null {
    for (const node of tree) {
      if (node.id === targetId) return node;
      if (node.children) {
        const found = findNode(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  }

  const currentNode = findNode(pageTree, pageId);
  const children: PageTreeItemType[] = currentNode?.children ?? [];

  // Filter children based on search query
  const filteredChildren = children.filter((child) =>
    child.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create a new child page / note
  async function createNote() {
    if (!canEdit) return;
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          parentId: pageId,
          title: "Untitled Note",
          emoji: "📄",
        }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();
      const newPage = { ...json.data, children: [], _count: { children: 0 } };
      addPageToTree(newPage, pageId);
      router.push(`/${workspaceSlug}/${newPage.id}`);
      toast.success("Created new note");
    } catch {
      toast.error("Could not create note");
    }
  }

  // Delete a note / child page
  async function deleteNote(childId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!canEdit) return;
    try {
      await fetch(`/api/pages/${childId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });
      removePageFromTree(childId);
      toast.success("Note moved to trash");
    } catch {
      toast.error("Could not delete note");
    }
  }

  return (
    <div className="w-full bg-[#191919] min-h-[400px] border border-[#2a2a2a] rounded-xl flex flex-col overflow-hidden text-[#f3f4f6]">
      {/* ── Subheader database controls ───────────────────────────────────── */}
      <div className="h-11 border-b border-[#2a2a2a] px-4 flex items-center justify-between bg-[#191919] flex-shrink-0">
        <div className="flex items-center gap-1.5">
          {showSearch && (
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#222] border border-[#3c3c3c] text-xs px-2 py-1 rounded outline-none w-36 text-white focus:border-[#2563eb]"
            />
          )}
        </div>

        <div className="flex items-center gap-1 text-gray-400">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toast.success("Filter active: All notes")}
            className="h-8 w-8 hover:bg-[#2c2c2c] hover:text-white"
            title="Filter"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toast.success("Sorted by Last Edited")}
            className="h-8 w-8 hover:bg-[#2c2c2c] hover:text-white"
            title="Sort"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toast.success("AI Summarizing this database...")}
            className="h-8 w-8 hover:bg-[#2c2c2c] hover:text-white"
            title="AI Sparkle"
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            className={cn("h-8 w-8 hover:bg-[#2c2c2c] hover:text-white", showSearch && "bg-[#2c2c2c]")}
            title="Search database"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toast.success("Database settings")}
            className="h-8 w-8 hover:bg-[#2c2c2c] hover:text-white"
            title="View options"
          >
            <Sliders className="h-4 w-4" />
          </Button>

          {/* New note button */}
          <div className="flex items-center ml-2 bg-[#2563eb] hover:bg-[#2563eb]/95 transition rounded-lg overflow-hidden shadow-sm shadow-[#2563eb]/20">
            <button
              onClick={createNote}
              className="px-3.5 py-1.5 text-xs font-bold text-white flex items-center gap-1"
            >
              <span>New note</span>
            </button>
            <div className="w-[1px] h-5 bg-white/20" />
            <button
              onClick={() => toast.success("Open templates menu")}
              className="px-2 py-1.5 text-xs text-white"
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── + Add Property Header ────────────────────────────────────────── */}
      <div className="h-10 bg-[#1e1e1e]/40 border-b border-[#2a2a2a] px-6 flex items-center justify-between text-xs text-gray-500 font-bold select-none">
        <div className="flex-1 min-w-[200px] flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5" />
          <span>Name</span>
        </div>
        <button
          onClick={() => toast.success("Add custom properties (Date, Select, Text, checkbox)")}
          className="flex items-center gap-1 hover:text-gray-300 transition text-[11px] font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add property</span>
        </button>
      </div>

      {/* ── Table Rows ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {filteredChildren.length > 0 ? (
          <div className="divide-y divide-[#2a2a2a]">
            {filteredChildren.map((child) => (
              <div
                key={child.id}
                onClick={() => router.push(`/${workspaceSlug}/${child.id}`)}
                className="group h-12 px-6 flex items-center justify-between hover:bg-[#222]/50 transition duration-150 cursor-pointer"
              >
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="text-base flex-shrink-0">
                    {child.iconValue ?? "📄"}
                  </span>
                  <span className="text-xs font-semibold text-gray-200 group-hover:text-white truncate">
                    {child.title || "Untitled note"}
                  </span>
                </div>

                <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(child.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => deleteNote(child.id, e)}
                    className="p-1 rounded hover:bg-[#333] text-gray-400 hover:text-red-400 transition"
                    title="Move to trash"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-500">
            <FileText className="h-8 w-8 text-gray-600" />
            <div className="text-center">
              <p className="text-xs font-semibold text-gray-400">No notes in this view</p>
              <p className="text-[10px] text-gray-600">Click New note to add one</p>
            </div>
            <Button
              onClick={createNote}
              variant="outline"
              size="sm"
              className="h-8 border-[#3c3c3c] hover:bg-[#2c2c2c] text-xs font-semibold"
            >
              <Plus className="h-3 w-3" /> Create note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
