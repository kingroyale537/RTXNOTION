"use client";

import React from "react";
import { 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  Heading3, 
  CheckSquare, 
  List, 
  Code, 
  AtSign, 
  Plus, 
  Type, 
  Highlighter,
  Image as ImageIcon
} from "lucide-react";

interface MobileKeyboardToolbarProps {
  onToggleBold?: () => void;
  onToggleItalic?: () => void;
  onToggleH1?: () => void;
  onToggleH2?: () => void;
  onToggleH3?: () => void;
  onToggleTask?: () => void;
  onToggleBullet?: () => void;
  onToggleCode?: () => void;
  onOpenBlockPicker?: () => void;
}

export function MobileKeyboardToolbar({
  onToggleBold,
  onToggleItalic,
  onToggleH1,
  onToggleH2,
  onToggleH3,
  onToggleTask,
  onToggleBullet,
  onToggleCode,
  onOpenBlockPicker,
}: MobileKeyboardToolbarProps) {
  return (
    <div className="md:hidden sticky bottom-14 left-0 right-0 z-30 bg-zinc-900/95 backdrop-blur-md border-t border-b border-zinc-800 px-2 py-1.5 flex items-center space-x-1 overflow-x-auto no-scrollbar select-none shadow-lg">
      {/* Plus icon to trigger Block Picker */}
      <button
        onClick={onOpenBlockPicker}
        className="flex-shrink-0 p-2 rounded-lg bg-indigo-600 text-white active:scale-95 transition-transform"
        title="Add Block"
      >
        <Plus className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-zinc-700 mx-1 flex-shrink-0" />

      {/* Formatting Shortcuts */}
      <button
        onClick={onToggleBold}
        className="flex-shrink-0 p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        onClick={onToggleItalic}
        className="flex-shrink-0 p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        onClick={onToggleH1}
        className="flex-shrink-0 p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors font-bold text-xs"
        title="Heading 1"
      >
        H1
      </button>

      <button
        onClick={onToggleH2}
        className="flex-shrink-0 p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors font-bold text-xs"
        title="Heading 2"
      >
        H2
      </button>

      <button
        onClick={onToggleTask}
        className="flex-shrink-0 p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
        title="To-Do Task"
      >
        <CheckSquare className="w-4 h-4 text-emerald-400" />
      </button>

      <button
        onClick={onToggleBullet}
        className="flex-shrink-0 p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        onClick={onToggleCode}
        className="flex-shrink-0 p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
        title="Code Block"
      >
        <Code className="w-4 h-4 text-pink-400" />
      </button>

      <button
        className="flex-shrink-0 p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
        title="Mention"
      >
        <AtSign className="w-4 h-4 text-sky-400" />
      </button>

      <button
        className="flex-shrink-0 p-2 rounded-lg text-zinc-300 hover:bg-zinc-800 active:bg-zinc-700 transition-colors"
        title="Highlight"
      >
        <Highlighter className="w-4 h-4 text-amber-400" />
      </button>
    </div>
  );
}
