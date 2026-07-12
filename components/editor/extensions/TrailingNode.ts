// components/editor/extensions/TrailingNode.ts
// Ensures there is always an empty paragraph at the end of the document
// so users can always click below content to place the cursor.

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

const PLUGIN_KEY = new PluginKey("trailingNode");

export const TrailingNode = Extension.create({
  name: "trailingNode",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: PLUGIN_KEY,
        appendTransaction(_, __, state) {
          const { doc, tr, schema } = state;
          const lastNode = doc.lastChild;

          // Already ends with an empty paragraph — nothing to do
          if (lastNode?.type === schema.nodes.paragraph && lastNode.childCount === 0) {
            return null;
          }

          // Append an empty paragraph
          const paragraph = schema.nodes.paragraph.create();
          return tr.insert(doc.content.size, paragraph);
        },
      }),
    ];
  },
});
