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
  setSong: (song: Song) => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  setSong: (song) => set({ currentSong: song, isPlaying: true, currentTime: 0 }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  stop: () => set({ currentSong: null, isPlaying: false, currentTime: 0 }),
}));
