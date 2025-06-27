import { create } from "zustand"

interface AppState {
  sidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
}))
