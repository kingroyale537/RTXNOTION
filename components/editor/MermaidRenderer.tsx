// components/editor/MermaidRenderer.tsx
// Live renderer for Mermaid.js charts and structural flowcharts.

"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: true,
  theme: "dark",
  securityLevel: "loose",
  themeVariables: {
    background: "#1a1a1a",
    primaryColor: "#2563eb",
    primaryTextColor: "#fff",
    lineColor: "#3c3c3c",
  },
});

interface Props {
  chart: string;
}

export function MermaidRenderer({ chart }: Props) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const uniqueId = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    async function renderChart() {
      if (!chart.trim()) return;
      try {
        setError(null);
        const { svg: renderedSvg } = await mermaid.render(uniqueId, chart);
        if (isMounted) {
          setSvg(renderedSvg);
        }
      } catch (err: any) {
        console.error("Mermaid Render Error:", err);
        if (isMounted) {
          setError("Failed to parse diagram syntax.");
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg text-red-400 text-xs font-mono">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className="mermaid-svg-container bg-[#141414] border border-[#2c2c2c] rounded-xl p-4 flex justify-center items-center overflow-auto max-h-[350px]"
      dangerouslySetInnerHTML={{ __html: svg || '<span class="text-xs text-gray-500 animate-pulse">Rendering diagram...</span>' }}
    />
  );
}
