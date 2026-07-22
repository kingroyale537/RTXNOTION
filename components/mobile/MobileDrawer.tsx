"use client";

import React from "react";
import { 
  X, 
  FileText, 
  Star, 
  Folder, 
  Settings, 
  Moon, 
  Sun, 
  Plus, 
  Layers,
  Search,
  Sparkles,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { theme, setTheme } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer content panel */}
      <div className="relative w-4/5 max-w-xs bg-zinc-950 text-zinc-100 h-full shadow-2xl flex flex-col pt-safe pb-safe z-10 border-r border-zinc-800 animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
              V
            </div>
            <div>
              <h2 className="font-semibold text-sm leading-none">Voltaic</h2>
              <span className="text-[11px] text-zinc-400">Collaborative Workspace</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Links & Workspaces */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Main Sections */}
          <div className="space-y-1">
            <Link 
              href="/dashboard"
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 text-sm font-medium transition-colors"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Workspace Dashboard</span>
            </Link>

            <Link 
              href="/editor-widget"
              onClick={onClose}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-zinc-800/60 text-sm font-medium transition-colors"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>Interactive Notes</span>
            </Link>
          </div>

          {/* Favorites Section */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-3 mb-1">
              Favorites
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800/40 cursor-pointer">
                <div className="flex items-center space-x-2.5 truncate">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="truncate">Product Roadmap 2026</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800/40 cursor-pointer">
                <div className="flex items-center space-x-2.5 truncate">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="truncate">Team Knowledge Base</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
              </div>
            </div>
          </div>

          {/* Private Section */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 px-3 mb-1">
              Private Pages
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800/40 cursor-pointer">
                <div className="flex items-center space-x-2.5 truncate">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate">Weekly Sprint Tasks</span>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800/40 cursor-pointer">
                <div className="flex items-center space-x-2.5 truncate">
                  <FileText className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate">Personal Brainstorming</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-zinc-800 space-y-2 bg-zinc-950">
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center space-x-2">
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            </div>
            <span className="text-xs text-zinc-500 capitalize">{theme}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
