"use client";

import React from "react";
import { 
  Type, 
  Heading1, 
  Heading2, 
  Heading3, 
  CheckSquare, 
  List, 
  ListOrdered, 
  Code, 
  Quote, 
  Sparkles, 
  Image as ImageIcon, 
  Table, 
  X,
  MessageSquareQuote
} from "lucide-react";

interface MobileBlockPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (type: string) => void;
}

export function MobileBlockPicker({ isOpen, onClose, onSelectBlock }: MobileBlockPickerProps) {
  if (!isOpen) return null;

  const blocks = [
    { id: "text", label: "Text", description: "Just start typing with plain text.", icon: Type, color: "text-zinc-300" },
    { id: "h1", label: "Heading 1", description: "Big section heading.", icon: Heading1, color: "text-indigo-400" },
    { id: "h2", label: "Heading 2", description: "Medium section heading.", icon: Heading2, color: "text-purple-400" },
    { id: "task", label: "To-do List", description: "Track tasks with a check box.", icon: CheckSquare, color: "text-emerald-400" },
    { id: "bullet", label: "Bulleted List", description: "Create a simple bulleted list.", icon: List, color: "text-sky-400" },
    { id: "code", label: "Code Block", description: "Capture code snippet with syntax.", icon: Code, color: "text-pink-400" },
    { id: "quote", label: "Quote / Callout", description: "Make a statement or highlighted note.", icon: MessageSquareQuote, color: "text-amber-400" },
    { id: "ai", label: "Voltaic AI Assistant", description: "Ask AI to generate, summarize, or translate.", icon: Sparkles, color: "text-indigo-400" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Touch Bottom Sheet */}
      <div className="relative w-full bg-zinc-950 border-t border-zinc-800 rounded-t-2xl max-h-[75vh] flex flex-col p-4 z-10 animate-in slide-in-from-bottom duration-200 pb-safe">
        {/* Handlebar & Close Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-4 bg-indigo-500 rounded-full" />
            <h3 className="font-semibold text-sm text-zinc-100">Add Content Block</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Block Grid */}
        <div className="overflow-y-auto space-y-2 py-2">
          {blocks.map((b) => {
            const Icon = b.icon;
            return (
              <button
                key={b.id}
                onClick={() => {
                  onSelectBlock(b.id);
                  onClose();
                }}
                className="w-full flex items-center space-x-3 p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 active:scale-[0.98] transition-all text-left border border-zinc-800/50"
              >
                <div className={`p-2.5 rounded-lg bg-zinc-900 ${b.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-sm text-zinc-100">{b.label}</div>
                  <div className="text-xs text-zinc-400">{b.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
