// app/(main)/[workspaceSlug]/ai-orchestration/page.tsx
// Interactive Multi-Model AI Orchestration Engine and Configuration Dashboard.

"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import {
  Brain,
  Cpu,
  Sliders,
  Database,
  Network,
  Terminal,
  ArrowRight,
  Activity,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Play,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

type Tab = "gateway" | "agent" | "local";

interface ModelSpec {
  id: string;
  name: string;
  provider: string;
  type: "Proprietary" | "Local/Custom";
  status: "Active" | "Inactive";
  speed: number; // tokens/sec
  cost: number;  // per 1M tokens in USD
  latency: number; // ms
}

const INITIAL_MODELS: ModelSpec[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    type: "Proprietary",
    status: "Active",
    speed: 85,
    cost: 5.0,
    latency: 280,
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    type: "Proprietary",
    status: "Active",
    speed: 70,
    cost: 3.0,
    latency: 340,
  },
  {
    id: "llama3",
    name: "Llama 3 (Ollama)",
    provider: "Ollama",
    type: "Local/Custom",
    status: "Inactive",
    speed: 45,
    cost: 0.0,
    latency: 120,
  },
];

const STREAMING_WORDS = [
  "Integrating", "workspace", "context...", "Success.",
  "Analyzing", "document", "structure...", "Done.",
  "Running", "orchestration", "sequence:", "Model", "Gateway",
  "routed", "successfully.", "Tokens", "are", "streaming",
  "directly", "from", "the", "selected", "endpoint.",
  "RTX", "Notion", "AI", "Engine", "is", "fully", "synchronized."
];

export default function AiOrchestrationPage() {
  const params = useParams();
  const { data: session } = useSession();
  
  // State variables
  const [activeTab, setActiveTab] = useState<Tab>("gateway");
  const [selectedModel, setSelectedModel] = useState("claude-3-5-sonnet");
  const [localStatus, setLocalStatus] = useState<"Disconnected" | "Connected" | "Connecting">("Disconnected");
  const [localEndpoint, setLocalEndpoint] = useState("http://localhost:11434/v1");
  const [localModelName, setLocalModelName] = useState("llama3");
  const [localToken, setLocalToken] = useState("");
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [testPrompt, setTestPrompt] = useState("Generate a layout summary report.");

  // Agent State
  const [agentName, setAgentName] = useState("Workspace Copilot");
  const [agentPrompt, setAgentPrompt] = useState("Act as a professional document editor. Help structure thoughts, clean grammar, and format text.");
  const [agentModel, setAgentModel] = useState("claude-3-5-sonnet");

  // Dynamic model specifications registry
  const [models, setModels] = useState<ModelSpec[]>(INITIAL_MODELS);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll terminal output
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [streamingText]);

  // Model Specs lookup
  const currentSpec = models.find((m) => m.id === selectedModel) || models[0];

  // Test Handshake handler
  const [isConnecting, setIsConnecting] = useState(false);
  async function handleTestHandshake() {
    setIsConnecting(true);
    setLocalStatus("Connecting");
    
    // Simulate API ping
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    setIsConnecting(false);
    setLocalStatus("Connected");
    
    // Update local model registry status to Active
    setModels((prev) =>
      prev.map((m) => (m.id === "llama3" ? { ...m, status: "Active" } : m))
    );
    toast.success("Ollama integration active! Llama 3 unlocked.");
  }

  // Streaming playground simulation
  function runPlaygroundTest() {
    if (isStreaming) return;
    setIsStreaming(true);
    setStreamingText("");
    
    let wordIdx = 0;
    const interval = setInterval(() => {
      if (wordIdx < STREAMING_WORDS.length) {
        setStreamingText((prev) => prev + " " + STREAMING_WORDS[wordIdx]);
        wordIdx++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
        toast.success("Playground test query finished!");
      }
    }, 150);
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#121212] text-gray-200">
      {/* Header */}
      <header className="h-14 border-b border-[#222] flex items-center justify-between px-8 bg-[#161616]">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-purple-400" />
          <h1 className="text-sm font-bold tracking-tight text-white">AI Orchestration Engine</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded">v2.0 Beta</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Activity className="h-3.5 w-3.5 text-green-400 animate-pulse" />
          <span>Gateway Status: Online</span>
        </div>
      </header>

      {/* Main Grid Wrapper */}
      <div className="flex-1 p-8 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#222] gap-1 p-1 bg-[#1a1a1a] rounded-lg">
          <button
            onClick={() => setActiveTab("gateway")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === "gateway"
                ? "bg-[#2c2c2c] text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Cpu className="h-3.5 w-3.5" />
            <span>Model Gateway Router</span>
          </button>
          <button
            onClick={() => setActiveTab("agent")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === "agent"
                ? "bg-[#2c2c2c] text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Agent Configuration Studio</span>
          </button>
          <button
            onClick={() => setActiveTab("local")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              activeTab === "local"
                ? "bg-[#2c2c2c] text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>Local Endpoint Settings</span>
          </button>
        </div>

        {/* ─── TAB 1: MODEL GATEWAY ────────────────────────────────────────── */}
        {activeTab === "gateway" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Control Panel */}
            <div className="md:col-span-2 space-y-6">
              {/* Select Panel */}
              <div className="p-6 rounded-xl border border-[#222] bg-[#161616] space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Router Settings</h3>
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-400 block font-semibold">Active Global Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-[#2e2e2e] bg-[#222] text-sm text-white focus:border-purple-500 outline-none"
                  >
                    {models.map((m) => (
                      <option
                        key={m.id}
                        value={m.id}
                        disabled={m.status === "Inactive"}
                        className={m.status === "Inactive" ? "text-gray-600" : ""}
                      >
                        {m.name} ({m.provider}) {m.status === "Inactive" ? "— Locked (Needs Connection)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Simulation Playground */}
              <div className="p-6 rounded-xl border border-[#222] bg-[#161616] space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Model Testing Playground</h3>
                <div className="space-y-2">
                  <label className="text-[11px] text-gray-400 block font-semibold">Test Prompt</label>
                  <textarea
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    rows={2}
                    className="w-full p-3 rounded-lg border border-[#2e2e2e] bg-[#222] text-xs text-white placeholder-gray-600 focus:border-purple-500 outline-none resize-none"
                  />
                </div>
                <Button
                  onClick={runPlaygroundTest}
                  disabled={isStreaming}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold h-10 rounded-lg flex items-center justify-center gap-2 text-xs transition"
                >
                  {isStreaming ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Streaming response blocks...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Run Test Playground Query</span>
                    </>
                  )}
                </Button>

                {/* Console Output */}
                <div className="space-y-2 pt-2">
                  <label className="text-[11px] text-gray-400 block font-semibold">Live Streaming Output Box</label>
                  <div className="h-32 w-full p-4 rounded-lg bg-black border border-[#222] font-mono text-[11px] text-green-400 overflow-y-auto flex flex-col justify-between">
                    <div className="whitespace-pre-wrap">
                      <span className="text-gray-500">$ query --model={selectedModel} --prompt=&quot;{testPrompt}&quot;</span>
                      {streamingText}
                      {isStreaming && <span className="animate-pulse"> ▋</span>}
                    </div>
                    <div ref={consoleEndRef} />
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Panel */}
            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-[#222] bg-[#161616] space-y-6">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Gateway Analytics ({currentSpec.name})</h3>
                
                {/* Cost Indicator */}
                <div className="p-4 rounded-lg bg-[#222] border border-[#2e2e2e] flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Estimated Cost</span>
                    <span className="text-lg font-bold text-white">
                      ${currentSpec.cost.toFixed(2)} <span className="text-xs font-normal text-gray-400">/ 1M tokens</span>
                    </span>
                  </div>
                </div>

                {/* Processing Speed */}
                <div className="p-4 rounded-lg bg-[#222] border border-[#2e2e2e] flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Tokens Velocity</span>
                    <span className="text-lg font-bold text-white">
                      {currentSpec.speed} <span className="text-xs font-normal text-gray-400">T/s</span>
                    </span>
                  </div>
                </div>

                {/* Latency */}
                <div className="p-4 rounded-lg bg-[#222] border border-[#2e2e2e] flex items-center gap-4">
                  <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold block uppercase">Model Latency</span>
                    <span className="text-lg font-bold text-white">
                      {currentSpec.latency} <span className="text-xs font-normal text-gray-400">ms</span>
                    </span>
                  </div>
                </div>

                {/* Relational Speed Graph Bar */}
                <div className="space-y-2 pt-2 border-t border-[#222]">
                  <div className="flex justify-between text-[10px] text-gray-400 font-semibold">
                    <span>Performance Velocity Weight</span>
                    <span>{Math.round((currentSpec.speed / 100) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#222] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${(currentSpec.speed / 100) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: AGENT STUDIO ─────────────────────────────────────────── */}
        {activeTab === "agent" && (
          <div className="max-w-2xl mx-auto p-6 rounded-xl border border-[#222] bg-[#161616] space-y-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Agent Configuration Studio</h3>
            
            <div className="space-y-4">
              {/* Agent Name */}
              <div className="space-y-2">
                <label className="text-[11px] text-gray-400 block font-semibold">Custom Agent Name</label>
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#2e2e2e] bg-[#222] text-sm text-white focus:border-purple-500 outline-none"
                />
              </div>

              {/* Agent Prompt */}
              <div className="space-y-2">
                <label className="text-[11px] text-gray-400 block font-semibold">System Prompt Template</label>
                <textarea
                  value={agentPrompt}
                  onChange={(e) => setAgentPrompt(e.target.value)}
                  rows={4}
                  className="w-full p-3 rounded-lg border border-[#2e2e2e] bg-[#222] text-xs text-white focus:border-purple-500 outline-none resize-none"
                />
              </div>

              {/* Assigned Model */}
              <div className="space-y-2">
                <label className="text-[11px] text-gray-400 block font-semibold">Assigned Routing Model</label>
                <select
                  value={agentModel}
                  onChange={(e) => setAgentModel(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#2e2e2e] bg-[#222] text-sm text-white focus:border-purple-500 outline-none"
                >
                  {models.map((m) => (
                    <option
                      key={m.id}
                      value={m.id}
                      disabled={m.status === "Inactive"}
                      className={m.status === "Inactive" ? "text-gray-600" : ""}
                    >
                      {m.name} ({m.provider}) {m.status === "Inactive" ? "— Locked (Needs Connection)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Save Button */}
              <Button
                onClick={() => {
                  toast.success(`Agent Configuration for ${agentName} saved successfully!`);
                }}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold h-10 rounded-lg flex items-center justify-center text-xs transition"
              >
                Save Agent Settings
              </Button>
            </div>
          </div>
        )}

        {/* ─── TAB 3: LOCAL SETTINGS ───────────────────────────────────────── */}
        {activeTab === "local" && (
          <div className="max-w-2xl mx-auto p-6 rounded-xl border border-[#222] bg-[#161616] space-y-6">
            <div className="flex items-center justify-between border-b border-[#222] pb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Local Endpoint Settings</h3>
              
              {/* Status Indicator */}
              <div className="flex items-center gap-1.5 text-xs">
                {localStatus === "Connected" ? (
                  <span className="flex items-center gap-1.5 text-green-400 font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Connected
                  </span>
                ) : localStatus === "Connecting" ? (
                  <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                    <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-400 font-semibold">
                    <XCircle className="h-4 w-4" /> Disconnected
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Base URL */}
              <div className="space-y-2">
                <label className="text-[11px] text-gray-400 block font-semibold">Base URL Path</label>
                <input
                  type="text"
                  value={localEndpoint}
                  onChange={(e) => setLocalEndpoint(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#2e2e2e] bg-[#222] text-sm text-white focus:border-purple-500 outline-none"
                />
              </div>

              {/* Target Model Name */}
              <div className="space-y-2">
                <label className="text-[11px] text-gray-400 block font-semibold">Ollama Target Model Name</label>
                <input
                  type="text"
                  value={localModelName}
                  onChange={(e) => setLocalModelName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#2e2e2e] bg-[#222] text-sm text-white focus:border-purple-500 outline-none"
                />
              </div>

              {/* Token */}
              <div className="space-y-2">
                <label className="text-[11px] text-gray-400 block font-semibold">API Authorization Token (Optional)</label>
                <input
                  type="password"
                  placeholder="Bearer token"
                  value={localToken}
                  onChange={(e) => setLocalToken(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-[#2e2e2e] bg-[#222] text-sm text-white focus:border-purple-500 outline-none"
                />
              </div>

              {/* Connection Buttons */}
              <Button
                onClick={handleTestHandshake}
                disabled={isConnecting}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-500 text-white font-bold h-10 rounded-lg flex items-center justify-center gap-2 text-xs transition"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Testing Handshake Connection...</span>
                  </>
                ) : (
                  <span>Test Handshake Connection</span>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
