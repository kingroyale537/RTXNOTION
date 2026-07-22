"use client";

import React, { useState, useEffect } from "react";
import { Mic, Square, Sparkles, Check, ArrowRight, X, Volume2, RefreshCw } from "lucide-react";

interface VoiceCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceCaptureModal({ isOpen, onClose }: VoiceCaptureModalProps) {
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{
    title: string;
    summary: string;
    tasks: string[];
    tags: string[];
  } | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (recording) {
      interval = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    } else {
      setTimer(0);
    }
    return () => clearInterval(interval);
  }, [recording]);

  if (!isOpen) return null;

  const startRecording = () => {
    setResult(null);
    setRecording(true);
  };

  const stopRecording = () => {
    setRecording(false);
    setProcessing(true);

    // Simulate AI Voice-to-Knowledge Processing
    setTimeout(() => {
      setProcessing(false);
      setResult({
        title: "Q3 Mobile Strategy & App Store Launch",
        summary: "Spoken thought regarding finalizing Capacitor iOS native build, deploying instant local PWA for testing, and coordinating enterprise vault encryption.",
        tasks: [
          "Deploy local PWA for physical iPhone testing",
          "Open Xcode workspace and verify Capacitor iOS bundle",
          "Prepare 8:00 AM Executive Briefing AI synthesis",
          "Schedule team sync on local-first CRDT sync engine"
        ],
        tags: ["Strategy", "iOS", "Release"]
      });
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Glowing background orb */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-100">Voice-to-Knowledge</h3>
              <p className="text-xs text-zinc-400">Steve Jobs Ambient Capture Engine</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-6">
          {!recording && !processing && !result && (
            <div className="space-y-4">
              <button
                onClick={startRecording}
                className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all mx-auto group"
              >
                <Mic className="w-10 h-10 group-hover:scale-110 transition-transform" />
              </button>
              <div>
                <p className="text-sm font-medium text-zinc-200">Tap to start speaking your mind</p>
                <p className="text-xs text-zinc-500 mt-1">Voltaic AI will automatically parse tasks, notes & tags</p>
              </div>
            </div>
          )}

          {recording && (
            <div className="space-y-4">
              {/* Waveform animation */}
              <div className="flex items-center justify-center space-x-1.5 h-16">
                {[40, 75, 50, 90, 60, 100, 45, 80, 65, 30].map((height, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-gradient-to-t from-indigo-500 to-pink-500 rounded-full animate-pulse"
                    style={{
                      height: `${height}%`,
                      animationDelay: `${i * 100}ms`
                    }}
                  />
                ))}
              </div>

              <div>
                <div className="text-2xl font-mono font-bold text-white tracking-widest">
                  00:{timer < 10 ? `0${timer}` : timer}
                </div>
                <p className="text-xs text-indigo-400 font-medium mt-1">Listening and capturing raw thought...</p>
              </div>

              <button
                onClick={stopRecording}
                className="px-6 py-3 rounded-full bg-red-600 text-white font-medium text-sm flex items-center space-x-2 shadow-lg shadow-red-500/30 hover:bg-red-500 active:scale-95 transition-all mx-auto"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop & Convert</span>
              </button>
            </div>
          )}

          {processing && (
            <div className="py-8 space-y-3">
              <RefreshCw className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
              <p className="text-sm font-medium text-zinc-200">Synthesizing voice note into Voltaic workspace...</p>
              <p className="text-xs text-zinc-500">Extracting tasks, summaries and tags...</p>
            </div>
          )}

          {result && (
            <div className="w-full text-left space-y-4 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-indigo-400 tracking-wider">Generated Knowledge Page</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">Auto-Parsed</span>
              </div>

              <h4 className="font-bold text-base text-white leading-tight">{result.title}</h4>
              <p className="text-xs text-zinc-300 leading-relaxed">{result.summary}</p>

              <div className="space-y-1.5 pt-2 border-t border-zinc-800/60">
                <span className="text-xs font-medium text-zinc-400">Extracted Tasks ({result.tasks.length}):</span>
                {result.tasks.map((task, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs text-zinc-200">
                    <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>{task}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex space-x-1">
                  {result.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md">
                      #{t}
                    </span>
                  ))}
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium text-xs flex items-center space-x-1 hover:bg-indigo-500 transition-colors"
                >
                  <span>Save to Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
