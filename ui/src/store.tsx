import { create } from "zustand"
import type { Asset, Campaign } from "./types"

interface AppState {
  sidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
  campaigns: Campaign[]
  setCampaigns: (campaigns: Campaign[]) => void
  assets: Record<string, Asset>
  updateAsset: (assets: Record<string, Asset>) => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  campaigns: [],
  setCampaigns: (campaigns) => set({ campaigns }),
  assets: {},
  updateAsset: (newAssets) => set((state) => ({ assets: { ...state.assets, ...newAssets } })),
}))
