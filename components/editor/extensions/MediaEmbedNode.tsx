// components/editor/extensions/MediaEmbedNode.tsx
// Notion-style Video, Audio, and PDF Player Extension Node (/video, /audio, /pdf).

import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper } from "@tiptap/react";
import React, { useState } from "react";
import { Video, Music, FileText, Play } from "lucide-react";

interface MediaEmbedProps {
  node: {
    attrs: {
      mediaType?: "video" | "audio" | "pdf";
      src?: string;
    };
  };
  updateAttributes: (attrs: { src?: string }) => void;
}

function MediaEmbedComponent({ node, updateAttributes }: MediaEmbedProps) {
  const mediaType = node.attrs.mediaType || "video";
  const [inputSrc, setInputSrc] = useState(node.attrs.src || "");
  const [isEditing, setIsEditing] = useState(!node.attrs.src);

  const src = node.attrs.src;

  const handleSave = () => {
    if (!inputSrc.trim()) return;
    updateAttributes({ src: inputSrc.trim() });
    setIsEditing(false);
  };

  return (
    <NodeViewWrapper className="my-4 select-none">
      {isEditing ? (
        <div className="flex items-center gap-2 p-3 bg-[#18181c] border border-[#2a2a32] rounded-xl text-xs">
          {mediaType === "video" && <Video className="w-4 h-4 text-rose-400" />}
          {mediaType === "audio" && <Music className="w-4 h-4 text-emerald-400" />}
          {mediaType === "pdf" && <FileText className="w-4 h-4 text-blue-400" />}
          <input
            type="text"
            placeholder={`Embed ${mediaType.toUpperCase()} URL...`}
            value={inputSrc}
            onChange={(e) => setInputSrc(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            className="flex-1 bg-transparent text-white outline-none font-mono"
          />
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition"
          >
            Embed Media
          </button>
        </div>
      ) : (
        <div className="bg-[#141418] border border-[#26262e] rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-[#22222a] text-xs font-bold text-gray-300">
            <span className="flex items-center gap-2">
              <Play className="w-3.5 h-3.5 text-purple-400" />
              <span>{mediaType.toUpperCase()} Player</span>
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-[10px] text-gray-400 hover:text-white transition"
            >
              Edit URL
            </button>
          </div>

          {mediaType === "video" && (
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
              {src?.includes("youtube") || src?.includes("youtu.be") ? (
                <iframe
                  src={src.replace("watch?v=", "embed/")}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : (
                <video src={src} controls className="w-full h-full rounded-xl" />
              )}
            </div>
          )}

          {mediaType === "audio" && (
            <audio src={src} controls className="w-full mt-2 rounded-lg" />
          )}

          {mediaType === "pdf" && (
            <iframe src={src} className="w-full h-96 rounded-xl border border-[#2c2c36]" />
          )}
        </div>
      )}
    </NodeViewWrapper>
  );
}

export const MediaEmbedNode = Node.create({
  name: "mediaEmbed",

  group: "block",

  atom: true,

  addAttributes() {
    return {
      mediaType: { default: "video" },
      src: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="media-embed"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "media-embed" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaEmbedComponent as any);
  },
});
