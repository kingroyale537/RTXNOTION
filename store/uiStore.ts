// store/uiStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UIStore {
  // Sidebar
  sidebarOpen: boolean;
  sidebarWidth: number;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarWidth: (width: number) => void;

  // AI Sidebar
  aiSidebarOpen: boolean;
  activeAgentId: string;
  toggleAiSidebar: () => void;
  setAiSidebarOpen: (open: boolean) => void;
  setActiveAgentId: (id: string) => void;

  // Command palette (Ctrl+K)
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;

  // Settings modal
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;

  // Trash modal
  trashOpen: boolean;
  setTrashOpen: (open: boolean) => void;

  // History sidebar
  historyOpen: boolean;
  setHistoryOpen: (open: boolean) => void;

  // Share modal
  sharePageId: string | null;
  setSharePageId: (id: string | null) => void;

  // Meeting Notes modal
  meetingNotesOpen: boolean;
  setMeetingNotesOpen: (open: boolean) => void;
  toggleMeetingNotes: () => void;

  // Theme
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        sidebarWidth: 260,
        toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
        setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
        setSidebarWidth: (sidebarWidth) => set({ sidebarWidth }),

        aiSidebarOpen: false,
        activeAgentId: "welcome-voltaic",
        toggleAiSidebar: () => set((s) => ({ aiSidebarOpen: !s.aiSidebarOpen })),
        setAiSidebarOpen: (aiSidebarOpen) => set({ aiSidebarOpen }),
        setActiveAgentId: (activeAgentId) => set({ activeAgentId }),

        commandOpen: false,
        setCommandOpen: (commandOpen) => set({ commandOpen }),
        toggleCommand: () => set((s) => ({ commandOpen: !s.commandOpen })),

        settingsOpen: false,
        setSettingsOpen: (settingsOpen) => set({ settingsOpen }),

        trashOpen: false,
        setTrashOpen: (trashOpen) => set({ trashOpen }),

        historyOpen: false,
        setHistoryOpen: (historyOpen) => set({ historyOpen }),

        sharePageId: null,
        setSharePageId: (sharePageId) => set({ sharePageId }),

        meetingNotesOpen: false,
        setMeetingNotesOpen: (meetingNotesOpen) => set({ meetingNotesOpen }),
        toggleMeetingNotes: () => set((s) => ({ meetingNotesOpen: !s.meetingNotesOpen })),

        theme: "system",
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: "voltaic-ui",
        partialize: (s) => ({
          sidebarOpen: s.sidebarOpen,
          sidebarWidth: s.sidebarWidth,
          aiSidebarOpen: s.aiSidebarOpen,
          activeAgentId: s.activeAgentId,
          theme: s.theme,
        }),
      }
    )
  )
);
