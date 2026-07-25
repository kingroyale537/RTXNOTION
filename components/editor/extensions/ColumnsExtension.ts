// components/editor/extensions/ColumnsExtension.ts
// TipTap Extensions for multi-column side-by-side document layouts (/2col, /3col).

import { Node, mergeAttributes } from "@tiptap/core";

export const ColumnGroup = Node.create({
  name: "columnGroup",

  group: "block",

  content: "column+",

  parseHTML() {
    return [{ tag: 'div[data-type="column-group"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "column-group",
        class: "grid grid-cols-1 md:grid-cols-2 gap-4 my-4 border-l-2 border-purple-500/30 pl-3",
      }),
      0,
    ];
  },
});

export const Column = Node.create({
  name: "column",

  content: "block+",

  parseHTML() {
    return [{ tag: 'div[data-type="column"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "column",
        class: "flex flex-col space-y-2 min-h-[50px] p-2 bg-[#1a1a1e]/40 rounded-xl border border-[#26262c]/60",
      }),
      0,
    ];
  },
});
