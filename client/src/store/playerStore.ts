import { create } from 'zustand';

interface Song {
  id: string;
  title: string;
  artist_name: string;
  audio_url: string;
  cover_url: string;
}

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  isFullScreen: boolean;
  setSong: (song: Song) => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setFullScreen: (isFull: boolean) => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isFullScreen: false,
  setSong: (song) => set({ currentSong: song, isPlaying: true, currentTime: 0 }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  setFullScreen: (isFull) => set({ isFullScreen: isFull }),
  stop: () => set({ currentSong: null, isPlaying: false, currentTime: 0 }),
}));
