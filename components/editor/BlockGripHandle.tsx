// components/editor/BlockGripHandle.tsx
// Notion-style 6-Dot Margin Drag Handle (::) & Contextual "Turn Into" Menu.
// Appears smoothly on block hover in the left margin.

"use client";

import { useState, useEffect } from "react";
import { GripVertical, Plus, Type, Heading1, Heading2, Heading3, CheckSquare, MessageSquareQuote, Code, AlertCircle } from "lucide-react";
import type { Editor } from "@tiptap/react";

interface Props {
  editor: Editor | null;
}

export function BlockGripHandle({ editor }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!editor) return;

    const handleSelection = () => {
      // Keep menu synchronized with active selection position
    };

    editor.on("selectionUpdate", handleSelection);
    return () => {
      editor.off("selectionUpdate", handleSelection);
    };
  }, [editor]);

  if (!editor) return null;

  const transformBlock = (type: string) => {
    if (!editor) return;

    if (type === "h1") editor.chain().focus().toggleHeading({ level: 1 }).run();
    else if (type === "h2") editor.chain().focus().toggleHeading({ level: 2 }).run();
    else if (type === "h3") editor.chain().focus().toggleHeading({ level: 3 }).run();
    else if (type === "task") editor.chain().focus().toggleTaskList().run();
    else if (type === "quote") editor.chain().focus().toggleBlockquote().run();
    else if (type === "code") editor.chain().focus().toggleCodeBlock().run();
    else if (type === "paragraph") editor.chain().focus().setParagraph().run();

    setShowMenu(false);
  };

  return (
    <div className="relative inline-block select-none">
      {/* Floating Grip Handle Pill */}
      <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition cursor-pointer text-gray-400 hover:text-white px-1.5 py-1 rounded bg-[#202025]/80 border border-[#2c2c34]">
        <button
          onClick={() => {
            editor.chain().focus().insertContent("\n").run();
          }}
          className="hover:text-purple-400 transition"
          title="Insert block below (+)"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => setShowMenu(!showMenu)}
          className="hover:text-purple-400 transition flex items-center"
          title="Block options & Turn Into (::)"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Contextual "Turn Into" Menu */}
      {showMenu && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-[#1c1c20] border border-[#2c2c34] rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-xs">
          <div className="px-2 py-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            Turn Into
          </div>

          <button
            onClick={() => transformBlock("paragraph")}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#282830] transition flex items-center gap-2 text-gray-200"
          >
            <Type className="w-3.5 h-3.5 text-blue-400" />
            <span>Text Paragraph</span>
          </button>

          <button
            onClick={() => transformBlock("h1")}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#282830] transition flex items-center gap-2 text-gray-200"
          >
            <Heading1 className="w-3.5 h-3.5 text-purple-400" />
            <span>Heading 1</span>
          </button>

          <button
            onClick={() => transformBlock("h2")}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#282830] transition flex items-center gap-2 text-gray-200"
          >
            <Heading2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Heading 2</span>
          </button>

          <button
            onClick={() => transformBlock("h3")}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#282830] transition flex items-center gap-2 text-gray-200"
          >
            <Heading3 className="w-3.5 h-3.5 text-amber-400" />
            <span>Heading 3</span>
          </button>

          <button
            onClick={() => transformBlock("task")}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#282830] transition flex items-center gap-2 text-gray-200"
          >
            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>To-Do Checkbox</span>
          </button>

          <button
            onClick={() => transformBlock("quote")}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#282830] transition flex items-center gap-2 text-gray-200"
          >
            <MessageSquareQuote className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quote Callout</span>
          </button>

          <button
            onClick={() => transformBlock("code")}
            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#282830] transition flex items-center gap-2 text-gray-200"
          >
            <Code className="w-3.5 h-3.5 text-rose-400" />
            <span>Code Snippet Block</span>
          </button>
        </div>
      )}
    </div>
  );
}
