import { create } from 'zustand';

interface UIState {
  isSyncModalOpen: boolean;
  isChatActive: boolean;
  openSyncModal: () => void;
  closeSyncModal: () => void;
  setChatActive: (active: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSyncModalOpen: false,
  isChatActive: false,
  openSyncModal: () => set({ isSyncModalOpen: true }),
  closeSyncModal: () => set({ isSyncModalOpen: false }),
  setChatActive: (active) => set({ isChatActive: active }),
}));
