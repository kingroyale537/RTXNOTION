// components/editor/SlashCommandMenu.tsx
// Floating slash-command palette that appears when the user types "/".
// Keyboard-navigable. Inserts chosen block and removes the "/" trigger.

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Editor } from "@tiptap/react";
import {
  Heading1, Heading2, Heading3, List, ListOrdered,
  CheckSquare, Code2, Quote, Minus, Image as ImageIcon,
  Type, Table2, ChevronRight, StickyNote, Sparkles, Mic, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

// ─── Block definitions ────────────────────────────────────────────────────────
interface BlockItem {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  keywords: string[];
  group: string;
  action: (editor: Editor, from: number, queryLen: number) => void;
}

const BLOCKS: BlockItem[] = [
  // ── AI Tools ──────────────────────────────────────────────────────────────
  {
    id: "ai",
    label: "Ask AI",
    description: "Write with AI, summarize, or edit",
    icon: Sparkles,
    keywords: ["ai", "write", "generator", "ask", "gpt", "gemini", "sparkles"],
    group: "AI Tools",
    action: () => {},
  },
  {
    id: "meeting-notes",
    label: "Meeting Notes AI 🎙️",
    description: "Record live meetings or paste transcripts for auto-summary & action items",
    icon: Mic,
    keywords: ["meet", "meeting", "notes", "audio", "transcript", "hinglish", "speech", "record"],
    group: "AI Tools",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .run();
      useUIStore.getState().setMeetingNotesOpen(true);
    },
  },
  {
    id: "synced-block",
    label: "Synced Block 🔄",
    description: "Sync content in real-time across multiple pages",
    icon: RefreshCw,
    keywords: ["synced", "sync", "reuse", "duplicate", "block", "shared"],
    group: "Advanced blocks",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .insertContent({
          type: "paragraph",
          content: [{ type: "text", text: "🔄 [Synced Block] Edit here to update live across pages..." }],
        })
        .run();
    },
  },
  // ── Text ──────────────────────────────────────────────────────────────────
  {
    id: "paragraph",
    label: "Text",
    description: "Just start writing with plain text",
    icon: Type,
    keywords: ["text", "paragraph", "plain"],
    group: "Basic blocks",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .setParagraph()
        .run();
    },
  },
  {
    id: "heading1",
    label: "Heading 1",
    description: "Large section heading",
    icon: Heading1,
    keywords: ["h1", "heading", "title", "large"],
    group: "Basic blocks",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .setHeading({ level: 1 })
        .run();
    },
  },
  {
    id: "heading2",
    label: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    keywords: ["h2", "heading", "subtitle"],
    group: "Basic blocks",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .setHeading({ level: 2 })
        .run();
    },
  },
  {
    id: "heading3",
    label: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    keywords: ["h3", "heading", "small"],
    group: "Basic blocks",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .setHeading({ level: 3 })
        .run();
    },
  },
  // ── Lists ─────────────────────────────────────────────────────────────────
  {
    id: "bulletList",
    label: "Bulleted list",
    description: "A simple bullet list",
    icon: List,
    keywords: ["bullet", "list", "ul", "-"],
    group: "Lists",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .toggleBulletList()
        .run();
    },
  },
  {
    id: "orderedList",
    label: "Numbered list",
    description: "A numbered ordered list",
    icon: ListOrdered,
    keywords: ["numbered", "ordered", "list", "ol", "1."],
    group: "Lists",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .toggleOrderedList()
        .run();
    },
  },
  {
    id: "taskList",
    label: "To-do list",
    description: "Track tasks with checkboxes",
    icon: CheckSquare,
    keywords: ["todo", "task", "check", "checkbox", "[ ]"],
    group: "Lists",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .toggleTaskList()
        .run();
    },
  },
  // ── Media & special ───────────────────────────────────────────────────────
  {
    id: "blockquote",
    label: "Quote",
    description: "Capture a quote or callout",
    icon: Quote,
    keywords: ["quote", "blockquote", "callout", ">"],
    group: "Special",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .toggleBlockquote()
        .run();
    },
  },
  {
    id: "codeBlock",
    label: "Code block",
    description: "Syntax-highlighted code snippet",
    icon: Code2,
    keywords: ["code", "pre", "```", "snippet", "programming"],
    group: "Special",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .toggleCodeBlock()
        .run();
    },
  },
  {
    id: "divider",
    label: "Divider",
    description: "A visual horizontal separator",
    icon: Minus,
    keywords: ["divider", "hr", "rule", "separator", "---"],
    group: "Special",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .setHorizontalRule()
        .run();
    },
  },
  {
    id: "image",
    label: "Image",
    description: "Upload or embed an image",
    icon: ImageIcon,
    keywords: ["image", "photo", "picture", "img"],
    group: "Media",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .run();
      // Trigger file input (handled by parent)
      document.getElementById("editor-image-upload")?.click();
    },
  },
  {
    id: "callout",
    label: "Callout",
    description: "Highlight important information",
    icon: StickyNote,
    keywords: ["callout", "note", "tip", "warning", "info"],
    group: "Special",
    action: (editor, from, queryLen) => {
      editor
        .chain()
        .focus()
        .deleteRange({ from, to: from + queryLen + 1 })
        .setBlockquote()
        .run();
    },
  },
];

// ─── Group items ──────────────────────────────────────────────────────────────
function groupItems(items: BlockItem[]) {
  const groups: Record<string, BlockItem[]> = {};
  for (const item of items) {
    if (!groups[item.group]) groups[item.group] = [];
    groups[item.group].push(item);
  }
  return Object.entries(groups);
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  editor: Editor;
  query: string;
  from: number;
  position: { top: number; left: number };
  onClose: () => void;
  onTriggerAi?: (from: number, queryLen: number) => void;
}

export function SlashCommandMenu({ editor, query, from, position, onClose, onTriggerAi }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  // Filter blocks by query
  const filtered = query.trim()
    ? BLOCKS.filter(
        (b) =>
          b.label.toLowerCase().includes(query.toLowerCase()) ||
          b.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase()))
      )
    : BLOCKS;

  // Scroll active item into view
  useEffect(() => {
    const el = menuRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  // Reset active index when query changes
  useEffect(() => { setActiveIndex(0); }, [query]);

  const handleSelect = useCallback(
    (item: BlockItem) => {
      if (item.id === "ai" && onTriggerAi) {
        onTriggerAi(from, query.length);
        onClose();
        return;
      }
      item.action(editor, from, query.length);
      onClose();
    },
    [editor, from, query, onClose, onTriggerAi]
  );

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filtered[activeIndex];
        if (item) handleSelect(item);
      } else if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [filtered, activeIndex, handleSelect, onClose]);

  // Click outside to close
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  if (filtered.length === 0) {
    return (
      <div
        ref={menuRef}
        className="slash-command-popup fixed z-50"
        style={{ top: position.top, left: position.left }}
      >
        <div className="px-3 py-6 text-center text-sm text-muted-foreground">
          No blocks match &ldquo;{query}&rdquo;
        </div>
      </div>
    );
  }

  const groups = groupItems(filtered);
  let globalIndex = 0;

  return (
    <div
      ref={menuRef}
      className="slash-command-popup fixed z-50 overflow-y-auto max-h-80"
      style={{ top: position.top, left: position.left }}
    >
      {groups.map(([groupName, items]) => (
        <div key={groupName}>
          <div className="px-3 pt-3 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              {groupName}
            </p>
          </div>
          {items.map((item) => {
            const idx = globalIndex++;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                data-index={idx}
                onClick={() => handleSelect(item)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm",
                  "hover:bg-accent transition-colors",
                  idx === activeIndex && "bg-accent"
                )}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center shadow-sm">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-[13px]">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                </div>
                {idx === activeIndex && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      ))}
      <div className="border-t border-border px-3 py-1.5">
        <p className="text-[10px] text-muted-foreground">↑↓ navigate · ↵ select · esc dismiss</p>
      </div>
    </div>
  );
}
