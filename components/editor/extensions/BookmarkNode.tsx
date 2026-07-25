// components/editor/extensions/BookmarkNode.tsx
// Notion-style Web Bookmark Card Extension Node (/bookmark).
// Renders rich web page preview cards with title, description, domain icon, and URL preview.

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React, { useState } from "react";
import { ExternalLink, Globe } from "lucide-react";

interface BookmarkProps {
  node: {
    attrs: {
      url?: string;
      title?: string;
      description?: string;
    };
  };
  updateAttributes: (attrs: { url?: string; title?: string; description?: string }) => void;
}

function BookmarkComponent({ node, updateAttributes }: BookmarkProps) {
  const [inputUrl, setInputUrl] = useState(node.attrs.url || "");
  const [isEditing, setIsEditing] = useState(!node.attrs.url);

  const url = node.attrs.url;
  const domain = url ? new URL(url).hostname : "";

  const handleSave = () => {
    if (!inputUrl.trim()) return;
    let formattedUrl = inputUrl.trim();
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = `https://${formattedUrl}`;
    }
    const cleanDomain = new URL(formattedUrl).hostname;
    updateAttributes({
      url: formattedUrl,
      title: `${cleanDomain} - Resource Link`,
      description: `Saved web bookmark from ${cleanDomain}`,
    });
    setIsEditing(false);
  };

  return (
    <NodeViewWrapper className="my-4 select-none">
      {isEditing ? (
        <div className="flex items-center gap-2 p-3 bg-[#18181c] border border-[#2a2a32] rounded-xl text-xs">
          <Globe className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Paste web URL (e.g. https://github.com/..."
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="flex-1 bg-transparent text-white outline-none font-mono"
          />
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition"
          >
            Create Bookmark
          </button>
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 bg-[#18181c] hover:bg-[#202026] border border-[#2a2a32] hover:border-purple-500/50 rounded-2xl transition group shadow-lg"
        >
          <div className="flex flex-col space-y-1 min-w-0 pr-4">
            <h4 className="text-sm font-bold text-gray-200 group-hover:text-purple-300 transition truncate">
              {node.attrs.title || url}
            </h4>
            <p className="text-xs text-gray-400 line-clamp-1">
              {node.attrs.description || url}
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[11px] text-gray-500 font-mono">
              <Globe className="w-3 h-3 text-purple-400" />
              <span>{domain}</span>
            </div>
          </div>

          <div className="p-2 bg-[#25252d] group-hover:bg-purple-600 text-gray-400 group-hover:text-white rounded-xl transition flex-shrink-0">
            <ExternalLink className="w-4 h-4" />
          </div>
        </a>
      )}
    </NodeViewWrapper>
  );
}

export const BookmarkNode = Node.create({
  name: "bookmark",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      url: { default: null },
      title: { default: null },
      description: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="bookmark"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "bookmark" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BookmarkComponent as any);
  },
});
