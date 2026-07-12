// lib/utils.ts
// General-purpose utility functions.

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a random hex color from a fixed palette for presence cursors. */
export const PRESENCE_COLORS = [
  "#6366f1", // indigo
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ef4444", // red
  "#06b6d4", // cyan
];

export function getRandomPresenceColor(): string {
  return PRESENCE_COLORS[Math.floor(Math.random() * PRESENCE_COLORS.length)];
}

/** Slugify a string for workspace / page URLs. */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Abbreviate a name to initials (max 2 chars). */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

/** Format bytes to a human-readable string. */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/** Throttle a function call. */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  ms: number
): T {
  let lastTime = 0;
  return ((...args) => {
    const now = Date.now();
    if (now - lastTime >= ms) {
      lastTime = now;
      fn(...args);
    }
  }) as T;
}

/** Fractional index between two floats (for drag-drop reordering). */
export function midpoint(a: number, b: number): number {
  return (a + b) / 2;
}

/** Sleep (for testing / animation delays). */
export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
