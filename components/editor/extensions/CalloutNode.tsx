// components/editor/extensions/CalloutNode.tsx
// Notion-style Callout Box Extension Node with customizable icon and background tinting.

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import React, { useState } from "react";

interface CalloutComponentProps {
  node: {
    attrs: {
      emoji?: string;
      bgColor?: string;
    };
  };
  updateAttributes: (attrs: { emoji?: string; bgColor?: string }) => void;
}

const EMOJIS = ["💡", "⚠️", "📌", "🚀", "ℹ️", "🎯", "🔥", "✨", "🔑", "⭐"];

function CalloutComponent({ node, updateAttributes }: CalloutComponentProps) {
  const [showPicker, setShowPicker] = useState(false);
  const emoji = node.attrs.emoji || "💡";

  return (
    <NodeViewWrapper className="my-4 p-4 rounded-xl border border-[#2e2e36] bg-[#1a1a20]/80 flex items-start gap-3 relative group">
      {/* Clickable Emoji Icon Picker */}
      <div className="relative select-none flex-shrink-0">
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="text-lg p-1 hover:bg-[#282832] rounded transition cursor-pointer"
          title="Change Callout Icon"
        >
          {emoji}
        </button>

        {showPicker && (
          <div className="absolute top-full left-0 mt-1.5 p-2 bg-[#222228] border border-[#303038] rounded-xl shadow-2xl z-50 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  updateAttributes({ emoji: e });
                  setShowPicker(false);
                }}
                className="text-base p-1 hover:bg-[#32323c] rounded transition"
              >
                {e}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Editable Callout Content Area */}
      <div className="flex-1 min-w-0 text-sm leading-relaxed text-gray-200">
        <NodeViewContent className="outline-none" />
      </div>
    </NodeViewWrapper>
  );
}

export const CalloutNode = Node.create({
  name: "callout",

  group: "block",

  content: "inline*",

  addAttributes() {
    return {
      emoji: {
        default: "💡",
      },
      bgColor: {
        default: "#1a1a20",
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="callout"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "callout" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent as any);
  },
});
