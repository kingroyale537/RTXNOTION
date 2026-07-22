"use client";

import React, { useState } from "react";
import { 
  Home, 
  Search, 
  Mic, 
  Inbox, 
  Menu, 
  Plus, 
  Sparkles,
  Presentation,
  BookOpen
} from "lucide-react";
import { MobileDrawer } from "./MobileDrawer";
import { VoiceCaptureModal } from "./VoiceCaptureModal";

interface MobileBottomNavProps {
  onOpenSearch?: () => void;
  onOpenNewPage?: () => void;
  onOpenKeynote?: () => void;
  onOpenBriefing?: () => void;
}

export function MobileBottomNav({
  onOpenSearch,
  onOpenNewPage,
  onOpenKeynote,
  onOpenBriefing,
}: MobileBottomNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  return (
    <>
      {/* Pinned Bottom Navigation for Mobile Devices */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800/80 pb-safe px-4 py-2 flex items-center justify-around select-none shadow-2xl">
        {/* Drawer Toggle */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center justify-center w-12 h-11 text-zinc-400 hover:text-white active:scale-95 transition-all"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium tracking-tight">Menu</span>
        </button>

        {/* Global Search */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center w-12 h-11 text-zinc-400 hover:text-white active:scale-95 transition-all"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium tracking-tight">Search</span>
        </button>

        {/* Steve Jobs Edition: Voice Capture Center Action Button */}
        <button
          onClick={() => setVoiceOpen(true)}
          className="relative -top-3 w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 active:scale-90 transition-all border-2 border-zinc-950"
          title="Voice-to-Knowledge Capture"
        >
          <Mic className="w-6 h-6 animate-pulse" />
        </button>

        {/* Executive AI Briefing */}
        <button
          onClick={onOpenBriefing}
          className="flex flex-col items-center justify-center w-12 h-11 text-zinc-400 hover:text-indigo-400 active:scale-95 transition-all"
        >
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <span className="text-[10px] mt-1 font-medium tracking-tight text-indigo-300">Digest</span>
        </button>

        {/* One-Tap Keynote Mode */}
        <button
          onClick={onOpenKeynote}
          className="flex flex-col items-center justify-center w-12 h-11 text-zinc-400 hover:text-amber-400 active:scale-95 transition-all"
        >
          <Presentation className="w-5 h-5 text-amber-400" />
          <span className="text-[10px] mt-1 font-medium tracking-tight text-amber-300">Keynote</span>
        </button>
      </nav>

      {/* Slide-Over Workspace Drawer */}
      <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* Voice-to-Knowledge Modal */}
      <VoiceCaptureModal isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </>
  );
}
