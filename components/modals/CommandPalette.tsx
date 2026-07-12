// components/modals/CommandPalette.tsx
// Ctrl+K global command palette for searching pages and quick actions.

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Plus, Settings, Loader2 } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useUIStore } from "@/store/uiStore";
import { usePageStore } from "@/store/pageStore";
import { cn } from "@/lib/utils";

interface Props {
  workspaceId: string;
  workspaceSlug: string;
}

interface SearchResult {
  id: string;
  title: string;
  iconValue: string | null;
  parentId: string | null;
}

// Flatten page tree for searching
function flattenTree(pages: SearchResult[]): SearchResult[] {
  const flat: SearchResult[] = [];
  function walk(nodes: SearchResult[]) {
    for (const node of nodes) {
      flat.push(node);
      // @ts-expect-error – children exist on PageTree
      if (node.children?.length) walk(node.children);
    }
  }
  walk(pages);
  return flat;
}

export function CommandPalette({ workspaceId, workspaceSlug }: Props) {
  const router = useRouter();
  const { commandOpen, setCommandOpen } = useUIStore();
  const { pageTree } = usePageStore();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  // Keyboard shortcut
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [setCommandOpen]);

  // Reset on open
  useEffect(() => {
    if (commandOpen) { setQuery(""); setActiveIndex(0); }
  }, [commandOpen]);

  const allPages = flattenTree(pageTree as SearchResult[]);
  const filtered = query.trim()
    ? allPages.filter((p) =>
        (p.title || "Untitled").toLowerCase().includes(query.toLowerCase())
      )
    : allPages.slice(0, 8);

  const results = [
    ...filtered.map((p) => ({
      type: "page" as const,
      id: p.id,
      title: p.title || "Untitled",
      icon: p.iconValue || "📄",
      action: () => { router.push(`/${workspaceSlug}/${p.id}`); setCommandOpen(false); },
    })),
    ...(query.trim()
      ? [{
          type: "action" as const,
          id: "create",
          title: `Create "${query}"`,
          icon: "➕",
          action: async () => {
            setIsCreating(true);
            try {
              const res = await fetch(`/api/workspaces/${workspaceId}/pages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workspaceId, title: query }),
              });
              const json = await res.json();
              router.push(`/${workspaceSlug}/${json.data.id}`);
              setCommandOpen(false);
            } finally { setIsCreating(false); }
          },
        }]
      : []),
  ];

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter") { e.preventDefault(); results[activeIndex]?.action(); }
      if (e.key === "Escape") { setCommandOpen(false); }
    },
    [results, activeIndex, setCommandOpen]
  );

  useEffect(() => { setActiveIndex(0); }, [query]);

  return (
    <Dialog open={commandOpen} onOpenChange={setCommandOpen}>
      <DialogContent className="p-0 gap-0 max-w-xl overflow-hidden rounded-2xl border-border/50 shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 border-b border-border/50">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search pages or type to create…"
            className="flex-1 h-14 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
            id="command-input"
          />
          {isCreating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          <kbd className="hidden sm:inline-flex h-5 items-center rounded border bg-muted px-1.5 text-[10px] font-mono text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No pages found
            </div>
          )}
          {results.map((result, i) => (
            <button
              key={result.id}
              onClick={result.action}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm",
                "hover:bg-accent transition-colors",
                i === activeIndex && "bg-accent"
              )}
            >
              <span className="text-base leading-none flex-shrink-0">{result.icon}</span>
              <span className="flex-1 truncate font-medium">{result.title}</span>
              {result.type === "action" && (
                <Plus className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              )}
              {result.type === "page" && (
                <FileText className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div className="border-t border-border/50 px-4 py-2 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><kbd className="border rounded px-1">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="border rounded px-1">↵</kbd> open</span>
          <span className="flex items-center gap-1"><kbd className="border rounded px-1">esc</kbd> close</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
