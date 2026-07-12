// store/workspaceStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Workspace, WorkspaceWithMembers } from "@/types";

interface WorkspaceStore {
  // State
  currentWorkspace: WorkspaceWithMembers | null;
  workspaces: Workspace[];
  isLoading: boolean;

  // Actions
  setCurrentWorkspace: (ws: WorkspaceWithMembers | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  addWorkspace: (ws: Workspace) => void;
  removeWorkspace: (id: string) => void;
  updateWorkspace: (id: string, patch: Partial<Workspace>) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  devtools(
    persist(
      (set) => ({
        currentWorkspace: null,
        workspaces: [],
        isLoading: false,

        setCurrentWorkspace: (ws) => set({ currentWorkspace: ws }),

        setWorkspaces: (workspaces) => set({ workspaces }),

        addWorkspace: (ws) =>
          set((s) => ({ workspaces: [...s.workspaces, ws] })),

        removeWorkspace: (id) =>
          set((s) => ({
            workspaces: s.workspaces.filter((w) => w.id !== id),
            currentWorkspace:
              s.currentWorkspace?.id === id ? null : s.currentWorkspace,
          })),

        updateWorkspace: (id, patch) =>
          set((s) => ({
            workspaces: s.workspaces.map((w) =>
              w.id === id ? { ...w, ...patch } : w
            ),
            currentWorkspace:
              s.currentWorkspace?.id === id
                ? ({ ...s.currentWorkspace, ...patch } as WorkspaceWithMembers)
                : s.currentWorkspace,
          })),

        setIsLoading: (isLoading) => set({ isLoading }),
      }),
      {
        name: "rtxnotion-workspace",
        // Only persist the current workspace ID, not full object
        partialize: (s) => ({ workspaces: s.workspaces }),
      }
    )
  )
);
