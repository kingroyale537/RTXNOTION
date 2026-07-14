"use client";

// app/editor-widget/page.tsx
// Interactive Drag-and-Drop Editor Canvas with dynamic column splits & collapses.

import React, { useState, useRef, useEffect } from "react";
import {
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  GripVertical,
  Activity,
  Heading2,
  CheckSquare,
  FileText,
  List,
  Columns,
  Sparkles,
  Info
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type BlockType = "h2" | "paragraph" | "todo" | "bullet";

interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean;
}

interface Column {
  id: string;
  blocks: Block[];
}

interface RowItem {
  id: string;
  type: "row";
  columns: Column[];
}

type LayoutItem = Block | RowItem;

interface DragLog {
  time: string;
  message: string;
}

// ── Mock Initial Blocks ──────────────────────────────────────────────────────
const INITIAL_BLOCKS: LayoutItem[] = [
  {
    id: "block-1",
    type: "h2",
    content: "Getting Started with Projects",
  },
  {
    id: "block-2",
    type: "paragraph",
    content:
      "Drag this text block to the right edge of the header or the list item below to create a multi-column split.",
  },
  {
    id: "block-3",
    type: "paragraph",
    content: "This is another piece of contextual text to experiment with.",
  },
  {
    id: "block-4",
    type: "todo",
    content: "Try splitting this line into a column layout.",
    checked: false,
  },
];

const RANDOM_TEXTS: { type: BlockType; content: string }[] = [
  { type: "h2", content: "Design Specifications" },
  { type: "paragraph", content: "Review typography guidelines and contrast tokens." },
  { type: "todo", content: "Publish design audit draft" },
  { type: "bullet", content: "Create visual layout tests" },
  { type: "paragraph", content: "Multi-column structures improve workspace density." },
  { type: "bullet", content: "Review Yjs sync status" },
];

export default function EditorWidgetPage() {
  const [layout, setLayout] = useState<LayoutItem[]>(() => JSON.parse(JSON.stringify(INITIAL_BLOCKS)));
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [hoverState, setHoverState] = useState<{
    targetId: string;
    zone: "left" | "right" | "top" | "bottom";
    rect: DOMRect;
  } | null>(null);
  const [logs, setLogs] = useState<DragLog[]>([]);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Block | null>(null);

  // Add Log helper
  const addLog = (message: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [{ time, message }, ...prev.slice(0, 15)]);
  };

  // Find and remove block in layout tree
  const removeBlock = (items: LayoutItem[], blockId: string): { newItems: LayoutItem[]; removedBlock: Block | null } => {
    let removedBlock: Block | null = null;
    const newItems: LayoutItem[] = [];

    for (const item of items) {
      if (item.type !== "row") {
        if (item.id === blockId) {
          removedBlock = item;
        } else {
          newItems.push(item);
        }
      } else {
        // Search inside row columns
        const newCols: Column[] = [];
        for (const col of item.columns) {
          const { newItems: colBlocks, removedBlock: found } = removeBlock(col.blocks, blockId);
          if (found) removedBlock = found;
          
          if (colBlocks.length > 0) {
            newCols.push({ ...col, blocks: colBlocks as Block[] });
          }
        }

        // Keep the row if columns are still valid
        if (newCols.length > 1) {
          newItems.push({ ...item, columns: newCols });
        } else if (newCols.length === 1) {
          // Collapse row containing only 1 column back to parent hierarchy
          newItems.push(...newCols[0].blocks);
        }
      }
    }
    return { newItems, removedBlock };
  };

  // Insert block into tree based on target and drop zone
  const insertBlock = (
    items: LayoutItem[],
    dragged: Block,
    targetId: string,
    zone: "left" | "right" | "top" | "bottom"
  ): LayoutItem[] => {
    const newItems: LayoutItem[] = [];

    for (const item of items) {
      if (item.type !== "row") {
        if (item.id === targetId) {
          if (zone === "top") {
            newItems.push(dragged, item);
          } else if (zone === "bottom") {
            newItems.push(item, dragged);
          } else if (zone === "left") {
            // Split into 2-column row
            newItems.push({
              id: `row-${Date.now()}`,
              type: "row",
              columns: [
                { id: `col-${Date.now()}-1`, blocks: [dragged] },
                { id: `col-${Date.now()}-2`, blocks: [item] },
              ],
            });
          } else if (zone === "right") {
            // Split into 2-column row
            newItems.push({
              id: `row-${Date.now()}`,
              type: "row",
              columns: [
                { id: `col-${Date.now()}-1`, blocks: [item] },
                { id: `col-${Date.now()}-2`, blocks: [dragged] },
              ],
            });
          }
        } else {
          newItems.push(item);
        }
      } else {
        // Check if target is inside columns
        const isTargetInRow = item.columns.some((col) => col.blocks.some((b) => b.id === targetId));

        if (isTargetInRow) {
          const newCols: Column[] = [];
          
          for (const col of item.columns) {
            const hasTarget = col.blocks.some((b) => b.id === targetId);

            if (hasTarget) {
              if (zone === "top" || zone === "bottom") {
                // Regular vertical insert inside this specific column
                const newColBlocks = insertBlock(col.blocks, dragged, targetId, zone) as Block[];
                newCols.push({ ...col, blocks: newColBlocks });
              } else {
                // Left or Right drop splits this row into another column!
                if (zone === "left") {
                  newCols.push(
                    { id: `col-split-${Date.now()}-1`, blocks: [dragged] },
                    col
                  );
                } else {
                  newCols.push(
                    col,
                    { id: `col-split-${Date.now()}-2`, blocks: [dragged] }
                  );
                }
              }
            } else {
              newCols.push(col);
            }
          }
          newItems.push({ ...item, columns: newCols });
        } else {
          // Recursively process row columns in case target is deeper
          const processedCols = item.columns.map((col) => ({
            ...col,
            blocks: insertBlock(col.blocks, dragged, targetId, zone) as Block[],
          }));
          newItems.push({ ...item, columns: processedCols });
        }
      }
    }
    return newItems;
  };

  // Drag Start Handler
  const handleDragStart = (e: React.PointerEvent, block: Block) => {
    e.preventDefault();
    dragRef.current = block;
    setActiveDragId(block.id);
    setIsDragging(true);
    addLog(`Started dragging block: "${block.content.slice(0, 20)}..."`);

    // Initial cursor tracking offsets
    setDragOffset({ x: e.clientX, y: e.clientY });
  };

  // Global Pointer Events
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      setDragOffset({ x: e.clientX, y: e.clientY });
    };

    const handlePointerUp = () => {
      if (!isDragging) return;

      if (activeDragId && hoverState && dragRef.current) {
        const draggedBlock = dragRef.current;
        const targetId = hoverState.targetId;
        const zone = hoverState.zone;

        addLog(`Dropped block "${draggedBlock.content.slice(0, 15)}..." to ${zone} of Target "${targetId}"`);

        setLayout((prev) => {
          // 1. Remove the dragged block from its old position
          const { newItems: layoutWithoutDragged, removedBlock } = removeBlock(prev, draggedBlock.id);
          if (!removedBlock) return prev;

          // 2. Insert into its new position
          return insertBlock(layoutWithoutDragged, removedBlock, targetId, zone);
        });
      }

      // Reset states
      setIsDragging(false);
      setActiveDragId(null);
      setHoverState(null);
      dragRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, activeDragId, hoverState]);

  // Pointer Over Handler per block
  const handleBlockPointerMove = (e: React.PointerEvent, targetId: string) => {
    if (!isDragging || activeDragId === targetId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = (e.clientX - rect.left) / rect.width;
    const relativeY = (e.clientY - rect.top) / rect.height;

    let zone: "left" | "right" | "top" | "bottom" = "bottom";

    // Split target into quadrants (25% left/right, top/bottom elsewhere)
    if (relativeX < 0.25) {
      zone = "left";
    } else if (relativeX > 0.75) {
      zone = "right";
    } else {
      zone = relativeY < 0.5 ? "top" : "bottom";
    }

    setHoverState({
      targetId,
      zone,
      rect,
    });
  };

  const handleBlockPointerLeave = () => {
    setHoverState(null);
  };

  // Reset Canvas Action
  const handleReset = () => {
    setLayout(JSON.parse(JSON.stringify(INITIAL_BLOCKS)));
    setHoverState(null);
    setLogs([]);
    addLog("Canvas state reset to initial list.");
  };

  // Add Random Block Action
  const handleAddRandomBlock = () => {
    const template = RANDOM_TEXTS[Math.floor(Math.random() * RANDOM_TEXTS.length)];
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type: template.type,
      content: template.content,
      checked: template.type === "todo" ? false : undefined,
    };

    setLayout((prev) => [...prev, newBlock]);
    addLog(`Added random block: [${newBlock.type.toUpperCase()}] "${newBlock.content.slice(0, 15)}..."`);
  };

  // Toggle todo item checked status
  const handleToggleTodo = (id: string) => {
    const toggleInItems = (items: LayoutItem[]): LayoutItem[] => {
      return items.map((item) => {
        if (item.type !== "row") {
          if (item.id === id) {
            return { ...item, checked: !item.checked };
          }
          return item;
        } else {
          return {
            ...item,
            columns: item.columns.map((col) => ({
              ...col,
              blocks: toggleInItems(col.blocks) as Block[],
            })),
          };
        }
      });
    };
    setLayout((prev) => toggleInItems(prev));
  };

  // Delete specific block manually
  const handleDeleteBlock = (id: string) => {
    setLayout((prev) => {
      const { newItems } = removeBlock(prev, id);
      return newItems;
    });
    addLog(`Deleted block: "${id}"`);
  };

  // Calculate indicator coordinates relative to workspace
  const getIndicatorStyle = () => {
    if (!hoverState || !workspaceRef.current) return { display: "none" };

    const workspaceRect = workspaceRef.current.getBoundingClientRect();
    const { rect, zone } = hoverState;

    const top = rect.top - workspaceRect.top;
    const left = rect.left - workspaceRect.left;
    const width = rect.width;
    const height = rect.height;

    // Glowing blue line styles
    const thick = 4;
    const offset = 2;

    switch (zone) {
      case "top":
        return {
          top: top - offset,
          left,
          width,
          height: thick,
          display: "block",
        };
      case "bottom":
        return {
          top: top + height - offset,
          left,
          width,
          height: thick,
          display: "block",
        };
      case "left":
        return {
          top,
          left: left - offset,
          width: thick,
          height,
          display: "block",
        };
      case "right":
        return {
          top,
          left: left + width - offset,
          width: thick,
          height,
          display: "block",
        };
      default:
        return { display: "none" };
    }
  };

  // Render a block item inside workspace
  const renderBlock = (block: Block) => {
    const isDraggingThis = activeDragId === block.id;

    return (
      <div
        key={block.id}
        onPointerMove={(e) => handleBlockPointerMove(e, block.id)}
        onPointerLeave={handleBlockPointerLeave}
        className={`group/block relative p-3.5 pl-9 rounded-xl border border-transparent hover:bg-[#1a1f2c]/50 hover:border-[#2d3748]/50 transition duration-150 flex items-start gap-3 select-none ${
          isDraggingThis ? "opacity-30 border-dashed border-[#4f46e5]/40" : ""
        }`}
      >
        {/* Six-dot Drag Handle on hover */}
        <div
          onPointerDown={(e) => handleDragStart(e, block)}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[#2d3748]/50 text-gray-500 opacity-0 group-hover/block:opacity-100 transition duration-150 flex items-center justify-center"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </div>

        {/* Dynamic block content by type */}
        <div className="flex-1 min-w-0">
          {block.type === "h2" && (
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Heading2 className="h-5 w-5 text-indigo-400 flex-shrink-0" />
              {block.content}
            </h2>
          )}

          {block.type === "paragraph" && (
            <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal flex items-start gap-2">
              <FileText className="h-4 w-4 text-emerald-400 mt-1 flex-shrink-0" />
              {block.content}
            </p>
          )}

          {block.type === "todo" && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={block.checked || false}
                onChange={() => handleToggleTodo(block.id)}
                className="h-4.5 w-4.5 rounded border-gray-600 bg-gray-800 text-indigo-500 focus:ring-indigo-500/30 cursor-pointer"
              />
              <span
                className={`text-sm sm:text-base font-semibold ${
                  block.checked ? "line-through text-gray-500" : "text-white"
                }`}
              >
                {block.content}
              </span>
            </div>
          )}

          {block.type === "bullet" && (
            <div className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <span className="text-sm sm:text-base text-gray-300 leading-relaxed">{block.content}</span>
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={() => handleDeleteBlock(block.id)}
          className="p-1 rounded text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover/block:opacity-100 transition duration-150"
          title="Delete block"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  // Render a layout item (single block or multi-column Row)
  const renderLayoutItem = (item: LayoutItem) => {
    if (item.type !== "row") {
      return renderBlock(item);
    }

    // Render Row with columns
    return (
      <div key={item.id} className="w-full flex flex-col md:flex-row gap-6 p-2 rounded-xl bg-[#111622]/40 border border-[#1e293b]/50 relative group/row">
        {item.columns.map((col, cIdx) => (
          <div key={col.id} className="flex-1 flex flex-col gap-3 min-w-0 relative">
            {/* Column Label */}
            <div className="absolute top-[-10px] right-2 text-[9px] font-bold text-gray-500 bg-[#0b0f19] px-1 rounded select-none opacity-40 group-hover/row:opacity-100 transition">
              Col {cIdx + 1}
            </div>
            
            {col.blocks.map((block) => renderBlock(block))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-gray-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-white">
      {/* ── Title Header ──────────────────────────────────────────────────────── */}
      <header className="w-full border-b border-[#1f2937]/60 bg-[#0d131f]/90 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-400 text-black">
            <Zap className="h-4.5 w-4.5 fill-current" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              Voltaic Layouts
              <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded-full">Beta</span>
            </h1>
            <p className="text-[10px] text-gray-400">Interactive block-based editor canvas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleAddRandomBlock}
            className="flex items-center gap-1.5 bg-[#2383e2] hover:bg-[#1f75cb] text-white px-3 py-1.5 rounded-lg text-xs font-semibold border-none transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Block
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 bg-[#2c2c2c] hover:bg-[#3d3d3d] text-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            title="Reset to initial state"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </header>

      {/* ── Main Layout Workspace ─────────────────────────────────────────────── */}
      <div className="flex-1 w-full flex flex-col lg:flex-row min-h-0">
        
        {/* ── Sidebar Controls ────────────────────────────────────────────────── */}
        <aside className="w-full lg:w-[350px] border-r border-[#1f2937]/50 bg-[#0d131f]/80 p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Section 1: Template Toolbox */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
              Layout Toolbox
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  const b: Block = { id: `block-${Date.now()}`, type: "h2", content: "Section Header" };
                  setLayout((prev) => [...prev, b]);
                  addLog("Added Heading 2 to canvas");
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#131a26]/60 border border-[#232d3d]/50 hover:bg-[#1f2c41] transition text-left text-xs font-medium"
              >
                <Heading2 className="h-4 w-4 text-indigo-400" />
                Heading 2
              </button>
              <button
                onClick={() => {
                  const b: Block = { id: `block-${Date.now()}`, type: "paragraph", content: "Write document details here..." };
                  setLayout((prev) => [...prev, b]);
                  addLog("Added Paragraph to canvas");
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#131a26]/60 border border-[#232d3d]/50 hover:bg-[#1f2c41] transition text-left text-xs font-medium"
              >
                <FileText className="h-4 w-4 text-emerald-400" />
                Paragraph
              </button>
              <button
                onClick={() => {
                  const b: Block = { id: `block-${Date.now()}`, type: "todo", content: "Complete task list item", checked: false };
                  setLayout((prev) => [...prev, b]);
                  addLog("Added Todo item to canvas");
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#131a26]/60 border border-[#232d3d]/50 hover:bg-[#1f2c41] transition text-left text-xs font-medium"
              >
                <CheckSquare className="h-4 w-4 text-pink-400" />
                Todo Check
              </button>
              <button
                onClick={() => {
                  const b: Block = { id: `block-${Date.now()}`, type: "bullet", content: "Key bullet point" };
                  setLayout((prev) => [...prev, b]);
                  addLog("Added Bullet to canvas");
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-[#131a26]/60 border border-[#232d3d]/50 hover:bg-[#1f2c41] transition text-left text-xs font-medium"
              >
                <List className="h-4 w-4 text-amber-400" />
                Bullet List
              </button>
            </div>
          </div>

          {/* Section 2: Active Layout Metrics */}
          <div className="p-4 rounded-xl bg-[#131a26]/40 border border-[#1e293b]/60 space-y-2">
            <h4 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
              <Columns className="h-4 w-4 text-indigo-400" />
              Layout Tree Info
            </h4>
            <p className="text-[10px] text-gray-400 leading-relaxed">
              Drag content blocks by their left handle grid. Hover over the leftmost 25% or rightmost 25% of any target block to trigger a dynamic vertical column split.
            </p>
          </div>

          {/* Section 3: Live Action logs */}
          <div className="flex-1 flex flex-col gap-2 min-h-[150px]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-indigo-400" />
              Activity Log
            </h3>
            <div className="flex-1 bg-[#090e17] rounded-xl border border-[#1f2937]/40 p-4 font-mono text-[9px] overflow-y-auto space-y-2 max-h-[220px]">
              {logs.length === 0 ? (
                <p className="text-gray-600 italic">No events logged yet. Drag blocks to begin...</p>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-gray-400 border-b border-[#1f2937]/20 pb-1.5">
                    <span className="text-indigo-400 font-bold flex-shrink-0">[{log.time}]</span>
                    <span className="leading-normal">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Section 4: Live State Viewer */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              Live State Tree
            </h3>
            <div className="bg-[#090e17] rounded-xl border border-[#1f2937]/40 p-3 font-mono text-[9px] text-[#00ffcc] overflow-x-auto overflow-y-auto max-h-[150px]">
              <pre>{JSON.stringify(layout.map(item => {
                if (item.type === "row") {
                  return { ROW: item.columns.map(c => `COL (${c.blocks.map(b => b.type).join(", ")})`) };
                }
                return item.type;
              }), null, 2)}</pre>
            </div>
          </div>
        </aside>

        {/* ── Main Canvas Workspace ───────────────────────────────────────────── */}
        <main className="flex-1 bg-[#090c13] p-8 flex flex-col items-center justify-start overflow-y-auto relative">
          
          <div className="w-full max-w-4xl space-y-8 relative">
            
            {/* Guide Info Banner */}
            <div className="flex gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-indigo-300">
              <Info className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold block mb-0.5">Interaction Instructions</span>
                Drag individual items using the <strong>6-dot grip handle</strong> that appears on block hover. Hovering over a block's side margins creates blue split overlays to form side-by-side columns.
              </div>
            </div>

            {/* Bounding Area / Drag Container */}
            <div
              ref={workspaceRef}
              className="w-full min-h-[450px] p-6 rounded-2xl bg-[#0e1320] border border-[#1e293b]/60 relative flex flex-col gap-4 shadow-xl"
            >
              {layout.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-500 select-none">
                  <p className="font-bold text-sm">Workspace empty</p>
                  <p className="text-xs text-gray-600 mt-1">Use the headers or sidebar tools to spawn new content blocks.</p>
                </div>
              ) : (
                layout.map((item) => renderLayoutItem(item))
              )}

              {/* Bounding Bbox Drop Indicator Line */}
              <div
                className="absolute bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] rounded pointer-events-none transition-all duration-75 z-30"
                style={getIndicatorStyle()}
              />
            </div>

          </div>
        </main>

      </div>
    </div>
  );
}
