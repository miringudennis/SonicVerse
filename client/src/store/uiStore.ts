import { create } from 'zustand';

interface UIState {
  isSyncModalOpen: boolean;
  openSyncModal: () => void;
  closeSyncModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSyncModalOpen: false,
  openSyncModal: () => set({ isSyncModalOpen: true }),
  closeSyncModal: () => set({ isSyncModalOpen: false }),
}));
