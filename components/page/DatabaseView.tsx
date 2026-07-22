// components/page/DatabaseView.tsx
// Renders dynamic, versatile database views (Table, Board, Calendar, Gallery) for child pages.
// Supports editable metadata properties (Status, Due Date, Priority) saved directly to PostgreSQL.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Search,
  Plus,
  FileText,
  Trash2,
  Calendar as CalendarIcon,
  Layers,
  LayoutGrid,
  Trello,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  User,
  PlusCircle,
  Tag,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageStore } from "@/store/pageStore";
import { evaluateFormula } from "@/lib/formulas";
import { ChartView } from "@/components/page/ChartView";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Props {
  pageId: string;
  workspaceId: string;
  workspaceSlug: string;
  canEdit: boolean;
}

interface PageTreeItemType {
  id: string;
  title: string;
  emoji: string | null;
  iconValue: string | null;
  updatedAt: Date;
  properties?: any;
  children?: PageTreeItemType[];
}

export function DatabaseView({ pageId, workspaceId, workspaceSlug, canEdit }: Props) {
  const router = useRouter();
  const { pageTree, addPageToTree, removePageFromTree, updatePageInTree } = usePageStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [activeView, setActiveView] = useState<"table" | "board" | "calendar" | "gallery" | "canvas">("table");

  // Helper to find the current page node in the tree to get its children
  function findNode(tree: any[], targetId: string): any | null {
    for (const node of tree) {
      if (node.id === targetId) return node;
      if (node.children) {
        const found = findNode(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  }

  const currentNode = findNode(pageTree, pageId);
  const children: PageTreeItemType[] = currentNode?.children ?? [];

  // Filter children based on search query
  const filteredChildren = children.filter((child) =>
    (child.title || "Untitled").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Property update API helper (optimistic state updates)
  async function handlePropertyChange(childId: string, field: string, value: string) {
    if (!canEdit) return;
    const child = children.find((c) => c.id === childId);
    const existingProperties = child?.properties ? { ...child.properties } : {};
    const newProperties = { ...existingProperties, [field]: value };

    // Update Zustand locally first
    updatePageInTree(childId, { properties: newProperties });

    try {
      const res = await fetch(`/api/pages/${childId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ properties: newProperties }),
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Failed to save property change");
      // Revert local state
      updatePageInTree(childId, { properties: existingProperties });
    }
  }

  // Create a new child page / note
  async function createNote(statusVal: string = "To Do") {
    if (!canEdit) return;
    try {
      const defaultProperties = {
        status: statusVal,
        priority: "Medium",
        date: new Date().toISOString().split("T")[0],
      };

      const res = await fetch(`/api/workspaces/${workspaceId}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId,
          parentId: pageId,
          title: "Untitled Note",
          emoji: "📄",
        }),
      });
      if (!res.ok) throw new Error();
      const json = await res.json();

      // Immediately patch newly created page with properties
      const patchRes = await fetch(`/api/pages/${json.data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ properties: defaultProperties }),
      });
      const patchedJson = patchRes.ok ? await patchRes.json() : null;

      const newPage = {
        ...(patchedJson?.data || json.data),
        children: [],
        properties: defaultProperties,
        _count: { children: 0 },
      };

      addPageToTree(newPage, pageId);
      toast.success("Created new note in database");
    } catch {
      toast.error("Could not create note");
    }
  }

  // Delete a note / child page
  async function deleteNote(childId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!canEdit) return;
    try {
      await fetch(`/api/pages/${childId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });
      removePageFromTree(childId);
      toast.success("Note moved to trash");
    } catch {
      toast.error("Could not delete note");
    }
  }

  // ─── Month Calendar view computations ──────────────────────────────────────
  const [calendarDate, setCalendarDate] = useState(new Date());
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(new Date(year, month, d));

  function nextMonth() { setCalendarDate(new Date(year, month + 1, 1)); }
  function prevMonth() { setCalendarDate(new Date(year, month - 1, 1)); }

  return (
    <div className="w-full bg-[#191919] min-h-[450px] border border-[#2a2a2a] rounded-xl flex flex-col overflow-hidden text-[#f3f4f6]">
      {/* ── View switcher bar ────────────────────────────────────────────── */}
      <div className="h-12 border-b border-[#2a2a2a] px-4 flex items-center justify-between bg-[#1d1d1d]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveView("table")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
              activeView === "table" ? "bg-[#2c2c2c] text-white border border-[#3c3c3c]" : "text-gray-400 hover:text-white"
            )}
          >
            <TableIcon className="h-3.5 w-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setActiveView("board")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
              activeView === "board" ? "bg-[#2c2c2c] text-white border border-[#3c3c3c]" : "text-gray-400 hover:text-white"
            )}
          >
            <Trello className="h-3.5 w-3.5" />
            <span>Board</span>
          </button>
          <button
            onClick={() => setActiveView("calendar")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
              activeView === "calendar" ? "bg-[#2c2c2c] text-white border border-[#3c3c3c]" : "text-gray-400 hover:text-white"
            )}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setActiveView("gallery")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
              activeView === "gallery" ? "bg-[#2c2c2c] text-white border border-[#3c3c3c]" : "text-gray-400 hover:text-white"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Gallery</span>
          </button>
          <button
            onClick={() => setActiveView("canvas")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all",
              activeView === "canvas" ? "bg-purple-600/20 text-purple-300 border border-purple-500/40" : "text-gray-400 hover:text-white"
            )}
          >
            <Layers className="h-3.5 w-3.5 text-purple-400" />
            <span>Canvas 🎨</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {showSearch && (
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#222] border border-[#3c3c3c] text-xs px-2 py-1 rounded outline-none w-36 text-white focus:border-[#2563eb]"
            />
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChart((v) => !v)}
            className={cn("h-8 text-xs text-gray-300 hover:bg-[#2c2c2c] gap-1", showChart && "bg-[#2c2c2c] text-blue-400")}
            title="Toggle Database Analytics Chart"
          >
            <span>Analytics 📊</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = `${window.location.origin}/public/forms/${pageId}`;
              navigator.clipboard.writeText(url);
              toast.success("Public Form link copied to clipboard!");
            }}
            className="h-8 text-xs text-purple-400 hover:bg-[#2c2c2c] gap-1"
            title="Copy Public Database Form link"
          >
            <span>Share Form 📝</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            className={cn("h-8 w-8 hover:bg-[#2c2c2c]", showSearch && "bg-[#2c2c2c]")}
            title="Search"
          >
            <Search className="h-4 w-4 text-gray-400" />
          </Button>
          <Button
            onClick={() => createNote("To Do")}
            className="h-8 bg-[#2563eb] hover:bg-[#2563eb]/90 text-xs font-bold text-white px-3 flex items-center gap-1 ml-1"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add row</span>
          </Button>
        </div>
      </div>

      {/* Render optional Database Analytics Chart */}
      {showChart && <ChartView items={filteredChildren} />}

      {/* ── Render selected active view mode ────────────────────────────── */}
      <div className="flex-1 overflow-auto p-4 bg-[#191919]">
        {/* ── 1. TABLE VIEW ── */}
        {activeView === "table" && (
          <div className="w-full border border-[#2a2a2a] rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 bg-[#222]/40 h-9 border-b border-[#2a2a2a] text-xs text-gray-500 font-bold items-center px-4">
              <span className="col-span-4">Name</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2">Due Date</span>
              <span className="col-span-1">Priority</span>
              <span className="col-span-2">Formula 2.0</span>
              <span className="col-span-1 text-right">Actions</span>
            </div>

            <div className="divide-y divide-[#2a2a2a]">
              {filteredChildren.length > 0 ? (
                filteredChildren.map((item) => {
                  const props = item.properties || {};
                  const formulaVal = evaluateFormula(
                    props.formula || "IF(prop('status') == 'Done', '✅ Complete', '⏳ Active')",
                    { status: props.status || "To Do", priority: props.priority || "Medium", ...props }
                  );

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-12 h-11 items-center px-4 hover:bg-[#222]/30 text-xs transition cursor-pointer group"
                      onClick={() => router.push(`/${workspaceSlug}/${item.id}`)}
                    >
                      <div className="col-span-4 flex items-center gap-2 pr-2">
                        <span className="text-sm">{item.iconValue ?? "📄"}</span>
                        <span className="font-semibold text-gray-200 group-hover:text-white truncate">
                          {item.title || "Untitled Note"}
                        </span>
                      </div>

                      <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={props.status || "To Do"}
                          onChange={(e) => handlePropertyChange(item.id, "status", e.target.value)}
                          className="bg-[#222] border border-[#2a2a2a] rounded px-1.5 py-0.5 text-[10px] text-gray-300 outline-none cursor-pointer focus:border-blue-500"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>

                      <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="date"
                          value={props.date || ""}
                          onChange={(e) => handlePropertyChange(item.id, "date", e.target.value)}
                          className="bg-[#222] border border-[#2a2a2a] rounded px-1 py-0.5 text-[10px] text-gray-300 outline-none cursor-pointer focus:border-blue-500 font-mono"
                        />
                      </div>

                      <div className="col-span-1" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={props.priority || "Medium"}
                          onChange={(e) => handlePropertyChange(item.id, "priority", e.target.value)}
                          className="bg-[#222] border border-[#2a2a2a] rounded px-1 py-0.5 text-[10px] text-gray-300 outline-none cursor-pointer focus:border-blue-500"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>

                      <div className="col-span-2 font-mono text-[11px] text-purple-300 truncate" title={String(formulaVal)}>
                        <span className="bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded-full">
                          {String(formulaVal)}
                        </span>
                      </div>

                      <div className="col-span-1 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => deleteNote(item.id, e)}
                          className="p-1 rounded hover:bg-[#333] text-gray-400 hover:text-red-400 transition"
                          title="Move to trash"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center text-xs text-gray-500">No entries found. Click Add row above.</div>
              )}
            </div>
          </div>
        )}

        {/* ── 2. KANBAN BOARD VIEW ── */}
        {activeView === "board" && (
          <div className="grid grid-cols-3 gap-4">
            {["To Do", "In Progress", "Done"].map((statusCol) => {
              const columnItems = filteredChildren.filter(
                (item) => (item.properties?.status || "To Do") === statusCol
              );

              return (
                <div key={statusCol} className="bg-[#222]/20 border border-[#2a2a2a]/60 rounded-xl p-3 flex flex-col min-h-[300px]">
                  <header className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          statusCol === "To Do" && "bg-gray-400",
                          statusCol === "In Progress" && "bg-blue-400",
                          statusCol === "Done" && "bg-green-400"
                        )}
                      />
                      <span className="text-xs font-bold text-gray-300">{statusCol}</span>
                      <span className="text-[10px] bg-[#2c2c2c] px-1.5 py-0.5 rounded text-gray-500 font-bold">
                        {columnItems.length}
                      </span>
                    </div>
                    <button
                      onClick={() => createNote(statusCol)}
                      className="text-gray-400 hover:text-white transition"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </header>

                  <div className="flex-1 space-y-2.5 overflow-y-auto">
                    {columnItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => router.push(`/${workspaceSlug}/${item.id}`)}
                        className="bg-[#1c1c1c] border border-[#2a2a2a] p-3 rounded-lg hover:border-gray-600 cursor-pointer transition flex flex-col gap-2 group relative"
                      >
                        <div className="flex items-start gap-1.5">
                          <span className="text-sm">{item.iconValue ?? "📄"}</span>
                          <span className="text-xs font-bold text-gray-200 group-hover:text-white leading-tight">
                            {item.title || "Untitled"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[9px] text-gray-500 mt-1">
                          {item.properties?.date ? (
                            <span className="font-mono">{item.properties.date}</span>
                          ) : (
                            <span className="text-gray-600">No Date</span>
                          )}
                          <span
                            className={cn(
                              "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                              item.properties?.priority === "High" && "bg-red-950/40 text-red-400 border border-red-500/10",
                              item.properties?.priority === "Medium" && "bg-yellow-950/40 text-yellow-400 border border-yellow-500/10",
                              item.properties?.priority === "Low" && "bg-green-950/40 text-green-400 border border-green-500/10"
                            )}
                          >
                            {item.properties?.priority || "Medium"}
                          </span>
                        </div>

                        <button
                          onClick={(e) => deleteNote(item.id, e)}
                          className="absolute top-2 right-2 p-1 rounded hover:bg-[#333] text-gray-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}

                    <button
                      onClick={() => createNote(statusCol)}
                      className="w-full h-8 flex items-center justify-center gap-1 rounded-lg border border-dashed border-[#2a2a2a] text-[10px] font-semibold text-gray-500 hover:text-gray-300 hover:border-gray-700 transition"
                    >
                      <Plus className="h-3 w-3" /> Add card
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── 3. CALENDAR VIEW ── */}
        {activeView === "calendar" && (
          <div className="flex flex-col gap-3">
            <header className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-300 font-mono">
                {calendarDate.toLocaleString("default", { month: "long" })} {year}
              </span>
              <div className="flex items-center gap-0.5 border border-[#2a2a2a] rounded-lg overflow-hidden bg-[#1c1c1c]">
                <button onClick={prevMonth} className="p-1.5 hover:bg-[#2c2c2c] text-gray-400 hover:text-white transition">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button onClick={nextMonth} className="p-1.5 hover:bg-[#2c2c2c] text-gray-400 hover:text-white transition">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </header>

            <div className="grid grid-cols-7 border border-[#2a2a2a] rounded-lg overflow-hidden bg-[#1c1c1c]/30 text-center divide-y divide-[#2a2a2a]">
              {/* Day header cells */}
              <div className="grid grid-cols-7 text-[10px] text-gray-500 font-bold uppercase py-2 bg-[#222]/20 border-b border-[#2a2a2a]">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              {/* Day grid slots */}
              <div className="grid grid-cols-7 divide-x divide-y divide-[#2a2a2a] min-h-[280px]">
                {calendarDays.map((dayDate, idx) => {
                  if (!dayDate) {
                    return <div key={`empty-${idx}`} className="bg-[#191919]/10" />;
                  }

                  // Find calendar events mapped on this day
                  const formattedDay = dayDate.toISOString().split("T")[0];
                  const dayEvents = filteredChildren.filter(
                    (item) => item.properties?.date === formattedDay
                  );

                  return (
                    <div key={formattedDay} className="p-1 bg-[#1c1c1c]/20 hover:bg-[#2c2c2c]/10 min-h-[60px] flex flex-col gap-1 items-start select-none">
                      <span className="text-[10px] font-bold text-gray-600 font-mono pl-1 py-0.5">
                        {dayDate.getDate()}
                      </span>
                      <div className="w-full flex-1 overflow-y-auto space-y-1">
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            onClick={() => router.push(`/${workspaceSlug}/${event.id}`)}
                            className="bg-[#2563eb]/10 hover:bg-[#2563eb]/20 text-[#60a5fa] border border-[#2563eb]/20 px-1 py-0.5 rounded text-[9px] font-bold truncate cursor-pointer leading-none w-full text-left"
                            title={event.title}
                          >
                            {event.iconValue ?? "📄"} {event.title || "Untitled"}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── 4. GALLERY VIEW ── */}
        {activeView === "gallery" && (
          <div className="grid grid-cols-3 gap-4">
            {filteredChildren.length > 0 ? (
              filteredChildren.map((item) => {
                const props = item.properties || {};
                return (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/${workspaceSlug}/${item.id}`)}
                    className="bg-[#1c1c1c] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-gray-500 cursor-pointer transition flex flex-col group relative"
                  >
                    {/* Visual Card Cover Header */}
                    <div className="h-24 bg-gradient-to-br from-[#2a2a2a] to-[#151515] relative flex items-center justify-center border-b border-[#2a2a2a]">
                      <span className="text-4xl filter drop-shadow">
                        {item.iconValue ?? "📄"}
                      </span>
                    </div>

                    <div className="p-3.5 flex flex-col gap-2">
                      <span className="text-xs font-bold text-gray-200 group-hover:text-white leading-tight truncate">
                        {item.title || "Untitled note"}
                      </span>

                      <div className="flex items-center justify-between text-[9px] text-gray-500">
                        {props.date ? (
                          <span className="font-mono">{props.date}</span>
                        ) : (
                          <span>No Date</span>
                        )}
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                            props.priority === "High" && "bg-red-950/40 text-red-400 border border-red-500/10",
                            props.priority === "Medium" && "bg-yellow-950/40 text-yellow-400 border border-yellow-500/10",
                            props.priority === "Low" && "bg-green-950/40 text-green-400 border border-green-500/10"
                          )}
                        >
                          {props.priority || "Medium"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => deleteNote(item.id, e)}
                      className="absolute top-2 right-2 p-1 rounded bg-[#191919]/60 hover:bg-[#333] text-gray-400 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 py-20 text-center text-xs text-gray-500">
                No entries found. Click Add row to create one.
              </div>
            )}
          </div>
        )}

        {/* ── 5. SPATIAL 2D CANVAS VIEW & MICRO-APP WIDGETS ── */}
        {activeView === "canvas" && (
          <div className="w-full min-h-[500px] bg-[#141416] border border-[#2c2c30] rounded-2xl p-6 relative overflow-auto bg-[radial-gradient(#25252a_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-4 h-4" /> 2D Spatial Canvas & Micro-App Telemetry Cards
              </span>
              <span className="text-[10px] text-gray-500 font-mono">P2P Real-time Graph</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChildren.map((item, idx) => {
                const props = item.properties || {};
                return (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/${workspaceSlug}/${item.id}`)}
                    className="bg-[#1c1c22]/90 backdrop-blur-md border border-[#2b2b35] hover:border-purple-500/50 rounded-2xl p-4 shadow-xl cursor-pointer transition-all hover:scale-[1.02] group space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{item.iconValue ?? "📄"}</span>
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 border border-purple-500/20 px-2 py-0.5 rounded-full">
                        Card #{idx + 1}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition truncate">
                        {item.title || "Untitled Card"}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate mt-0.5">
                        {props.status ? `Status: ${props.status}` : "No status tag"}
                      </p>
                    </div>

                    {/* Micro-App Widgets: Live Metric Counter & Telemetry Gauge */}
                    <div className="pt-2 border-t border-[#25252d] grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-[#121216] p-2 rounded-xl border border-[#222]">
                        <span className="text-gray-500 block font-semibold">Priority</span>
                        <span className="font-bold text-yellow-400">{props.priority || "Medium"}</span>
                      </div>
                      <div className="bg-[#121216] p-2 rounded-xl border border-[#222]">
                        <span className="text-gray-500 block font-semibold">Telemetry</span>
                        <span className="font-bold text-emerald-400">Live 🟢</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
