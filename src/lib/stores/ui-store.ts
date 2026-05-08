import { create } from 'zustand';
import type { TabId } from '@/types/database';

interface UIState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isSheetOpen: boolean;
  sheetContent: React.ReactNode | null;
  openSheet: (content: React.ReactNode) => void;
  closeSheet: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'hoy',
  setActiveTab: (tab) => set({ activeTab: tab }),
  theme: 'system',
  setTheme: (theme) => set({ theme }),
  isSheetOpen: false,
  sheetContent: null,
  openSheet: (content) => set({ isSheetOpen: true, sheetContent: content }),
  closeSheet: () => set({ isSheetOpen: false, sheetContent: null }),
  isSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
}));
