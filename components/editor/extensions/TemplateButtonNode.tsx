// components/editor/extensions/TemplateButtonNode.tsx
// Notion-style Reusable Block Template Generator Button Node (/template).

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React from "react";
import { Plus, Sparkles } from "lucide-react";

interface TemplateButtonProps {
  node: {
    attrs: {
      buttonText?: string;
      templateType?: string;
    };
  };
  editor: any;
}

function TemplateButtonComponent({ node, editor }: TemplateButtonProps) {
  const buttonText = node.attrs.buttonText || "Add New Task Item";
  const templateType = node.attrs.templateType || "task";

  const handleInsertTemplate = () => {
    if (!editor) return;

    if (templateType === "task") {
      editor.chain().focus().insertContent({
        type: "taskList",
        content: [
          {
            type: "taskItem",
            attrs: { checked: false },
            content: [{ type: "paragraph", content: [{ type: "text", text: "New Action Task Item" }] }],
          },
        ],
      }).run();
    } else if (templateType === "meeting") {
      editor.chain().focus().insertContent({
        type: "callout",
        attrs: { emoji: "🎙️" },
        content: [{ type: "text", text: "Meeting Agenda & Action Items" }],
      }).run();
    } else {
      editor.chain().focus().insertContent("\n\nNew Block Template Item").run();
    }
  };

  return (
    <NodeViewWrapper className="my-3 select-none">
      <button
        onClick={handleInsertTemplate}
        className="w-full py-2.5 px-4 bg-[#1e1e24] hover:bg-[#282830] border border-[#2e2e38] hover:border-purple-500/50 rounded-xl text-xs font-bold text-gray-200 transition flex items-center justify-center gap-2 group shadow-md"
      >
        <Plus className="w-4 h-4 text-purple-400 group-hover:scale-110 transition" />
        <span>{buttonText}</span>
      </button>
    </NodeViewWrapper>
  );
}

export const TemplateButtonNode = Node.create({
  name: "templateButton",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      buttonText: { default: "Add New Item" },
      templateType: { default: "task" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="template-button"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "template-button" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TemplateButtonComponent as any);
  },
});
