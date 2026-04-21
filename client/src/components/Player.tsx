import { useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';

export const Player = () => {
  const { currentSong, isPlaying, togglePlay, currentTime, duration, setCurrentTime, setDuration } = usePlayerStore();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-xl border-t border-gray-800 text-white p-4 flex items-center justify-between z-[1000]">
      <div className="flex items-center gap-4 w-1/3">
        <img src={currentSong.cover_url} alt={currentSong.title} className="w-12 h-12 rounded-lg object-cover shadow-lg" />
        <div className="truncate">
          <h4 className="font-bold text-sm truncate">{currentSong.title}</h4>
          <p className="text-gray-400 text-xs truncate">{currentSong.artist_name}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 flex-1 max-w-xl">
        <div className="flex items-center gap-6">
          <SkipBack className="w-5 h-5 cursor-pointer text-gray-400 hover:text-white transition-colors" />
          <button 
            onClick={togglePlay}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-all active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-1 fill-current" />}
          </button>
          <SkipForward className="w-5 h-5 cursor-pointer text-gray-400 hover:text-white transition-colors" />
        </div>
        <div className="w-full flex items-center gap-3">
          <span className="text-[10px] font-mono text-gray-500 w-8 text-right">
            {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
          </span>
          <input 
            type="range" 
            min="0" 
            max={duration || 0} 
            step="0.1"
            value={currentTime} 
            onChange={handleSeek}
            className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-[10px] font-mono text-gray-500 w-8">
            {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 w-1/3 justify-end">
        <Volume2 className="w-5 h-5 text-gray-400" />
        <div className="w-24 bg-gray-700 h-1 rounded-full overflow-hidden">
            <div className="bg-white h-full w-[80%]" />
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={currentSong.audio_url} 
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
      />
    </div>
  );
};
