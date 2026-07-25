// components/editor/extensions/InlineDatabaseNode.tsx
// TipTap Node Extension for embedding live interactive Database Views inline within document pages.

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React from "react";
import { DatabaseView } from "@/components/page/DatabaseView";

interface InlineDatabaseComponentProps {
  node: {
    attrs: {
      databaseId?: string;
      title?: string;
    };
  };
}

function InlineDatabaseComponent({ node }: InlineDatabaseComponentProps) {
  const databaseId = node.attrs.databaseId || "default-db";

  return (
    <NodeViewWrapper className="my-6 border border-[#2a2a2e] bg-[#141416] rounded-2xl p-4 shadow-xl select-none" data-inline-db={databaseId}>
      <div className="flex items-center justify-between mb-3 border-b border-[#242428] pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-200">📊 {node.attrs.title || "Inline Database"}</span>
          <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded font-mono">
            Embedded Block
          </span>
        </div>
      </div>
      <DatabaseView pageId={databaseId} workspaceId="" workspaceSlug="" canEdit={true} />
    </NodeViewWrapper>
  );
}

export const InlineDatabaseNode = Node.create({
  name: "inlineDatabase",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      databaseId: {
        default: null,
      },
      title: {
        default: "Inline Table",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="inline-database"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "inline-database" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineDatabaseComponent as any);
  },
});
