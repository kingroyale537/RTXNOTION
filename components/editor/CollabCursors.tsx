// components/editor/CollabCursors.tsx
// Renders other users' named cursors on top of the editor.
// Reads live positions from the Yjs awareness protocol.

"use client";

import { useEffect, useState } from "react";
import type { Awareness } from "y-protocols/awareness";
import { cn } from "@/lib/utils";

interface AwarenessState {
  user: { id: string; name: string; color: string };
  cursor: { anchor: number; head: number } | null;
  isTyping: boolean;
}

interface CursorInfo {
  userId: string;
  name: string;
  color: string;
  top: number;
  left: number;
  isTyping: boolean;
}

interface Props {
  awareness: Awareness | null;
  currentUserId: string;
  editorRef: React.RefObject<HTMLDivElement>;
}

function getCaretCoordinates(editorEl: HTMLElement, pos: number): { top: number; left: number } | null {
  try {
    const range = document.createRange();
    // Walk the editor's text nodes to find pos
    let charCount = 0;
    const walker = document.createTreeWalker(editorEl, NodeFilter.SHOW_TEXT);
    let node: Text | null = null;
    let targetOffset = 0;

    while ((node = walker.nextNode() as Text | null)) {
      const len = node.length;
      if (charCount + len >= pos) {
        targetOffset = pos - charCount;
        break;
      }
      charCount += len;
    }

    if (!node) return null;
    range.setStart(node, Math.min(targetOffset, node.length));
    range.collapse(true);

    const rect = range.getBoundingClientRect();
    const editorRect = editorEl.getBoundingClientRect();

    return {
      top: rect.top - editorRect.top,
      left: rect.left - editorRect.left,
    };
  } catch {
    return null;
  }
}

export function CollabCursors({ awareness, currentUserId, editorRef }: Props) {
  const [cursors, setCursors] = useState<CursorInfo[]>([]);

  useEffect(() => {
    if (!awareness) return;
    const activeAwareness = awareness;

    function updateCursors() {
      const editorEl = editorRef.current;
      const states = Array.from(activeAwareness.getStates().entries()) as [
        number,
        AwarenessState
      ][];

      const next: CursorInfo[] = [];

      for (const [clientId, state] of states) {
        if (!state?.user || state.user.id === currentUserId) continue;
        if (!state.cursor || !editorEl) continue;

        const coords = getCaretCoordinates(editorEl, state.cursor.head);
        if (!coords) continue;

        next.push({
          userId: state.user.id,
          name: state.user.name,
          color: state.user.color,
          top: coords.top,
          left: coords.left,
          isTyping: state.isTyping,
        });
      }

      setCursors(next);
    }

    activeAwareness.on("change", updateCursors);
    updateCursors();

    return () => activeAwareness.off("change", updateCursors);
  }, [awareness, currentUserId, editorRef]);

  if (cursors.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {cursors.map((cursor) => (
        <div key={cursor.userId}>
          {/* Caret line */}
          <div
            className="absolute w-0.5 h-5 opacity-90"
            style={{
              top: cursor.top,
              left: cursor.left,
              backgroundColor: cursor.color,
            }}
          />
          {/* Name tag */}
          <div
            className={cn(
              "absolute -translate-y-full -translate-x-0 rounded px-1.5 py-0.5",
              "text-white text-[10px] font-semibold whitespace-nowrap",
              "shadow-sm pointer-events-none select-none"
            )}
            style={{
              top: cursor.top,
              left: cursor.left,
              backgroundColor: cursor.color,
            }}
          >
            {cursor.name}
            {cursor.isTyping && (
              <span className="ml-1 inline-flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-white inline-block animate-bounce"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
