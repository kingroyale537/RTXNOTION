// components/editor/TableOfContents.tsx
// Renders an automatic clickable outline of all H1, H2, and H3 headings on the page.

"use client";

import { useEffect, useState } from "react";
import { ListTree, Hash } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);

  useEffect(() => {
    const updateHeadings = () => {
      const headingElements = Array.from(
        document.querySelectorAll(".ProseMirror h1, .ProseMirror h2, .ProseMirror h3")
      );

      const items: HeadingItem[] = headingElements.map((el, index) => {
        if (!el.id) {
          el.id = `heading-${index}-${el.textContent?.toLowerCase().replace(/\s+/g, "-")}`;
        }
        return {
          id: el.id,
          text: el.textContent || `Heading ${index + 1}`,
          level: parseInt(el.tagName.replace("H", ""), 10),
        };
      });

      setHeadings(items);
    };

    updateHeadings();
    const interval = setInterval(updateHeadings, 2000);
    return () => clearInterval(interval);
  }, []);

  if (headings.length === 0) {
    return (
      <div className="my-4 p-4 bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl text-xs text-gray-500 flex items-center gap-2">
        <ListTree className="w-4 h-4 text-purple-400" />
        <span>Table of Contents (Add Headings to populate outline)</span>
      </div>
    );
  }

  return (
    <div className="my-5 p-4 bg-[#1a1a1a] border border-[#2c2c2c] rounded-xl shadow-lg space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider border-b border-[#2c2c2c] pb-2">
        <ListTree className="w-4 h-4 text-purple-400" />
        <span>Table of Contents</span>
      </div>
      <div className="space-y-1.5 pt-1">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            onClick={(e) => {
              e.preventDefault();
              document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth" });
            }}
            className={cn(
              "block text-xs text-gray-400 hover:text-purple-300 transition truncate",
              h.level === 1 && "font-bold text-gray-200 pl-0",
              h.level === 2 && "pl-3 text-gray-300",
              h.level === 3 && "pl-6 text-gray-400 text-[11px]"
            )}
          >
            <span className="opacity-50 mr-1">#</span>
            {h.text}
          </a>
        ))}
      </div>
    </div>
  );
}
