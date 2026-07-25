// components/editor/extensions/ToggleNode.tsx
// Notion-style Collapsible Toggle List Extension Node (/toggle).

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import React, { useState } from "react";
import { ChevronRight } from "lucide-react";

function ToggleComponent() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <NodeViewWrapper className="my-2 border border-[#2a2a30]/60 bg-[#16161a]/60 rounded-xl p-3 select-none">
      <div className="flex items-center gap-2 cursor-pointer text-gray-300 font-semibold text-sm">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`p-1 hover:bg-[#282830] rounded transition transform ${isOpen ? "rotate-90 text-purple-400" : "text-gray-400"}`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Toggle Section Notes</span>
      </div>

      {isOpen && (
        <div className="mt-2.5 pl-6 border-l-2 border-purple-500/30 text-sm text-gray-200">
          <NodeViewContent className="outline-none min-h-[30px]" />
        </div>
      )}
    </NodeViewWrapper>
  );
}

export const ToggleNode = Node.create({
  name: "toggle",

  group: "block",

  content: "block+",

  parseHTML() {
    return [{ tag: 'div[data-type="toggle-node"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "toggle-node" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleComponent as any);
  },
});
