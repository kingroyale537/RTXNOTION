// components/editor/BubbleToolbar.tsx
// Selection bubble menu: text formatting, links, highlight, colors.

"use client";

import { BubbleMenu, type Editor } from "@tiptap/react";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Code, Link2, Highlighter, AlignLeft, AlignCenter, AlignRight, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, title, children }: ToolbarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-md text-sm transition-colors",
        "hover:bg-white/10",
        isActive ? "bg-white/20 text-white" : "text-white/80"
      )}
    >
      {children}
    </button>
  );
}

const HIGHLIGHT_COLORS = [
  { label: "Yellow",  value: "#fef08a" },
  { label: "Green",   value: "#bbf7d0" },
  { label: "Blue",    value: "#bfdbfe" },
  { label: "Pink",    value: "#fbcfe8" },
  { label: "Orange",  value: "#fed7aa" },
  { label: "Purple",  value: "#e9d5ff" },
];

const TEXT_COLORS = [
  { label: "Default", value: "" },
  { label: "Red",     value: "#ef4444" },
  { label: "Blue",    value: "#3b82f6" },
  { label: "Green",   value: "#22c55e" },
  { label: "Orange",  value: "#f97316" },
  { label: "Purple",  value: "#a855f7" },
];

interface Props {
  editor: Editor;
  onTriggerAi?: (from: number, to: number, text: string) => void;
}

export function BubbleToolbar({ editor, onTriggerAi }: Props) {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const setLink = useCallback(() => {
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl, target: "_blank" })
        .run();
    }
    setLinkUrl("");
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 100,
        placement: "top",
        offset: [0, 8],
        zIndex: 40,
      }}
      shouldShow={({ editor: e, state }) => {
        const { selection } = state;
        const { empty } = selection;
        if (empty) return false;
        if (e.isActive("image") || e.isActive("codeBlock")) return false;
        return true;
      }}
    >
      <div className="flex items-center gap-0.5 bg-gray-900 dark:bg-gray-800 border border-gray-700 rounded-xl px-1.5 py-1.5 shadow-2xl shadow-black/50">
        {showLinkInput ? (
          <div className="flex items-center gap-1.5 px-1">
            <input
              autoFocus
              type="url"
              placeholder="https://…"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setLink();
                if (e.key === "Escape") setShowLinkInput(false);
              }}
              className="w-52 bg-transparent border-b border-gray-500 text-white text-sm outline-none pb-0.5 placeholder:text-gray-500"
            />
            <button
              onClick={setLink}
              className="text-primary text-xs font-semibold hover:opacity-80"
            >
              Apply
            </button>
            <button
              onClick={() => setShowLinkInput(false)}
              className="text-gray-400 text-xs hover:opacity-80"
            >
              Cancel
            </button>
          </div>
        ) : showHighlightPicker ? (
          <div className="flex items-center gap-1 px-1">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c.value}
                title={c.label}
                className="w-6 h-6 rounded-full border-2 border-transparent hover:border-white/40 transition-all flex-shrink-0"
                style={{ backgroundColor: c.value }}
                onClick={() => {
                  editor.chain().focus().toggleHighlight({ color: c.value }).run();
                  setShowHighlightPicker(false);
                }}
              />
            ))}
            <button
              title="Remove highlight"
              className="text-gray-400 text-xs hover:text-white ml-1"
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                setShowHighlightPicker(false);
              }}
            >
              ✕
            </button>
          </div>
        ) : showColorPicker ? (
          <div className="flex items-center gap-1 px-1">
            {TEXT_COLORS.map((c) => (
              <button
                key={c.label}
                title={c.label}
                className="w-5 h-5 rounded-full border-2 border-gray-600 hover:border-white/60 transition-all flex-shrink-0"
                style={{ backgroundColor: c.value || "transparent" }}
                onClick={() => {
                  if (!c.value) editor.chain().focus().unsetColor().run();
                  else editor.chain().focus().setColor(c.value).run();
                  setShowColorPicker(false);
                }}
              />
            ))}
          </div>
        ) : (
          <>
            {onTriggerAi && (
              <>
                <button
                  onClick={() => {
                    const { from, to } = editor.state.selection;
                    const text = editor.state.doc.textBetween(from, to, " ");
                    onTriggerAi(from, to, text);
                  }}
                  className="flex items-center gap-1 px-2.5 h-8 rounded-md text-xs font-bold transition-colors bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 mr-1 flex-shrink-0"
                  title="Ask Voltaic AI to write or edit"
                >
                  <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                  <span>Ask AI</span>
                </button>
                <button
                  onClick={() => {
                    const { from, to } = editor.state.selection;
                    const text = editor.state.doc.textBetween(from, to, " ");
                    onTriggerAi(from, to, `Rewrite this text in a clear, professional tone: "${text}"`);
                  }}
                  className="px-2 h-8 rounded-md text-[11px] font-semibold text-gray-300 hover:bg-white/10 transition flex items-center gap-1"
                  title="Make text Professional"
                >
                  <span>Tone: Pro</span>
                </button>
                <button
                  onClick={() => {
                    const { from, to } = editor.state.selection;
                    const text = editor.state.doc.textBetween(from, to, " ");
                    onTriggerAi(from, to, `Generate a Mermaid.js diagram (e.g. flowchart or sequence diagram) representing this text: "${text}"`);
                  }}
                  className="px-2 h-8 rounded-md text-[11px] font-semibold text-gray-300 hover:bg-white/10 transition flex items-center gap-1"
                  title="Generate Mermaid Diagram"
                >
                  <span>Diagram 📊</span>
                </button>
                <button
                  onClick={() => {
                    const { from, to } = editor.state.selection;
                    const text = editor.state.doc.textBetween(from, to, " ");
                    onTriggerAi(from, to, `Translate this text into Hindi/English: "${text}"`);
                  }}
                  className="px-2 h-8 rounded-md text-[11px] font-semibold text-gray-300 hover:bg-white/10 transition flex items-center gap-1 mr-1"
                  title="Translate Text"
                >
                  <span>Translate 🌐</span>
                </button>
              </>
            )}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              title="Bold (⌘B)"
            >
              <Bold className="h-3.5 w-3.5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              title="Italic (⌘I)"
            >
              <Italic className="h-3.5 w-3.5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive("underline")}
              title="Underline (⌘U)"
            >
              <UnderlineIcon className="h-3.5 w-3.5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive("strike")}
              title="Strikethrough"
            >
              <Strikethrough className="h-3.5 w-3.5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive("code")}
              title="Inline code"
            >
              <Code className="h-3.5 w-3.5" />
            </ToolbarButton>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-600 mx-1" />

            <ToolbarButton
              onClick={() => {
                setShowLinkInput(true);
                setLinkUrl(editor.getAttributes("link").href ?? "");
              }}
              isActive={editor.isActive("link")}
              title="Link"
            >
              <Link2 className="h-3.5 w-3.5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => setShowHighlightPicker(true)}
              isActive={editor.isActive("highlight")}
              title="Highlight"
            >
              <Highlighter className="h-3.5 w-3.5" />
            </ToolbarButton>

            {/* Divider */}
            <div className="w-px h-5 bg-gray-600 mx-1" />

            {/* Block type dropdown shortcut */}
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              isActive={editor.isActive({ textAlign: "left" })}
              title="Align left"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              isActive={editor.isActive({ textAlign: "center" })}
              title="Align center"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              isActive={editor.isActive({ textAlign: "right" })}
              title="Align right"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </ToolbarButton>
          </>
        )}
      </div>
    </BubbleMenu>
  );
}
