"use client";

import React from "react";
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, ArrowUpRight, Calendar, Users, X } from "lucide-react";

interface ExecutiveBriefingProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExecutiveBriefing({ isOpen, onClose }: ExecutiveBriefingProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />

      {/* Briefing Panel */}
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-zinc-100 max-h-[90vh] overflow-y-auto">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">8:00 AM Executive Digest</h3>
              <div className="flex items-center space-x-2 text-xs text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Today, July 22, 2026</span>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="py-4 space-y-5">
          {/* Key metrics grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 text-center">
              <div className="text-2xl font-bold text-indigo-400">14</div>
              <div className="text-[11px] text-zinc-400 font-medium mt-0.5">Tasks Completed</div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 text-center">
              <div className="text-2xl font-bold text-emerald-400">98.4%</div>
              <div className="text-[11px] text-zinc-400 font-medium mt-0.5">Sync Efficiency</div>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 text-center">
              <div className="text-2xl font-bold text-purple-400">6</div>
              <div className="text-[11px] text-zinc-400 font-medium mt-0.5">Active Pages</div>
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-zinc-950 border border-indigo-500/30 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>Workspace Health & Momentum</span>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed">
              Team productivity peaked during the afternoon sprint. Mobile iOS integration is 100% complete, and CRDT real-time document sync is operating at zero latency.
            </p>
          </div>

          {/* Action Items requiring decisions */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Items Requiring Decision Today</h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">iOS Native Distribution Signing</div>
                    <div className="text-[11px] text-zinc-400">Confirm Apple Developer Provisioning Profile for physical device install.</div>
                  </div>
                </div>
                <button className="text-xs text-indigo-400 hover:underline flex items-center flex-shrink-0">
                  Review <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">Offline Cache Persistence</div>
                    <div className="text-[11px] text-zinc-400">IndexedDB local store verified for offline document editing.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">Generated by Voltaic Ambient AI</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
          >
            Dismiss Briefing
          </button>
        </div>
      </div>
    </div>
  );
}
