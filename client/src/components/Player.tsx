import { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, ChevronDown, MoreHorizontal, Share2, ListMusic } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { motion, AnimatePresence } from 'framer-motion';
import { monochromeService } from '../services/monochrome';
import toast from 'react-hot-toast';

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
  const [audioSrc, setAudioSrc] = useState<string>(currentSong?.audio_url || '');

  useEffect(() => {
    const fetchStream = async () => {
        if (currentSong?.id) {
            try {
                const streamUrl = await monochromeService.getStreamUrl(currentSong.id);
                setAudioSrc(streamUrl);
            } catch (err) {
                toast.error('High-fidelity stream unavailable.');
                setAudioSrc(currentSong.audio_url || '');
            }
        } else {
            setAudioSrc(currentSong?.audio_url || '');
        }
    };
    fetchStream();
  }, [currentSong]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        // Don't toggle play if the user is typing in an input or textarea
        if (
          document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA' ||
          (document.activeElement as HTMLElement)?.isContentEditable
        ) {
          return;
        }
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

  return (
    <>
      <AnimatePresence>
        {isFullScreen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(30px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[2000] bg-black/80 p-8 flex flex-col md:hidden"
          >
            {/* Celestial Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.1)_0%,_transparent_70%)]" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <button onClick={() => setFullScreen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-all">
                <ChevronDown className="w-8 h-8 text-white" />
              </button>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Celestial Stream</p>
              </div>
              <MoreHorizontal className="w-8 h-8 text-white" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-12 relative z-10">
              <motion.div 
                layoutId="player-art"
                className="w-full aspect-square max-w-[320px] rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.3)] border border-white/10 relative"
              >
                <img src={currentSong.cover_url} className="w-full h-full object-cover" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </motion.div>

              <div className="w-full">
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter text-center">{currentSong.title}</h2>
                <p className="text-lg text-blue-400 font-bold text-center mt-2">{currentSong.artist_name}</p>

                <div className="space-y-4 mt-12">
                  <input 
                    type="range" 
                    min="0" 
                    max={duration || 0} 
                    step="0.1"
                    value={currentTime} 
                    onChange={handleSeek}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <span>{Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}</span>
                    <span>{Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-10">
                  <Share2 className="w-6 h-6 text-gray-400 hover:text-white cursor-pointer" />
                  <div className="flex items-center gap-8">
                    <SkipBack onClick={(e) => { e.stopPropagation(); previous(); }} className="w-10 h-10 text-white cursor-pointer hover:text-blue-400 transition-colors" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                      className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                    >
                      {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 ml-1 fill-current" />}
                    </button>
                    <SkipForward onClick={(e) => { e.stopPropagation(); next(); }} className="w-10 h-10 text-white cursor-pointer hover:text-blue-400 transition-colors" />
                  </div>
                  <ListMusic className={`w-6 h-6 cursor-pointer ${showQueue ? 'text-blue-500' : 'text-gray-400'}`} onClick={() => setShowQueue(!showQueue)} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        onClick={() => !isFullScreen && setFullScreen(true)}
        className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/80 backdrop-blur-3xl border-t border-white/10 text-white p-4 flex items-center justify-between z-[1000] cursor-pointer shadow-[0_-20px_40px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-4 w-1/3">
          <motion.div 
            layoutId="player-art-mini"
            className="w-14 h-14 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.2)] relative group cursor-pointer"
            onClick={() => !isFullScreen && setFullScreen(true)}
          >
            <img src={currentSong.cover_url} alt={currentSong.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronDown className="w-6 h-6 text-white rotate-180" />
            </div>
          </motion.div>
          <div className="truncate">
            <h4 className="font-black text-white text-sm uppercase italic tracking-tighter truncate">{currentSong.title}</h4>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.15em] truncate">{currentSong.artist_name}</p>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center gap-2 flex-1 max-w-xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-6">
            <SkipBack onClick={previous} className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-400 transition-colors" />
            <button 
              onClick={togglePlay}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
            </button>
            <SkipForward onClick={next} className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-400 transition-colors" />
          </div>
          <div className="w-full flex items-center gap-3">
            <input 
              type="range" 
              min="0" 
              max={duration || 0} 
              step="0.1"
              value={currentTime} 
              onChange={handleSeek}
              className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500 hover:h-1.5 transition-all"
            />
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

        <audio 
          ref={audioRef} 
          src={audioSrc} 
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={onEnded}
        />
      </div>
    </>
  );
};
