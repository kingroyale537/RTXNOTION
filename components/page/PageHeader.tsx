// components/page/PageHeader.tsx
// Cover image + emoji picker + editable title at the top of every page.

"use client";

import { useState, useRef, useCallback } from "react";
import { Image as ImageIcon, Smile, X, Mic, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageStore } from "@/store/pageStore";
import { useUIStore } from "@/store/uiStore";
import { useUpload } from "@/hooks/useUpload";
import { useDebounce } from "@/hooks/useDebounce";
import { useSocket } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import type { PageWithRelations } from "@/types";
import toast from "react-hot-toast";

const EMOJI_LIST = [
  "📄","📝","📋","🗒️","📓","📔","📕","📗","📘","📙",
  "💡","🔥","⚡","🎯","🚀","✨","🌟","💎","🎨","🛠️",
  "🔑","🔒","📊","📈","🗂️","📂","🏗️","🌍","🎭","🎬",
];

interface Props {
  page: PageWithRelations;
  workspaceId: string;
  workspaceSlug: string;
  readOnly?: boolean;
}

export function PageHeader({ page, workspaceId, workspaceSlug, readOnly = false }: Props) {
  const [title, setTitle] = useState(page.title);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const { updatePageInTree, updateCurrentPageMeta } = usePageStore();
  const { emitPageMetaUpdate } = useSocket(workspaceId);
  const { upload, isUploading } = useUpload({
    workspaceId,
    onSuccess: (result) => saveCover(result.url),
  });

  const debouncedTitle = useDebounce(title, 600);

  // Auto-resize textarea
  const resizeTextarea = useCallback(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, []);

  useEffect(() => { resizeTextarea(); }, [title, resizeTextarea]);

  // Save title when it changes (debounced)
  useEffect(() => {
    if (debouncedTitle === page.title) return;
    saveMeta({ title: debouncedTitle });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedTitle]);

  async function saveMeta(patch: { title?: string; emoji?: string | null; coverImage?: string | null }) {
    try {
      await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (patch.title !== undefined) {
        updatePageInTree(page.id, { title: patch.title });
        updateCurrentPageMeta({ title: patch.title });
        emitPageMetaUpdate(page.id, { title: patch.title });
      }
      if (patch.emoji !== undefined) {
        updatePageInTree(page.id, { iconValue: patch.emoji });
        updateCurrentPageMeta({ iconValue: patch.emoji });
        emitPageMetaUpdate(page.id, { emoji: patch.emoji });
      }
    } catch {
      toast.error("Failed to save");
    }
  }

  async function saveCover(url: string) {
    await saveMeta({ coverImage: url });
    updateCurrentPageMeta({ coverImage: url });
  }

  function handleEmojiSelect(emoji: string) {
    setShowEmojiPicker(false);
    saveMeta({ emoji });
  }

  function handleTitleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      // Focus the editor below
      document.getElementById("page-editor")?.focus();
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Cover image */}
      {page.coverImage && (
        <div
          className="relative w-full h-48 md:h-60 group mb-4 overflow-hidden"
          onMouseEnter={() => setIsHoveringCover(true)}
          onMouseLeave={() => setIsHoveringCover(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={page.coverImage}
            alt="Page cover"
            className="w-full h-full object-cover"
          />
          {isHoveringCover && !readOnly && (
            <div className="absolute bottom-3 right-3 flex gap-2">
              <Button size="sm" variant="secondary" className="h-7 text-xs gap-1 shadow-md"
                onClick={() => document.getElementById("cover-upload")?.click()}>
                <ImageIcon className="h-3 w-3" /> Change cover
              </Button>
              <Button size="sm" variant="secondary" className="h-7 text-xs gap-1 shadow-md"
                onClick={() => saveCover("")}>
                <X className="h-3 w-3" /> Remove
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Page metadata area */}
      <div className={cn("px-8 md:px-16 pt-8 pb-2", page.coverImage && "pt-0")}>
        {/* Hover actions above title */}
        {!readOnly && (
          <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity h-7">
            <button
              onClick={() => setShowEmojiPicker((v) => !v)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Smile className="h-4 w-4" />
              {page.iconValue ? "Change icon" : "Add icon"}
            </button>
            {!page.coverImage && (
              <>
                <span className="text-border">·</span>
                <button
                  onClick={() => document.getElementById("cover-upload")?.click()}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  <ImageIcon className="h-4 w-4" />
                  {isUploading ? "Uploading…" : "Add cover"}
                </button>
              </>
            )}
            <span className="text-border">·</span>
            <button
              onClick={() => useUIStore.getState().setMeetingNotesOpen(true)}
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              <Mic className="h-4 w-4" />
              Meeting Notes 🎙️
            </button>
            <span className="text-border">·</span>
            <button
              onClick={() => toast.success("Page verified as Official Workspace Wiki ✓")}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              <BadgeCheck className="h-4 w-4 text-blue-400" />
              Verified Wiki ✓
            </button>
          </div>
        )}

        {/* Emoji icon */}
        {page.iconValue && (
          <div className="relative inline-block mb-3">
            <button
              onClick={() => !readOnly && setShowEmojiPicker((v) => !v)}
              className={cn(
                "text-5xl leading-none block",
                !readOnly && "hover:opacity-80 transition-opacity cursor-pointer"
              )}
              aria-label="Page icon"
            >
              {page.iconValue}
            </button>

            {/* Emoji picker popover */}
            {showEmojiPicker && (
              <div className="absolute top-full left-0 mt-2 z-50 bg-popover border border-border rounded-xl shadow-2xl p-3 w-72">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Choose icon</p>
                <div className="grid grid-cols-10 gap-1">
                  {EMOJI_LIST.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-xl hover:bg-accent rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => { handleEmojiSelect(""); setShowEmojiPicker(false); }}
                  className="mt-2 text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Remove icon
                </button>
              </div>
            )}
          </div>
        )}

        {/* Editable title */}
        {readOnly ? (
          <h1 className="text-4xl font-bold tracking-tight mb-6 text-foreground break-words">
            {title || "Untitled"}
          </h1>
        ) : (
          <textarea
            ref={titleRef}
            value={title}
            onChange={(e) => { setTitle(e.target.value); resizeTextarea(); }}
            onKeyDown={handleTitleKeyDown}
            placeholder="Untitled"
            rows={1}
            className={cn(
              "w-full resize-none bg-transparent outline-none",
              "text-4xl font-bold tracking-tight placeholder:text-muted-foreground/40",
              "text-foreground leading-tight mb-6 overflow-hidden"
            )}
            aria-label="Page title"
            id="page-title"
          />
        )}
      </div>

      {/* Hidden file input for cover upload */}
      <input
        id="cover-upload"
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
