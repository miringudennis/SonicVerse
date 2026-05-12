import { create } from 'zustand';

interface Song {
  id: string;
  title: string;
  artist_name: string;
  audio_url?: string;
  videoId?: string;
  cover_url: string;
  source?: string;
}

interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isFullScreen: boolean;
  setSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setFullScreen: (isFull: boolean) => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  queue: [],
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isFullScreen: false,
  setSong: (song, queue = []) => set({ 
    currentSong: song, 
    queue: queue.length > 0 ? queue : [song],
    isPlaying: true, 
    currentTime: 0 
  }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  next: () => {
    const { currentSong, queue } = get();
    if (!currentSong || queue.length === 0) return;
    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    const nextSong = queue[(currentIndex + 1) % queue.length];
    set({ currentSong: nextSong, isPlaying: true, currentTime: 0 });
  },
  previous: () => {
    const { currentSong, currentTime, queue } = get();
    if (!currentSong || queue.length === 0) return;
    
    // If we've played more than 3 seconds, just restart the song
    if (currentTime > 3) {
        set({ currentTime: 0 });
        return;
    }

    const currentIndex = queue.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    const prevSong = queue[prevIndex];
    set({ currentSong: prevSong, isPlaying: true, currentTime: 0 });
  },
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  setVolume: (volume) => set({ volume: volume }),
  setFullScreen: (isFull) => set({ isFullScreen: isFull }),
  stop: () => set({ currentSong: null, isPlaying: false, currentTime: 0 }),
}));
