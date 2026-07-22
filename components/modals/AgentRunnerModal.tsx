// components/modals/AgentRunnerModal.tsx
// Visualizer Modal for Autonomous AI Micro-Agent Swarm execution runs.

"use client";

import { useEffect, useState } from "react";
import { Bot, Play, CheckCircle2, Loader2, Sparkles, X, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  workspaceId?: string;
}

export function AgentRunnerModal({ workspaceId }: Props) {
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(false);
  const [agentType, setAgentType] = useState<"autoTag" | "summarizeWorkspace" | "schemaClean">("autoTag");
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-agent-runner", handleOpen);
    return () => window.removeEventListener("open-agent-runner", handleOpen);
  }, []);

  const runAgent = async () => {
    setRunning(true);
    setLogs(["[Agent Swarm] Spawning micro-agents...", "[Agent Swarm] Inspecting database rows..."]);

    try {
      const res = await fetch("/api/ai/agent-runner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId: workspaceId || "default", agentType }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Agent run failed");
      }

      const data = await res.json();
      setLogs((prev) => [...prev, ...(data.stepsCompleted || []), "[Agent Swarm] Execution complete! ✓"]);
      toast.success("Autonomous AI Agent execution completed!");
    } catch (err: any) {
      setLogs((prev) => [...prev, `[ERROR] ${err.message}`]);
      toast.error("Agent execution failed.");
    } finally {
      setRunning(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[#141417] border border-[#2b2b30] rounded-2xl p-6 shadow-2xl space-y-5 text-white">
        <div className="flex items-center justify-between border-b border-[#222] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Autonomous AI Agent Swarm</h2>
              <p className="text-xs text-gray-400">Grok-powered background execution runner</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-semibold text-gray-300">Select Task Workflow</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setAgentType("autoTag")}
              className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                agentType === "autoTag"
                  ? "bg-purple-600/20 border-purple-500 text-purple-300"
                  : "bg-[#1c1c20] border-[#2c2c30] text-gray-400 hover:text-white"
              }`}
            >
              🏷️ Auto-Tag DB Rows
            </button>
            <button
              onClick={() => setAgentType("summarizeWorkspace")}
              className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                agentType === "summarizeWorkspace"
                  ? "bg-purple-600/20 border-purple-500 text-purple-300"
                  : "bg-[#1c1c20] border-[#2c2c30] text-gray-400 hover:text-white"
              }`}
            >
              📝 Briefing Agent
            </button>
            <button
              onClick={() => setAgentType("schemaClean")}
              className={`p-3 rounded-xl border text-xs font-semibold text-left transition ${
                agentType === "schemaClean"
                  ? "bg-purple-600/20 border-purple-500 text-purple-300"
                  : "bg-[#1c1c20] border-[#2c2c30] text-gray-400 hover:text-white"
              }`}
            >
              🧹 Schema Hygiene
            </button>
          </div>
        </div>

        {/* Execution Log Terminal */}
        <div className="bg-[#0c0c0e] border border-[#222] rounded-xl p-4 font-mono text-xs text-green-400 min-h-[140px] max-h-[200px] overflow-y-auto space-y-1">
          {logs.length === 0 ? (
            <p className="text-gray-600 italic">Ready to launch agent task swarm...</p>
          ) : (
            logs.map((log, idx) => <p key={idx}>{log}</p>)
          )}
        </div>

        <button
          onClick={runAgent}
          disabled={running}
          className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
        >
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
          <span>{running ? "Agents Executing..." : "Launch Agent Swarm"}</span>
        </button>
      </div>
    </div>
  );
}
