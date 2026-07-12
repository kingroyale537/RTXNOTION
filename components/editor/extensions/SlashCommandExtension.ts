// components/editor/extensions/SlashCommandExtension.ts
// Custom TipTap extension that listens for "/" at the start of a blank line
// and fires a custom event the SlashCommandMenu component subscribes to.

import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

export interface SlashCommandOptions {
  /** Called with the query string (text after "/") and the from position */
  onTrigger: (query: string, from: number) => void;
  /** Called when the menu should close (cursor moved away, Escape, etc.) */
  onDismiss: () => void;
}

const PLUGIN_KEY = new PluginKey("slashCommand");

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slashCommand",

  addOptions() {
    return {
      onTrigger: () => {},
      onDismiss: () => {},
    };
  },

  addProseMirrorPlugins() {
    const { onTrigger, onDismiss } = this.options;

    return [
      new Plugin({
        key: PLUGIN_KEY,
        props: {
          handleKeyDown(view, event) {
            // Close menu on Escape
            if (event.key === "Escape") {
              onDismiss();
              return false;
            }
            return false;
          },
        },
        view() {
          return {
            update(view) {
              const { state } = view;
              const { selection } = state;
              const { $from } = selection;

              // Only trigger on empty-ish lines
              const textBefore = $from.parent.textContent.slice(
                0,
                $from.parentOffset
              );

              const slashIndex = textBefore.lastIndexOf("/");

              if (slashIndex === -1) {
                onDismiss();
                return;
              }

              // Check that the "/" is at the very start of the node or preceded by whitespace
              const charBeforeSlash = textBefore[slashIndex - 1];
              if (slashIndex > 0 && charBeforeSlash && !/\s/.test(charBeforeSlash)) {
                onDismiss();
                return;
              }

              const query = textBefore.slice(slashIndex + 1);
              // Only valid if query is short and has no spaces
              if (query.includes(" ") || query.length > 30) {
                onDismiss();
                return;
              }

              const from = $from.pos - query.length - 1; // position of "/"
              onTrigger(query, from);
            },
          };
        },
      }),
    ];
  },
});
