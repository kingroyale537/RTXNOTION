// store/presenceStore.ts
import { create } from "zustand";
import type { PresenceUser } from "@/types";

interface PresenceStore {
  // pageId → array of users currently on that page
  presence: Record<string, PresenceUser[]>;

  setPagePresence: (pageId: string, users: PresenceUser[]) => void;
  clearPagePresence: (pageId: string) => void;
  upsertUser: (pageId: string, user: PresenceUser) => void;
  removeUser: (pageId: string, userId: string) => void;
  updateCursor: (
    pageId: string,
    userId: string,
    cursor: { anchor: number; head: number } | null
  ) => void;
}

export const usePresenceStore = create<PresenceStore>()((set) => ({
  presence: {},

  setPagePresence: (pageId, users) =>
    set((s) => ({ presence: { ...s.presence, [pageId]: users } })),

  clearPagePresence: (pageId) =>
    set((s) => {
      const next = { ...s.presence };
      delete next[pageId];
      return { presence: next };
    }),

  upsertUser: (pageId, user) =>
    set((s) => {
      const existing = s.presence[pageId] ?? [];
      const filtered = existing.filter((u) => u.userId !== user.userId);
      return { presence: { ...s.presence, [pageId]: [...filtered, user] } };
    }),

  removeUser: (pageId, userId) =>
    set((s) => ({
      presence: {
        ...s.presence,
        [pageId]: (s.presence[pageId] ?? []).filter((u) => u.userId !== userId),
      },
    })),

  updateCursor: (pageId, userId, cursor) =>
    set((s) => ({
      presence: {
        ...s.presence,
        [pageId]: (s.presence[pageId] ?? []).map((u) =>
          u.userId === userId ? { ...u, cursor } : u
        ),
      },
    })),
}));
