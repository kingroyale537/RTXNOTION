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

  // Command palette (Ctrl+K)
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;

  // Settings modal
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;

  // Share modal
  sharePageId: string | null;
  setSharePageId: (id: string | null) => void;

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

        commandOpen: false,
        setCommandOpen: (commandOpen) => set({ commandOpen }),
        toggleCommand: () => set((s) => ({ commandOpen: !s.commandOpen })),

        settingsOpen: false,
        setSettingsOpen: (settingsOpen) => set({ settingsOpen }),

        sharePageId: null,
        setSharePageId: (sharePageId) => set({ sharePageId }),

        theme: "system",
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: "rtxnotion-ui",
        partialize: (s) => ({
          sidebarOpen: s.sidebarOpen,
          sidebarWidth: s.sidebarWidth,
          theme: s.theme,
        }),
      }
    )
  )
);
