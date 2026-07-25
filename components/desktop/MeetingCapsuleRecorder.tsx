"use client";

import { useState, useEffect, useRef } from "react";
import { useUIStore } from "@/store/uiStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { usePageStore } from "@/store/pageStore";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export function MeetingCapsuleRecorder() {
  const { meetingNotesOpen, setMeetingNotesOpen } = useUIStore();
  const { currentWorkspace } = useWorkspaceStore();

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [volumeLevels, setVolumeLevels] = useState<number[]>([1, 1, 1, 1, 1]);
  
  // Dragging states
  const [position, setPosition] = useState({ x: 30, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Handle Drag Start
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 80, e.clientX - dragStart.current.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 260, e.clientY - dragStart.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Start / Stop audio capture and speech recognition
  useEffect(() => {
    if (!meetingNotesOpen) {
      cleanupAudio();
      return;
    }

    startRecordingSession();

    return () => {
      cleanupAudio();
    };
  }, [meetingNotesOpen]);

  const cleanupAudio = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsRecording(false);
    setIsProcessing(false);
  };

  const startRecordingSession = async () => {
    setIsRecording(true);
    setTranscript("");

    // 1. Initialize Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition is not supported in this environment.");
      setMeetingNotesOpen(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "hi-IN"; // Defaults to Hinglish/Hindi-India capture

    rec.onresult = (event: any) => {
      let currentTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript((prev) => (prev ? `${prev} ${currentTranscript}` : currentTranscript));
    };

    rec.onerror = (event: any) => {
      console.error("[Speech Recognition Error]", event.error);
    };

    rec.onend = () => {
      if (isRecording) {
        try {
          rec.start();
        } catch {}
      }
    };

    recognitionRef.current = rec;
    try {
      rec.start();
    } catch (e) {
      console.error(e);
    }

    // 2. Initialize Web Audio API for visual Level Meter
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Map frequency bands to 5 visual dots
        const segments = Math.floor(bufferLength / 5);
        const newLevels = Array.from({ length: 5 }, (_, i) => {
          let sum = 0;
          for (let j = 0; j < segments; j++) {
            sum += dataArray[i * segments + j] || 0;
          }
          const avg = sum / segments;
          // Scale level factor between 1.0 (min) and 2.8 (max)
          return 1.0 + (avg / 255.0) * 1.8;
        });

        setVolumeLevels(newLevels);
        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
      toast.success("Voltaic capsule recording started... Talk now!");
    } catch (err) {
      console.warn("Could not capture microphone levels:", err);
      // Fallback animation if mic permission is denied
      const fallbackInterval = setInterval(() => {
        setVolumeLevels(Array.from({ length: 5 }, () => 1.0 + Math.random() * 1.2));
      }, 100);
      return () => clearInterval(fallbackInterval);
    }
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setIsProcessing(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    try {
      const finalTranscript = transcript.trim() || "Let's summarize our action items and project updates.";
      
      const res = await fetch("/api/ai/meeting-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: finalTranscript,
          language: "hinglish",
          workspaceId: currentWorkspace?.id,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error ?? "Failed to process audio transcript.");
      }

      const notesMarkdown = json.data?.formattedMarkdown;
      if (notesMarkdown) {
        if (typeof window !== "undefined" && (window as any).__tiptapView) {
          const view = (window as any).__tiptapView;
          const { tr } = view.state;
          view.dispatch(tr.insertText("\n\n" + notesMarkdown));
          toast.success("AI Meeting Notes inserted successfully!");
        } else {
          navigator.clipboard.writeText(notesMarkdown);
          toast.success("AI Meeting Notes copied to clipboard!");
        }
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred while generating meeting notes.");
    } finally {
      setMeetingNotesOpen(false);
      cleanupAudio();
    }
  };

  if (!meetingNotesOpen) return null;

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className="fixed z-[999] select-none pointer-events-auto"
    >
      {/* Capsule Container */}
      <div
        className="w-16 h-56 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-full flex flex-col items-center justify-between py-5 shadow-[0_24px_50px_rgba(0,0,0,0.85)] cursor-grab active:cursor-grabbing transition-shadow hover:shadow-[0_24px_60px_rgba(147,51,234,0.15)]"
        onMouseDown={handleMouseDown}
      >
        {/* Top: 3D Logo Cube / Icon */}
        <div className="w-9 h-9 rounded-2xl bg-black border border-white/20 flex items-center justify-center shadow-lg relative group overflow-hidden">
          <img
            src="/icon.png"
            alt="Voltaic"
            className="w-7 h-7 object-contain animate-pulse"
          />
          <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Middle: Bouncing Vertical Level Meter Dots */}
        <div className="flex flex-col gap-1.5 items-center py-2">
          {volumeLevels.map((scale, i) => (
            <div
              key={i}
              className="w-5 h-1.5 rounded-full bg-purple-500 opacity-90 transition-transform duration-75"
              style={{
                transform: `scaleX(${isRecording ? scale : 1.0})`,
                backgroundColor: isRecording 
                  ? `rgb(${147 - i * 15}, ${51 + i * 20}, ${234})` 
                  : "#4b5563",
              }}
            />
          ))}
        </div>

        {/* Bottom: Recording Stop Button */}
        <div className="relative">
          {isProcessing ? (
            <div className="w-10 h-10 rounded-full bg-purple-600/20 border border-purple-500/40 flex items-center justify-center">
              <Loader2 className="h-5 w-5 text-purple-400 animate-spin" />
            </div>
          ) : (
            <button
              onClick={handleStopRecording}
              className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center shadow-lg hover:shadow-red-500/20 transition-all hover:scale-105 active:scale-95 group"
              title="Stop Recording and Analyze"
            >
              <div className="w-3.5 h-3.5 bg-white rounded-sm transition-transform group-hover:scale-90" />
            </button>
          )}

          {/* Pulsing indicator ring */}
          {isRecording && (
            <span className="absolute -inset-1.5 rounded-full border border-red-500/30 animate-ping pointer-events-none" style={{ animationDuration: "1.5s" }} />
          )}
        </div>
      </div>
    </div>
  );
}
