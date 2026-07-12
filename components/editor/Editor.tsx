// components/editor/Editor.tsx
// The core TipTap editor with:
//   • Yjs CRDT real-time collaboration via Socket.io
//   • Slash command "/" menu
//   • Selection bubble toolbar
//   • Collaboration cursors (other users)
//   • Image upload (drag-drop + file picker)
//   • Auto-save to PostgreSQL via debounced PATCH
//   • Markdown input rules (**, __, ~~, `, ```, >, #)

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { useSession } from "next-auth/react";
import type { Socket } from "socket.io-client";

// ─── TipTap extensions ────────────────────────────────────────────────────────
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CharacterCount from "@tiptap/extension-character-count";
import { common, createLowlight } from "lowlight";
import * as Y from "yjs";

// ─── Local extensions & hooks ─────────────────────────────────────────────────
import { SlashCommand } from "./extensions/SlashCommandExtension";
import { TrailingNode } from "./extensions/TrailingNode";
import { SlashCommandMenu } from "./SlashCommandMenu";
import { BubbleToolbar } from "./BubbleToolbar";
import { CollabCursors } from "./CollabCursors";
import { useYjsProvider } from "./useYjsProvider";
import { useUpload } from "@/hooks/useUpload";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const lowlight = createLowlight(common);

// ─── Slash command state ──────────────────────────────────────────────────────
interface SlashMenuState {
  open: boolean;
  query: string;
  from: number;
  position: { top: number; left: number };
}

const DEFAULT_SLASH_STATE: SlashMenuState = {
  open: false,
  query: "",
  from: 0,
  position: { top: 0, left: 0 },
};

// ─── Main Editor ──────────────────────────────────────────────────────────────
interface Props {
  pageId: string;
  workspaceId: string;
  initialContent: object | null; // JSON doc from DB
  canEdit: boolean;
  socket: Socket | null;
}

export function Editor({ pageId, workspaceId, initialContent, canEdit, socket }: Props) {
  const { data: session } = useSession();
  const editorWrapperRef = useRef<HTMLDivElement>(null);

  // ── Slash command state ────────────────────────────────────────────────────
  const [slashMenu, setSlashMenu] = useState<SlashMenuState>(DEFAULT_SLASH_STATE);

  // ── Current word count ─────────────────────────────────────────────────────
  const [wordCount, setWordCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // ── User identity for Yjs/awareness ───────────────────────────────────────
  const user = session?.user as
    | { id: string; name?: string | null; color?: string; image?: string | null }
    | undefined;

  const yjsUser = {
    id: user?.id ?? "anonymous",
    name: user?.name ?? "Anonymous",
    color: user?.color ?? "#6366f1",
    image: user?.image ?? null,
  };

  // ── Yjs CRDT provider ─────────────────────────────────────────────────────
  const { ydoc, awareness, isSynced } = useYjsProvider({
    pageId,
    socket,
    user: yjsUser,
  });

  // ── Image upload hook ──────────────────────────────────────────────────────
  const { upload } = useUpload({
    workspaceId,
    onSuccess: (result) => {
      editor?.chain().focus().setImage({ src: result.url, alt: result.name }).run();
    },
  });

  // ── Slash command position resolver ───────────────────────────────────────
  function resolveSlashPosition(from: number): { top: number; left: number } {
    try {
      const view = (window as unknown as { __tiptapView?: { domAtPos: (pos: number) => { node: Node; offset: number } } }).__tiptapView;
      if (!view) return { top: 0, left: 0 };
      const { node, offset } = view.domAtPos(from);
      const range = document.createRange();
      range.setStart(node, offset);
      range.collapse(true);
      const rect = range.getBoundingClientRect();
      const wrapper = editorWrapperRef.current;
      if (!wrapper) return { top: rect.bottom + 8, left: rect.left };
      const wRect = wrapper.getBoundingClientRect();
      return { top: rect.bottom - wRect.top + 8, left: rect.left - wRect.left };
    } catch {
      return { top: 80, left: 120 };
    }
  }

  // ── TipTap editor setup ───────────────────────────────────────────────────
  const editor = useEditor(
    {
      // Use ydoc for Yjs-backed content
      extensions: [
        StarterKit.configure({
          // Disable history — Yjs handles undo/redo
          history: false,
          // Disable code block (using lowlight version)
          codeBlock: false,
        }),

        // ── Yjs collaboration ────────────────────────────────────────────────
        ...(ydoc
          ? [
              Collaboration.configure({ document: ydoc }),
              CollaborationCursor.configure({
                provider: {
                  awareness,
                },
                user: {
                  name: yjsUser.name,
                  color: yjsUser.color,
                },
              }),
            ]
          : []),

        // ── Text formatting ──────────────────────────────────────────────────
        Underline,
        TextStyle,
        Color,
        Highlight.configure({ multicolor: true }),
        TextAlign.configure({ types: ["heading", "paragraph"] }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary underline underline-offset-4 cursor-pointer",
          },
        }),

        // ── Blocks ───────────────────────────────────────────────────────────
        CodeBlockLowlight.configure({ lowlight }),
        TaskList.configure({ HTMLAttributes: { class: "task-list" } }),
        TaskItem.configure({ nested: true }),
        Image.configure({
          HTMLAttributes: {
            class: "rounded-xl max-w-full my-4 shadow-md cursor-pointer",
          },
        }),

        // ── Tables ───────────────────────────────────────────────────────────
        Table.configure({ resizable: true }),
        TableRow,
        TableHeader,
        TableCell,

        // ── UX enhancements ───────────────────────────────────────────────────
        CharacterCount,
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (node.type.name === "heading") return "Heading";
            return "Type '/' for commands, or just start writing…";
          },
          showOnlyCurrent: true,
        }),

        // ── Slash command extension ────────────────────────────────────────────
        SlashCommand.configure({
          onTrigger(query, from) {
            const pos = resolveSlashPosition(from);
            setSlashMenu({ open: true, query, from, position: pos });
          },
          onDismiss() {
            setSlashMenu(DEFAULT_SLASH_STATE);
          },
        }),

        // ── Always have trailing paragraph ────────────────────────────────────
        TrailingNode,
      ],

      editorProps: {
        attributes: {
          id: "page-editor",
          class: "prose prose-slate dark:prose-invert max-w-none outline-none min-h-[60vh] focus:outline-none",
          "data-page-id": pageId,
          spellcheck: "true",
        },
        // Drag-and-drop image upload
        handleDrop(view, event) {
          if (!canEdit) return false;
          const files = Array.from(event.dataTransfer?.files ?? []);
          const imageFiles = files.filter((f) => f.type.startsWith("image/"));
          if (!imageFiles.length) return false;
          event.preventDefault();
          imageFiles.forEach((f) => upload(f));
          return true;
        },
        handlePaste(view, event) {
          if (!canEdit) return false;
          const files = Array.from(event.clipboardData?.files ?? []);
          const imageFiles = files.filter((f) => f.type.startsWith("image/"));
          if (!imageFiles.length) return false;
          event.preventDefault();
          imageFiles.forEach((f) => upload(f));
          return true;
        },
      },

      editable: canEdit,

      // Load initial content if Yjs doc is empty and we have saved content
      onCreate({ editor }) {
        if (!ydoc) return;
        const fragment = ydoc.getXmlFragment("default");
        if (fragment.length === 0 && initialContent) {
          editor.commands.setContent(initialContent);
        }
        // Expose view for slash command positioning
        (window as unknown as Record<string, unknown>).__tiptapView = editor.view;
      },

      onUpdate({ editor }) {
        setWordCount(editor.storage.characterCount?.words?.() ?? 0);
      },

      onSelectionUpdate({ editor }) {
        // Sync cursor position to awareness
        if (!awareness || !canEdit) return;
        const { from, to } = editor.state.selection;
        const current = awareness.getLocalState() as Record<string, unknown> | null;
        awareness.setLocalState({
          ...(current ?? {}),
          cursor: { anchor: from, head: to },
          isTyping: false,
        });
      },
    },
    [ydoc, canEdit] // Re-create editor when Yjs doc is ready
  );

  // ── Auto-save: debounce content → PATCH /api/pages/:id ───────────────────
  const [editorContent, setEditorContent] = useState<object | null>(null);

  useEffect(() => {
    if (!editor) return;
    const handler = () => setEditorContent(editor.getJSON());
    editor.on("update", handler);
    return () => {
      editor.off("update", handler);
    };
  }, [editor]);

  const debouncedContent = useDebounce(editorContent, 2000);

  useEffect(() => {
    if (!debouncedContent || !pageId || !canEdit) return;

    async function save() {
      setIsSaving(true);
      try {
        await fetch(`/api/pages/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: debouncedContent }),
        });
      } catch {
        toast.error("Auto-save failed");
      } finally {
        setIsSaving(false);
      }
    }

    save();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedContent]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!editor) return;
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        // Manual save
        const content = editor.getJSON();
        fetch(`/api/pages/${pageId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }).then(() => toast.success("Saved", { duration: 1500 }));
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [editor, pageId]);

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (awareness) {
        awareness.setLocalState(null); // remove local cursor on leave
      }
    };
  }, [awareness]);

  // ── Loading state (waiting for Yjs sync) ──────────────────────────────────
  if (!isSynced || !editor) {
    return (
      <div className="px-8 md:px-16 py-8">
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded bg-muted"
              style={{ width: `${85 - i * 8}%`, opacity: 1 - i * 0.1 }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={editorWrapperRef}>
      {/* ── Bubble toolbar ──────────────────────────────────────────────────── */}
      <BubbleToolbar editor={editor} />

      {/* ── Collaboration cursors ───────────────────────────────────────────── */}
      <CollabCursors
        awareness={awareness}
        currentUserId={yjsUser.id}
        editorRef={editorWrapperRef}
      />

      {/* ── Editor content ─────────────────────────────────────────────────── */}
      <div
        className={cn(
          "px-8 md:px-16 pb-32",
          !canEdit && "pointer-events-none select-text"
        )}
        onClick={() => {
          if (canEdit && editor && !editor.isFocused) editor.commands.focus("end");
        }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* ── Slash command menu ─────────────────────────────────────────────── */}
      {slashMenu.open && (
        <SlashCommandMenu
          editor={editor}
          query={slashMenu.query}
          from={slashMenu.from}
          position={slashMenu.position}
          onClose={() => setSlashMenu(DEFAULT_SLASH_STATE)}
        />
      )}

      {/* ── Status bar ─────────────────────────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 text-xs text-muted-foreground pointer-events-none select-none">
        {isSaving && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Saving…
          </span>
        )}
        {!isSaving && (
          <span className="opacity-50">
            {wordCount} word{wordCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Hidden image file input ─────────────────────────────────────────── */}
      <input
        id="editor-image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
