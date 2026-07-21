// components/modals/MeetingNotesModal.tsx
// Notion-style AI Meeting Assistant modal featuring Live Speech Recording, Hinglish language support, action item extraction, and page insertion.

"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { usePageStore } from "@/store/pageStore";
import toast from "react-hot-toast";
import {
  Mic,
  MicOff,
  Sparkles,
  FileText,
  Copy,
  Plus,
  Check,
  Loader2,
  Globe,
  Radio,
  ListTodo,
  FileSpreadsheet,
  CheckCircle2,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onInsertContent?: (markdown: string) => void;
}

export function MeetingNotesModal({ onInsertContent }: Props) {
  const { meetingNotesOpen, setMeetingNotesOpen } = useUIStore();
  const { currentWorkspace } = useWorkspaceStore();
  const { currentPage } = usePageStore();

  const [activeTab, setActiveTab] = useState<"record" | "paste" | "result">("record");
  const [language, setLanguage] = useState<"hinglish" | "english" | "auto">("hinglish");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [transcript, setTranscript] = useState("");

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const [notesResult, setNotesResult] = useState<{
    title: string;
    date: string;
    summary: string;
    keyDecisions: string[];
    actionItems: { task: string; assignee: string }[];
    formattedMarkdown: string;
  } | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = language === "hinglish" ? "hi-IN" : "en-US";

      rec.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
      };

      rec.onerror = (event: any) => {
        console.warn("[Speech Recognition Error]", event.error);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, [language]);

  function toggleRecording() {
    if (!recognitionRef.current) {
      toast.error("Speech Recognition is not supported by your browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      toast.success("Recording paused.");
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.success(`Listening in ${language === "hinglish" ? "Hinglish (Hindi+English)" : "English"}...`);
      } catch (err) {
        console.error(err);
        setIsRecording(false);
      }
    }
  }

  async function processMeetingNotes() {
    if (!transcript.trim()) {
      toast.error("Please record audio or paste a meeting transcript first.");
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/ai/meeting-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          language,
          meetingTitle: meetingTitle.trim() || undefined,
          workspaceId: currentWorkspace?.id,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Failed to generate meeting notes.");
        return;
      }

      setNotesResult(json.data);
      setActiveTab("result");
      toast.success("AI Meeting Notes generated successfully!");
    } catch {
      toast.error("An error occurred while analyzing the meeting notes.");
    } finally {
      setIsProcessing(false);
    }
  }

  function handleInsertToCurrentPage() {
    if (!notesResult?.formattedMarkdown) return;
    if (onInsertContent) {
      onInsertContent(notesResult.formattedMarkdown);
      toast.success("Meeting notes inserted onto the page!");
      setMeetingNotesOpen(false);
    } else {
      navigator.clipboard.writeText(notesResult.formattedMarkdown);
      toast.success("Copied meeting notes to clipboard!");
    }
  }

  async function handleCreateNewPage() {
    if (!currentWorkspace?.id || !notesResult) return;
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/pages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `⚡ ${notesResult.title || "Meeting Notes"}`,
          iconValue: "🎙️",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        toast.error("Failed to create new meeting note page.");
        return;
      }

      const newPageId = json.data.id;
      // Save content
      await fetch(`/api/pages/${newPageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: notesResult.formattedMarkdown }] }] },
          contentText: notesResult.formattedMarkdown,
        }),
      });

      toast.success("New Meeting Note page created!");
      setMeetingNotesOpen(false);
      window.location.href = `/${currentWorkspace.slug}/${newPageId}`;
    } catch {
      toast.error("Could not create meeting page.");
    }
  }

  function handleCopyMarkdown() {
    if (!notesResult?.formattedMarkdown) return;
    navigator.clipboard.writeText(notesResult.formattedMarkdown);
    setCopied(true);
    toast.success("Copied formatted meeting notes to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={meetingNotesOpen} onOpenChange={setMeetingNotesOpen}>
      <DialogContent className="max-w-3xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#f3f4f6] p-0 overflow-hidden shadow-2xl rounded-2xl">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between bg-[#181818]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                Notion AI Meeting Notes
                <span className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-400 font-semibold px-2 py-0.5 rounded-full">
                  Hinglish & English
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Record live meetings or paste transcripts to auto-extract summaries and action items.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-6 pt-3 bg-[#181818] border-b border-[#2a2a2a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("record")}
              className={cn(
                "px-3 py-1.5 rounded-t-lg text-xs font-semibold transition border-b-2 flex items-center gap-1.5",
                activeTab === "record"
                  ? "border-purple-500 text-purple-400 bg-[#1c1c1c]"
                  : "border-transparent text-gray-400 hover:text-white"
              )}
            >
              <Mic className="h-3.5 w-3.5" />
              Live Speech Recording
            </button>
            <button
              onClick={() => setActiveTab("paste")}
              className={cn(
                "px-3 py-1.5 rounded-t-lg text-xs font-semibold transition border-b-2 flex items-center gap-1.5",
                activeTab === "paste"
                  ? "border-purple-500 text-purple-400 bg-[#1c1c1c]"
                  : "border-transparent text-gray-400 hover:text-white"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              Paste Transcript
            </button>
            {notesResult && (
              <button
                onClick={() => setActiveTab("result")}
                className={cn(
                  "px-3 py-1.5 rounded-t-lg text-xs font-semibold transition border-b-2 flex items-center gap-1.5",
                  activeTab === "result"
                    ? "border-purple-500 text-purple-400 bg-[#1c1c1c]"
                    : "border-transparent text-gray-400 hover:text-white"
                )}
              >
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                Generated Notes Preview
              </button>
            )}
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1 bg-[#242424] p-1 rounded-lg border border-[#333]">
            <button
              onClick={() => setLanguage("hinglish")}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1",
                language === "hinglish"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              )}
            >
              🇮🇳 Hinglish
            </button>
            <button
              onClick={() => setLanguage("english")}
              className={cn(
                "px-2.5 py-1 rounded text-[11px] font-semibold transition flex items-center gap-1",
                language === "english"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-400 hover:text-white"
              )}
            >
              🌐 English
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[480px] overflow-y-auto">
          {/* Meeting Title Context Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Meeting Topic / Agenda (Optional)
            </label>
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              placeholder="e.g., Q3 Sprint Review & API Feature Sync"
              className="w-full bg-[#141414] border border-[#2c2c2c] focus:border-purple-500 outline-none rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500"
            />
          </div>

          {activeTab === "record" && (
            <div className="space-y-4">
              {/* Recording Box */}
              <div className="p-6 bg-[#141414] border border-[#2c2c2c] rounded-2xl flex flex-col items-center justify-center space-y-4 text-center">
                <button
                  onClick={toggleRecording}
                  className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl",
                    isRecording
                      ? "bg-red-500/20 text-red-400 border-2 border-red-500 animate-pulse ring-4 ring-red-500/20 scale-105"
                      : "bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30"
                  )}
                >
                  {isRecording ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
                </button>
                <div>
                  <p className="text-xs font-bold text-white">
                    {isRecording ? "Listening to meeting speech..." : "Click to Start Recording Speech"}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Mode: <span className="text-purple-400 font-semibold">{language === "hinglish" ? "Hinglish (Hindi + English)" : "English"}</span>
                  </p>
                </div>
              </div>

              {/* Live Transcript Stream */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Radio className={cn("h-3 w-3 text-purple-400", isRecording && "animate-pulse")} />
                    Live Speech Transcript
                  </label>
                  {transcript && (
                    <button
                      onClick={() => setTranscript("")}
                      className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Clear
                    </button>
                  )}
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Live audio transcript will stream here as you speak..."
                  className="w-full h-32 bg-[#141414] border border-[#2c2c2c] focus:border-purple-500 outline-none rounded-xl p-3 text-xs text-gray-200 placeholder-gray-600 resize-none font-mono leading-relaxed"
                />
              </div>
            </div>
          )}

          {activeTab === "paste" && (
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Paste Meeting Discussion / Audio Transcript
              </label>
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste transcript from Zoom, Google Meet, Teams, or your notes here... (e.g. 'Rahul mentioned that API authentication is complete. Next step: Rishikesh needs to deploy the WebSocket server by Friday.')"
                className="w-full h-44 bg-[#141414] border border-[#2c2c2c] focus:border-purple-500 outline-none rounded-xl p-3.5 text-xs text-gray-200 placeholder-gray-600 resize-none font-mono leading-relaxed"
              />
            </div>
          )}

          {activeTab === "result" && notesResult && (
            <div className="space-y-4 bg-[#141414] border border-[#2c2c2c] rounded-2xl p-5">
              <div className="flex items-center justify-between border-b border-[#2a2a2a] pb-3">
                <div>
                  <h3 className="text-base font-extrabold text-white">{notesResult.title}</h3>
                  <p className="text-[10px] text-purple-400 font-semibold">{notesResult.date}</p>
                </div>
                <button
                  onClick={handleCopyMarkdown}
                  className="px-2.5 py-1 rounded bg-[#242424] hover:bg-[#333] border border-[#3a3a3a] text-xs font-semibold text-gray-300 flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy Markdown"}
                </button>
              </div>

              {/* Executive Summary */}
              <div>
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" /> Executive Summary
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed bg-[#1c1c1c] p-3 rounded-xl border border-[#2a2a2a]">
                  {notesResult.summary}
                </p>
              </div>

              {/* Key Decisions */}
              {notesResult.keyDecisions?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Key Decisions
                  </h4>
                  <ul className="space-y-1 bg-[#1c1c1c] p-3 rounded-xl border border-[#2a2a2a]">
                    {notesResult.keyDecisions.map((dec, i) => (
                      <li key={i} className="text-xs text-gray-200 flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span>{dec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {notesResult.actionItems?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <ListTodo className="h-3.5 w-3.5" /> Action Items & Tasks
                  </h4>
                  <div className="space-y-1 bg-[#1c1c1c] p-3 rounded-xl border border-[#2a2a2a]">
                    {notesResult.actionItems.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-[#262626] last:border-none">
                        <span className="text-gray-200 flex items-center gap-2">
                          <input type="checkbox" className="rounded border-gray-700 bg-gray-900 text-purple-600 focus:ring-0" readOnly checked />
                          {item.task}
                        </span>
                        <span className="text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                          {item.assignee || "Unassigned"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-[#181818] border-t border-[#2a2a2a] flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setMeetingNotesOpen(false)}
            className="text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {activeTab !== "result" ? (
              <Button
                onClick={processMeetingNotes}
                disabled={!transcript.trim() || isProcessing}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-purple-500/20 flex items-center gap-2 transition"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    Generating Meeting Notes...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate AI Notes
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleCreateNewPage}
                  variant="outline"
                  className="border-[#3a3a3a] bg-[#242424] hover:bg-[#333] text-gray-200 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="h-4 w-4 text-purple-400" />
                  Create New Page
                </Button>

                <Button
                  onClick={handleInsertToCurrentPage}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 transition"
                >
                  <ArrowRight className="h-4 w-4" />
                  Insert Into Active Page
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
