// app/(main)/[workspaceSlug]/databases/page.tsx
// Interactive Database View with AI Property Columns (Summary, Translation, Sentiment, Action Items) and Prompted Database Generation.

"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Sparkles, Database, Plus, Table, Play, Loader2, Filter, Sliders, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface DbColumn {
  id: string;
  name: string;
  type: string; // text | select | date | AI_SUMMARY | AI_TRANSLATE | AI_SENTIMENT | AI_CUSTOM_PROMPT
  options?: string[];
  customPrompt?: string;
}

interface DbRow {
  id: string;
  data: Record<string, any>;
}

export default function DatabasesPage() {
  const params = useParams();
  const [dbPrompt, setDbPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [autofillingRowId, setAutofillingRowId] = useState<string | null>(null);

  const [dbName, setDbName] = useState("Product Roadmap & User Feedback");
  const [columns, setColumns] = useState<DbColumn[]>([
    { id: "title", name: "Feature / Feedback", type: "title" },
    { id: "status", name: "Status", type: "select", options: ["In Backlog", "In Progress", "Completed"] },
    { id: "priority", name: "Priority", type: "select", options: ["High", "Medium", "Low"] },
    { id: "ai_summary", name: "AI Summary", type: "AI_SUMMARY" },
    { id: "ai_sentiment", name: "AI Sentiment", type: "AI_SENTIMENT" },
  ]);

  const [rows, setRows] = useState<DbRow[]>([
    {
      id: "row-1",
      data: {
        title: "Add offline continuous voice notes recording",
        status: "In Progress",
        priority: "High",
        ai_summary: "Enables background audio capture on mobile while screen locked.",
        ai_sentiment: "Urgent",
      },
    },
    {
      id: "row-2",
      data: {
        title: "Universal search Q&A connector for Slack and Google Drive",
        status: "In Backlog",
        priority: "Medium",
        ai_summary: "Allows workspace wide retrieval with source citations.",
        ai_sentiment: "Positive",
      },
    },
  ]);

  // Handle Prompted Database Generation (Pillar 3)
  async function handleGenerateDatabase() {
    if (!dbPrompt.trim() || isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "generateDatabase",
          prompt: dbPrompt.trim(),
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setDbName(json.data.name || "AI Generated Database");
        setColumns(json.data.schema || columns);
        setRows(
          (json.data.initialRows || []).map((r: any, idx: number) => ({
            id: `gen-row-${idx}`,
            data: r,
          }))
        );
        toast.success(`Generated database "${json.data.name}"!`);
        setDbPrompt("");
      } else {
        toast.error("Failed to generate database layout.");
      }
    } catch {
      toast.error("Something went wrong generating database.");
    } finally {
      setIsGenerating(false);
    }
  }

  // Handle AI Property Column Autofill (Pillar 3)
  async function handleAutofillCell(rowId: string, col: DbColumn) {
    const targetRow = rows.find((r) => r.id === rowId);
    if (!targetRow) return;

    setAutofillingRowId(rowId);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "autofillColumn",
          columnType: col.type,
          customPrompt: col.customPrompt,
          rowData: targetRow.data,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data?.value) {
        setRows((prev) =>
          prev.map((r) =>
            r.id === rowId ? { ...r, data: { ...r.data, [col.id]: json.data.value } } : r
          )
        );
        toast.success(`Autofilled ${col.name}!`);
      } else {
        toast.error("Could not compute cell value.");
      }
    } catch {
      toast.error("Failed to run AI Property Autofill.");
    } finally {
      setAutofillingRowId(null);
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 text-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="h-5 w-5 text-purple-400" />
            {dbName}
          </h1>
          <p className="text-xs text-gray-400">Structured tables with AI Properties, Custom Autofill Prompts & AI Layout Generation</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              const newRowId = `row-${Date.now()}`;
              setRows([...rows, { id: newRowId, data: { title: "New Item", status: "In Backlog", priority: "Low" } }]);
              toast.success("New row added!");
            }}
            className="bg-[#2563eb] hover:bg-[#2563eb]/90 text-white text-xs h-8 px-3 rounded-lg"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Row
          </Button>
        </div>
      </div>

      {/* Prompted Database Generation Box */}
      <div className="bg-[#1e1e1e] border border-[#2c2c2c] rounded-xl p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-purple-400" /> Prompted Database Generation
          </span>
          <span className="text-[10px] text-gray-500 font-mono">Pillar 3</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={dbPrompt}
            onChange={(e) => setDbPrompt(e.target.value)}
            placeholder="E.g., Build a CRM database for tracking enterprise leads, deal size, priority and sentiment..."
            className="flex-1 bg-[#141414] border border-[#2e2e2e] focus:border-purple-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none"
          />
          <Button
            onClick={handleGenerateDatabase}
            disabled={!dbPrompt.trim() || isGenerating}
            className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-8 px-4 rounded-lg flex items-center"
          >
            {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Play className="h-3.5 w-3.5 mr-1" />}
            Generate Layout
          </Button>
        </div>
      </div>

      {/* Database Table View */}
      <div className="border border-[#2a2a2a] rounded-xl overflow-hidden bg-[#181818]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#202020] border-b border-[#2a2a2a] text-gray-400 font-semibold">
                {columns.map((col) => (
                  <th key={col.id} className="p-3 border-r border-[#2a2a2a] min-w-[140px]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        {col.type.startsWith("AI_") && <Sparkles className="h-3 w-3 text-purple-400" />}
                        {col.name}
                      </span>
                      <span className="text-[9px] bg-[#2a2a2a] px-1.5 py-0.5 rounded text-gray-400 uppercase">{col.type}</span>
                    </div>
                  </th>
                ))}
                <th className="p-3 w-28">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-[#222222] hover:bg-[#1f1f1f] transition">
                  {columns.map((col) => (
                    <td key={col.id} className="p-3 border-r border-[#222222] text-gray-200">
                      {col.type.startsWith("AI_") ? (
                        <div className="flex items-center justify-between group">
                          <span className={r.data[col.id] ? "text-gray-200" : "text-gray-500 italic"}>
                            {r.data[col.id] || "(Click Autofill)"}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAutofillCell(r.id, col)}
                            className="p-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-[10px] flex items-center gap-1 transition ml-2"
                            title="Autofill cell with AI"
                          >
                            <Sparkles className="h-3 w-3" />
                            {autofillingRowId === r.id ? "Computing..." : "Autofill"}
                          </button>
                        </div>
                      ) : (
                        <span>{r.data[col.id] || "—"}</span>
                      )}
                    </td>
                  ))}
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setRows(rows.filter((row) => row.id !== r.id));
                        toast.success("Row deleted");
                      }}
                      className="text-gray-500 hover:text-red-400 transition text-[11px]"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
