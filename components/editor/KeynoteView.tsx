"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Play, Maximize2, Sparkles, Layers } from "lucide-react";

interface KeynoteViewProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  slides?: Array<{
    heading: string;
    subheading?: string;
    points: string[];
    accentColor?: string;
  }>;
}

export function KeynoteView({
  isOpen,
  onClose,
  title = "Voltaic Product Strategy",
  slides = [
    {
      heading: "Voltaic Mobile & iOS Platform",
      subheading: "A self-hosted, zero-latency collaborative workspace for iPhone & Mac",
      points: [
        "Instant PWA access via local network & Home Screen app mode",
        "Native iOS bundle generated via Capacitor and Xcode 26.6",
        "Steve Jobs Ambient Voice-to-Knowledge engine",
        "Proactive 8:00 AM Executive AI Briefings"
      ],
      accentColor: "from-indigo-500 to-purple-600"
    },
    {
      heading: "Steve Jobs Visionary Architecture",
      subheading: "Simplicity is the ultimate sophistication",
      points: [
        "Sub-10ms local-first Yjs CRDT real-time document synchronization",
        "Contextual keyboard formatting toolbar attached above iOS virtual keyboard",
        "Zero-prompt background intelligence for automatic task extraction",
        "Hardware-backed enterprise vault security with Touch ID / Face ID"
      ],
      accentColor: "from-purple-500 to-pink-600"
    },
    {
      heading: "The $1B Ecosystem Model",
      subheading: "Unified workspace replacing Notion, Slack Huddles, and Keynote",
      points: [
        "One-tap Keynote presentation deck generation directly from documents",
        "30% creator marketplace for custom AI agents and workflow templates",
        "Cross-device handoff continuity across iPhone, iPad, and macOS",
        "Zero-compromise performance and offline-first availability"
      ],
      accentColor: "from-amber-500 to-orange-600"
    }
  ]
}: KeynoteViewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slide = slides[currentSlide];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-6 md:p-12 animate-in fade-in duration-300 select-none">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm">
            V
          </div>
          <div>
            <h3 className="font-semibold text-sm text-zinc-300">{title}</h3>
            <p className="text-xs text-zinc-500">Keynote Presentation Mode</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-zinc-500 font-mono">
            {currentSlide + 1} / {slides.length}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full my-auto space-y-8 animate-in zoom-in-95 duration-200 key={currentSlide}">
        {/* Accent Bar */}
        <div className={`w-24 h-2 bg-gradient-to-r ${slide.accentColor || 'from-indigo-500 to-purple-600'} rounded-full shadow-lg shadow-indigo-500/30`} />

        <div className="space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {slide.heading}
          </h1>
          {slide.subheading && (
            <p className="text-lg md:text-2xl text-zinc-400 font-light">
              {slide.subheading}
            </p>
          )}
        </div>

        {/* Bullet points */}
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          {slide.points.map((pt, idx) => (
            <div key={idx} className="flex items-start space-x-4">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 mt-2.5 flex-shrink-0 shadow-sm shadow-indigo-400" />
              <p className="text-base md:text-xl text-zinc-200 leading-relaxed">{pt}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation Bar */}
      <div className="flex items-center justify-between z-10 pt-4 border-t border-zinc-900">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 text-sm font-medium flex items-center space-x-2 transition-all active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex space-x-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === currentSlide ? "w-8 bg-indigo-500" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-sm font-medium flex items-center space-x-2 transition-all active:scale-95 text-white"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
