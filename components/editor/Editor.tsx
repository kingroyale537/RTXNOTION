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
import { MermaidRenderer } from "./MermaidRenderer";

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
import { Sparkles, Loader2 } from "lucide-react";

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

// ─── Inline AI state ──────────────────────────────────────────────────────────
interface InlineAiState {
  open: boolean;
  position: { top: number; left: number };
  from: number;
  to: number;
  selectedText: string;
}

const DEFAULT_INLINE_AI_STATE: InlineAiState = {
  open: false,
  position: { top: 0, left: 0 },
  from: 0,
  to: 0,
  selectedText: "",
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

  // ── Inline AI state ────────────────────────────────────────────────────────
  const [inlineAi, setInlineAi] = useState<InlineAiState>(DEFAULT_INLINE_AI_STATE);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  async function runInlineAi(promptText: string) {
    if (!promptText.trim() || isAiLoading || !editor) return;
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "edit",
          prompt: promptText,
          text: inlineAi.selectedText || " ",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to get AI response");
        return;
      }

      const resultText = json.data.text;
      
      // Replace text selection or insert at position
      editor
        .chain()
        .focus()
        .deleteRange({ from: inlineAi.from, to: inlineAi.to })
        .insertContent(resultText)
        .run();

      setInlineAi(DEFAULT_INLINE_AI_STATE);
      setAiPrompt("");
    } catch {
      toast.error("Could not generate AI response");
    } finally {
      setIsAiLoading(false);
    }
  }

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
          class: "prose prose-invert prose-slate max-w-none outline-none min-h-[60vh] focus:outline-none",
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
        (window as unknown as Record<string, unknown>).__tiptapView = editor.view;
        (window as unknown as Record<string, unknown>).__tiptapEditor = editor;
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

  // Seed initial content after Yjs sync is complete or if no socket is provided
  useEffect(() => {
    if (!editor || !initialContent) return;
    if (socket && !isSynced) return; // wait for sync if socket is active

    if (ydoc) {
      const fragment = ydoc.getXmlFragment("default");
      if (fragment.length === 0) {
        editor.commands.setContent(initialContent);
      }
    } else {
      editor.commands.setContent(initialContent);
    }
  }, [isSynced, editor, ydoc, initialContent, socket]);

  // ── Event Listeners for AI Insert & Auto-Reload ─────────────────────────
  useEffect(() => {
    if (!editor) return;
    (window as unknown as Record<string, unknown>).__tiptapEditor = editor;

    const handleInsertText = (e: Event) => {
      const customEvent = e as CustomEvent<{ text?: string }>;
      const textToInsert = customEvent.detail?.text;
      if (editor && textToInsert) {
        editor.chain().focus().insertContent("\n\n" + textToInsert).run();
        toast.success("Inserted content into document!");
      }
    };

    const handleReloadPage = (e: Event) => {
      const customEvent = e as CustomEvent<{ content?: string }>;
      const newContent = customEvent.detail?.content;
      if (editor && newContent) {
        editor.commands.setContent(newContent);
        toast.success("Document updated by AI!");
      }
    };

    window.addEventListener("insert-to-editor", handleInsertText);
    window.addEventListener("editor-reload-page", handleReloadPage);

    return () => {
      window.removeEventListener("insert-to-editor", handleInsertText);
      window.removeEventListener("editor-reload-page", handleReloadPage);
    };
  }, [editor]);

  // ── Auto-save: debounce content → PATCH /api/pages/:id ───────────────────
  const [editorContent, setEditorContent] = useState<object | null>(null);
  const [diagrams, setDiagrams] = useState<string[]>([]);

  useEffect(() => {
    if (!editor) return;
    const handler = () => {
      setEditorContent(editor.getJSON());
      
      const html = editor.getHTML();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const mermaidBlocks = doc.querySelectorAll("pre code.language-mermaid");
      const charts: string[] = [];
      mermaidBlocks.forEach((block) => {
        if (block.textContent) {
          charts.push(block.textContent);
        }
      });
      setDiagrams(charts);
    };

    editor.on("update", handler);
    if (isSynced) {
      setTimeout(handler, 800);
    }
    return () => {
      editor.off("update", handler);
    };
  }, [editor, isSynced]);

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
      <BubbleToolbar
        editor={editor}
        onTriggerAi={(from, to, text) => {
          const pos = resolveSlashPosition(from);
          setInlineAi({
            open: true,
            position: pos,
            from,
            to,
            selectedText: text,
          });
        }}
      />

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

        {/* ── Live Mermaid Diagrams Render Layer (Pillar 6) ────────────────── */}
        {diagrams.length > 0 && (
          <div className="mt-8 border-t border-[#2a2a2a] pt-6 space-y-4 pointer-events-auto select-none" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>📊 Live Structural Diagrams ({diagrams.length})</span>
              </h3>
              <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono">Mermaid.js</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diagrams.map((chart, idx) => (
                <div key={idx} className="bg-[#181818] border border-[#2c2c2c] rounded-xl p-4 flex flex-col space-y-2 shadow-sm">
                  <div className="text-[10px] text-gray-400 font-semibold font-mono">Diagram #{idx + 1}</div>
                  <MermaidRenderer chart={chart} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Slash command menu ─────────────────────────────────────────────── */}
      {slashMenu.open && (
        <SlashCommandMenu
          editor={editor}
          query={slashMenu.query}
          from={slashMenu.from}
          position={slashMenu.position}
          onClose={() => setSlashMenu(DEFAULT_SLASH_STATE)}
          onTriggerAi={(from, queryLen) => {
            editor.chain().focus().deleteRange({ from, to: from + queryLen + 1 }).run();
            const pos = resolveSlashPosition(from);
            setInlineAi({
              open: true,
              position: pos,
              from,
              to: from,
              selectedText: "",
            });
          }}
        />
      )}

      {/* ── Inline AI Command Palette ───────────────────────────────────────── */}
      {inlineAi.open && (
        <div
          className="absolute z-50 w-80 bg-gray-900 border border-gray-700 rounded-xl p-3 shadow-2xl flex flex-col gap-2 text-white"
          style={{
            top: `${inlineAi.position.top}px`,
            left: `${Math.max(10, Math.min(typeof window !== "undefined" ? window.innerWidth - 340 : 100, inlineAi.position.left))}px`,
          }}
        >
          <div className="flex items-center gap-2 border border-gray-700 rounded-lg px-2 bg-gray-800 focus-within:border-primary">
            <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
            <input
              autoFocus
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  runInlineAi(aiPrompt);
                } else if (e.key === "Escape") {
                  setInlineAi(DEFAULT_INLINE_AI_STATE);
                  setAiPrompt("");
                }
              }}
              placeholder="Ask AI to write or edit..."
              className="w-full h-9 bg-transparent outline-none border-none text-xs text-white placeholder-gray-500"
            />
            {isAiLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-purple-400 shrink-0" />
            ) : (
              <button
                onClick={() => runInlineAi(aiPrompt)}
                className="text-xs text-primary font-bold hover:text-primary/80"
              >
                Go
              </button>
            )}
          </div>

          {/* Quick preset AI options */}
          <div className="flex flex-col text-[11px] text-gray-400 font-semibold border-t border-gray-800 pt-2 max-h-48 overflow-y-auto">
            <span className="px-2 py-1 text-[9px] uppercase text-gray-500 tracking-wider">Predefined actions</span>
            <button
              onClick={() => runInlineAi("Summarize the text")}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-800 hover:text-white text-left transition"
            >
              📝 Summarize
            </button>
            <button
              onClick={() => runInlineAi("Translate to Spanish")}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-800 hover:text-white text-left transition"
            >
              🌐 Translate to Spanish
            </button>
            <button
              onClick={() => runInlineAi("Improve spelling and grammar")}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-800 hover:text-white text-left transition"
            >
              ✍️ Improve grammar & spelling
            </button>
            <button
              onClick={() => runInlineAi("Make the tone professional")}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-800 hover:text-white text-left transition"
            >
              👔 Make professional tone
            </button>
            <button
              onClick={() => runInlineAi("Make the tone casual")}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-800 hover:text-white text-left transition"
            >
              🍕 Make casual tone
            </button>
          </div>
        </div>
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
