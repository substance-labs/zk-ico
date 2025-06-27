import { create } from "zustand"

export const useAppStore = create((set) => ({
  sidebarOpen: false,
  closeSidebar: () => set(() => ({ sidebarOpen: false })),
  openSidebar: () => set(() => ({ sidebarOpen: true })),
}))
