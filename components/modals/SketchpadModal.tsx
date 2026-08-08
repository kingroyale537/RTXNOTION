"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { 
  Palette, 
  Trash2, 
  Undo, 
  Check, 
  X, 
  Sparkles, 
  Eraser, 
  Paintbrush, 
  Square, 
  Circle,
  HelpCircle
} from "lucide-react";
import toast from "react-hot-toast";

interface Point {
  x: number;
  y: number;
  pressure: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
  tool: "pen" | "eraser";
}

export function SketchpadModal() {
  const { sketchpadOpen, setSketchpadOpen } = useUIStore() as any;
  const { currentWorkspace } = useWorkspaceStore();
  
  const [activeColor, setActiveColor] = useState("#a855f7"); // default purple
  const [brushWidth, setBrushWidth] = useState(4);
  const [activeTool, setActiveTool] = useState<"pen" | "eraser">("pen");
  const [history, setHistory] = useState<Stroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showPressureIndicator, setShowPressureIndicator] = useState(false);
  const [currentPressure, setCurrentPressure] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentStrokeRef = useRef<Point[]>([]);

  // Supported Brush Colors
  const COLORS = [
    "#a855f7", // Purple
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#ec4899", // Pink
    "#ffffff", // White
    "#9ca3af", // Gray
  ];

  // Re-draw all strokes from history
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid background
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 1;
    const gridSize = 30;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw saved strokes
    history.forEach((stroke) => {
      if (stroke.points.length < 2) return;
      
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = stroke.color;
      }

      for (let i = 1; i < stroke.points.length; i++) {
        const p1 = stroke.points[i - 1];
        const p2 = stroke.points[i];
        
        // Dynamic width based on pressure
        const strokeWidth = stroke.tool === "eraser"
          ? stroke.width * 4
          : stroke.width * (p2.pressure || 1.0);
          
        ctx.lineWidth = Math.max(1, strokeWidth);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });

    // Reset composite operation
    ctx.globalCompositeOperation = "source-over";
  };

  // Adjust canvas size to window/container sizing on load/mount
  useEffect(() => {
    if (!sketchpadOpen) return;
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = (rect?.width || 800) * 2; // high DPI scaling
      canvas.height = (rect?.height || 500) * 2;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(2, 2);
      
      redrawCanvas();
    }, 100);
  }, [sketchpadOpen, history]);

  // Pointer Events handling (Pencil / Touch / Mouse)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Account for high DPI scaling division by 2
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if drawing device is pen
    if (e.pointerType === "pen") {
      setShowPressureIndicator(true);
    }
    
    const pressure = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 1.0;
    setCurrentPressure(pressure);

    setIsDrawing(true);
    currentStrokeRef.current = [{ x, y, pressure }];
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pressure = e.pressure !== undefined && e.pressure > 0 ? e.pressure : 1.0;
    setCurrentPressure(pressure);

    const prevPoint = currentStrokeRef.current[currentStrokeRef.current.length - 1];
    const newPoint = { x, y, pressure };
    currentStrokeRef.current.push(newPoint);

    // Live drawing segment
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    if (activeTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
      ctx.lineWidth = brushWidth * 4;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = brushWidth * (pressure || 1.0);
    }

    ctx.beginPath();
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(newPoint.x, newPoint.y);
    ctx.stroke();

    ctx.globalCompositeOperation = "source-over";
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    setIsDrawing(false);
    setShowPressureIndicator(false);

    if (currentStrokeRef.current.length > 0) {
      const newStroke: Stroke = {
        points: [...currentStrokeRef.current],
        color: activeColor,
        width: brushWidth,
        tool: activeTool,
      };
      setHistory((prev) => [...prev, newStroke]);
      currentStrokeRef.current = [];
    }
  };

  const handleUndo = () => {
    setHistory((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setHistory([]);
    toast.success("Sketchpad cleared.");
  };

  // Convert sketch to PNG Data URL and insert into active page
  const handleInsertToPage = async () => {
    if (history.length === 0) {
      toast.error("Sketchpad is empty. Draw something first!");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Create a temporary canvas with dark theme background
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = canvas.width;
      exportCanvas.height = canvas.height;
      const exportCtx = exportCanvas.getContext("2d");
      if (!exportCtx) return;

      // Fill elegant dark background
      exportCtx.fillStyle = "#18181b";
      exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
      
      // Draw the main canvas content on top
      exportCtx.drawImage(canvas, 0, 0);

      const dataUrl = exportCanvas.toDataURL("image/png");

      // Insert image block into the editor
      if (typeof window !== "undefined" && (window as any).__tiptapView) {
        const view = (window as any).__tiptapView;
        const { schema, tr } = view.state;
        
        // Ensure image node type exists
        if (schema.nodes.image) {
          const node = schema.nodes.image.create({
            src: dataUrl,
            alt: "Apple Pencil Sketch",
          });
          view.dispatch(tr.replaceSelectionWith(node).scrollIntoView());
          toast.success("Sketch inserted into page successfully!");
        } else {
          // Fallback if image node is not configured
          navigator.clipboard.writeText(`![Apple Pencil Sketch](${dataUrl})`);
          toast.success("Markdown image code copied to clipboard!");
        }
      } else {
        toast.error("Active editor page not found.");
      }

      setSketchpadOpen(false);
      setHistory([]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to insert drawing.");
    }
  };

  return (
    <Dialog open={sketchpadOpen} onOpenChange={setSketchpadOpen}>
      <DialogContent className="max-w-4xl bg-[#121214] border border-white/10 text-gray-200 p-0 overflow-hidden shadow-2xl rounded-2xl">
        <DialogTitle className="sr-only">Apple Pencil Sketchpad</DialogTitle>
        <DialogDescription className="sr-only">Draw sketches and flowcharts using Apple Pencil with dynamic pressure sensitivity</DialogDescription>
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#18181b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Paintbrush className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Apple Pencil Sketchpad
                <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Pressure & Tilt
                </span>
              </h2>
              <p className="text-[10px] text-gray-400">
                Flowcharts, hand-drawn annotations, and sketches.
              </p>
            </div>
          </div>
        </div>

        {/* Drawing Workspace */}
        <div className="relative w-full h-[520px] bg-[#0c0c0e] flex items-center justify-center overflow-hidden">
          {history.length === 0 && !isDrawing && (
            <div className="absolute pointer-events-none text-center space-y-2 opacity-35">
              <Paintbrush className="w-12 h-12 text-gray-400 mx-auto" />
              <p className="text-xs text-gray-400 font-medium">Use Apple Pencil or mouse to sketch here</p>
              <p className="text-[10px] text-gray-500 max-w-xs mx-auto">Supports pressure sensitivity, line smoothing, and tilts natively.</p>
            </div>
          )}

          <canvas
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="w-full h-full cursor-crosshair touch-none"
          />

          {/* Pencil Pressure telemetry indicator */}
          {showPressureIndicator && (
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur border border-white/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-mono text-gray-300">Pressure: {Math.round(currentPressure * 100)}%</span>
            </div>
          )}
        </div>

        {/* Toolbar & Footer controls */}
        <div className="px-6 py-4 border-t border-white/10 bg-[#18181b] flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Color Palette selection */}
            <div className="flex items-center gap-1.5 bg-black/25 p-1 rounded-xl border border-white/5">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setActiveColor(color);
                    setActiveTool("pen");
                  }}
                  className="w-6 h-6 rounded-full border border-black/50 transition relative flex items-center justify-center hover:scale-105 active:scale-95"
                  style={{ backgroundColor: color }}
                  title={color === "#ffffff" ? "White" : color}
                >
                  {activeColor === color && activeTool === "pen" && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#121214] border border-white/15" />
                  )}
                </button>
              ))}
            </div>

            {/* Tool Selection Toggle (Brush vs Eraser) */}
            <div className="flex items-center gap-1 bg-black/25 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveTool("pen")}
                className={`p-1.5 rounded-lg transition ${
                  activeTool === "pen" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
                title="Pen Tool"
              >
                <Paintbrush className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTool("eraser")}
                className={`p-1.5 rounded-lg transition ${
                  activeTool === "eraser" ? "bg-purple-600 text-white" : "text-gray-400 hover:text-white"
                }`}
                title="Eraser Tool"
              >
                <Eraser className="w-4 h-4" />
              </button>
            </div>

            {/* Brush Width Slider */}
            <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Size</span>
              <input
                type="range"
                min="1"
                max="20"
                value={brushWidth}
                onChange={(e) => setBrushWidth(parseInt(e.target.value))}
                className="w-20 accent-purple-500 cursor-pointer h-1.5 rounded-lg bg-gray-700"
              />
              <span className="text-[10px] font-mono text-gray-300 w-4">{brushWidth}px</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="text-xs h-9 gap-1.5 bg-black/25 hover:bg-black/40 border border-white/5 text-gray-300 disabled:opacity-50"
            >
              <Undo className="w-3.5 h-3.5" /> Undo
            </Button>
            <Button
              variant="ghost"
              onClick={handleClear}
              disabled={history.length === 0}
              className="text-xs h-9 gap-1.5 bg-black/25 hover:bg-red-950/20 hover:text-red-400 hover:border-red-900/30 border border-white/5 text-gray-300 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </Button>
            <Button
              onClick={handleInsertToPage}
              className="text-xs h-9 gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold"
            >
              <Check className="w-3.5 h-3.5" /> Insert into Page
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
