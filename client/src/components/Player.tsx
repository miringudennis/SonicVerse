import { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, ChevronDown, MoreHorizontal, Share2, ListMusic, Video } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { motion, AnimatePresence } from 'framer-motion';

export const Player = () => {
  const { 
    currentSong, 
    isPlaying, 
    togglePlay, 
    next,
    previous,
    currentTime, 
    duration, 
    volume,
    setCurrentTime, 
    setDuration,
    setVolume,
    isFullScreen,
    setFullScreen 
  } = usePlayerStore();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.error("Playback failed", e));
      }
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

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
  };

  const onEnded = () => {
    next();
  };

  if (!currentSong) return null;

  // If YouTube and no preview, we'd ideally show an embed, but for now we focus on functional controls
  const isYoutube = currentSong.source === 'YouTube Music' || !!currentSong.videoId;

  return (
    <>
      <AnimatePresence>
        {isFullScreen && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[2000] bg-gradient-to-b from-gray-800 to-black p-8 flex flex-col md:hidden"
          >
            <div className="flex items-center justify-between mb-8">
              <button onClick={() => setFullScreen(false)}>
                <ChevronDown className="w-8 h-8 text-white" />
              </button>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Playing from</p>
                <p className="text-xs font-bold text-white uppercase">{currentSong.source || 'SonicVerse'}</p>
              </div>
              <MoreHorizontal className="w-8 h-8 text-white" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-12">
              <motion.div 
                layoutId="player-art"
                className="w-full aspect-square max-w-[320px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 relative"
              >
                <img src={currentSong.cover_url} className="w-full h-full object-cover" alt="" />
                {isYoutube && (
                    <div className="absolute top-4 right-4 p-2 bg-red-600 rounded-lg">
                        <Video className="w-4 h-4 text-white" />
                    </div>
                )}
              </motion.div>

              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="truncate">
                    <h2 className="text-2xl font-black text-white truncate italic uppercase tracking-tighter">{currentSong.title}</h2>
                    <p className="text-lg text-gray-400 font-bold">{currentSong.artist_name}</p>
                  </div>
                  <button className="text-white">
                    <div className="w-6 h-6 border-2 border-white rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                    </div>
                  </button>
                </div>

                <div className="space-y-2 mt-8">
                  <input 
                    type="range" 
                    min="0" 
                    max={duration || 0} 
                    step="0.1"
                    value={currentTime} 
                    onChange={handleSeek}
                    className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-white"
                  />
                  <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                    <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8">
                  <Share2 className="w-6 h-6 text-gray-400" />
                  <div className="flex items-center gap-8">
                    <SkipBack onClick={(e) => { e.stopPropagation(); previous(); }} className="w-10 h-10 text-white fill-white cursor-pointer active:scale-90 transition-transform" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black active:scale-95 transition-transform"
                    >
                      {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 ml-1 fill-current" />}
                    </button>
                    <SkipForward onClick={(e) => { e.stopPropagation(); next(); }} className="w-10 h-10 text-white fill-white cursor-pointer active:scale-90 transition-transform" />
                  </div>
                  <ListMusic className={`w-6 h-6 ${showQueue ? 'text-white' : 'text-gray-400'}`} onClick={() => setShowQueue(!showQueue)} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        onClick={() => !isFullScreen && setFullScreen(true)}
        className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-xl border-t border-gray-800 text-white p-4 flex items-center justify-between z-[1000] cursor-pointer"
      >
        <div className="flex items-center gap-4 w-1/3">
          <motion.div 
            layoutId="player-art-mini"
            className="w-14 h-14 rounded-2xl overflow-hidden shadow-2xl relative group cursor-pointer"
            onClick={() => !isFullScreen && setFullScreen(true)}
          >
            <img src={currentSong.cover_url} alt={currentSong.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronDown className="w-6 h-6 text-white rotate-180" />
            </div>
          </motion.div>
          <div className="truncate">
            <h4 className="font-black text-white text-sm uppercase italic tracking-tighter truncate">{currentSong.title}</h4>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.15em] truncate">{currentSong.artist_name}</p>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center gap-2 flex-1 max-w-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-6">
            <SkipBack onClick={previous} className="w-4 h-4 cursor-pointer text-gray-500 hover:text-white transition-colors" />
            <button 
              onClick={togglePlay}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-all active:scale-95 shadow-lg shadow-white/5"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
            </button>
            <SkipForward onClick={next} className="w-4 h-4 cursor-pointer text-gray-500 hover:text-white transition-colors" />
          </div>
          <div className="w-full flex items-center gap-3">
            <span className="text-[9px] font-black text-gray-600 w-8 text-right tracking-widest">
              {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
            </span>
            <input 
              type="range" 
              min="0" 
              max={duration || 0} 
              step="0.1"
              value={currentTime} 
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 hover:h-1.5 transition-all"
            />
            <span className="text-[9px] font-black text-gray-600 w-8 tracking-widest">
              {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-1/3 justify-end" onClick={(e) => e.stopPropagation()}>
          <Volume2 className="w-4 h-4 text-gray-500" />
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20 bg-white/10 h-1 rounded-full appearance-none cursor-pointer accent-white hover:h-1.5 transition-all"
          />
        </div>

        {/* Audio Element handles Spotify previews and native songs */}
        <audio 
          ref={audioRef} 
          src={currentSong.audio_url} 
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={onEnded}
        />
        
        {/* Note: Real YouTube playback requires the YouTube IFrame API which we could integrate here if needed. 
            For now, we support the 'audio_url' property if available. */}
      </div>
    </>
  );
};
