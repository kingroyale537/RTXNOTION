// components/desktop/MeetingPillBanner.tsx
// Pixel-perfect floating AI Meeting Note pill popup widget matching Notion Desktop's meeting detection interface.

"use client";

import { useState } from "react";
import { useMeetingDetection } from "@/hooks/useMeetingDetection";
import { useUIStore } from "@/store/uiStore";
import { Sparkles, ChevronDown, X, Mic, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function MeetingPillBanner() {
  const { meetingDetected, dismissMeeting } = useMeetingDetection();
  const { setMeetingNotesOpen } = useUIStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<"hinglish" | "english">("hinglish");

  if (!meetingDetected) return null;

  function handleStartTranscribing(lang: "hinglish" | "english" = selectedLanguage) {
    setSelectedLanguage(lang);
    setDropdownOpen(false);
    dismissMeeting();
    setMeetingNotesOpen(true);
    toast.success(`Opening Voltaic AI Meeting Assistant (${lang === "hinglish" ? "Hinglish" : "English"})...`);
  }

  return (
    <div className="fixed top-4 right-8 z-[100] animate-in fade-in slide-in-from-top-4 duration-300 select-none">
      <div className="bg-[#1a1a1a] border border-[#2e2e2e] shadow-[0_12px_40px_rgba(0,0,0,0.8)] rounded-full px-3 py-1.5 flex items-center gap-3">
        {/* Left App Icon Badge */}
        <div className="w-8 h-8 rounded-xl bg-black border border-white/20 flex items-center justify-center text-white font-black text-sm shadow-md">
          V
        </div>

        {/* Text Area */}
        <div className="flex flex-col pr-1">
          <span className="text-xs font-bold text-white tracking-tight leading-snug">
            Start AI Meeting Note
          </span>
          <span className="text-[10px] text-gray-400 font-medium leading-none">
            Transcribing opens Voltaic
          </span>
        </div>

        {/* Right Action Button with Dropdown */}
        <div className="relative flex items-center gap-1">
          <div className="flex items-center bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-full overflow-hidden shadow-lg shadow-blue-500/25 transition">
            <button
              onClick={() => handleStartTranscribing(selectedLanguage)}
              className="px-3.5 py-1.5 text-xs font-bold tracking-wide flex items-center gap-1.5"
            >
              Start transcribing
            </button>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="pr-2.5 py-1.5 border-l border-blue-400/30 hover:bg-blue-700/50 transition"
              title="Select language"
            >
              <ChevronDown className="h-3.5 w-3.5 text-white" />
            </button>
          </div>

          {/* Dismiss Icon */}
          <button
            onClick={dismissMeeting}
            className="p-1 text-gray-500 hover:text-gray-300 transition rounded-full hover:bg-white/5 ml-1"
            title="Dismiss meeting notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-52 bg-[#222222] border border-[#3c3c3c] rounded-2xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Select Audio Language
              </div>
              <button
                onClick={() => handleStartTranscribing("hinglish")}
                className="w-full px-3 py-1.5 text-xs text-left hover:bg-[#2c2c2c] transition flex items-center justify-between text-gray-200"
              >
                <span className="flex items-center gap-2">
                  🇮🇳 Hinglish (Hindi + English)
                </span>
                {selectedLanguage === "hinglish" && <Check className="h-3.5 w-3.5 text-purple-400" />}
              </button>
              <button
                onClick={() => handleStartTranscribing("english")}
                className="w-full px-3 py-1.5 text-xs text-left hover:bg-[#2c2c2c] transition flex items-center justify-between text-gray-200"
              >
                <span className="flex items-center gap-2">
                  🌐 English (Standard)
                </span>
                {selectedLanguage === "english" && <Check className="h-3.5 w-3.5 text-purple-400" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
