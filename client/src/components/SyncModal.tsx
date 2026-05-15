import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Music, Video, Play, Shield, CheckCircle2, Loader2, ArrowRight, Zap } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import toast from 'react-hot-toast';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PLATFORMS = [
  { id: 'spotify', name: 'Spotify', icon: Music, color: 'text-[#1DB954]', bg: 'bg-[#1DB954]/10', border: 'border-[#1DB954]/20' },
  { id: 'youtube', name: 'YouTube Music', icon: Video, color: 'text-[#FF0000]', bg: 'bg-[#FF0000]/10', border: 'border-[#FF0000]/20' },
  { id: 'apple', name: 'Apple Music', icon: Play, color: 'text-[#fa243c]', bg: 'bg-[#fa243c]/10', border: 'border-[#fa243c]/20' },
];

export const SyncModal = ({ isOpen, onClose }: SyncModalProps) => {
  const linkedAccounts = useAuthStore(state => state.linkedAccounts);
  const linkAccount = useAuthStore(state => state.linkAccount);
  const [loadingPlatform, setLoadingPlatform] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_SUCCESS') {
        // The store is already updated in the callback page, 
        // but we might need to refresh local state if needed.
        setLoadingPlatform(null);
        toast.success(`${event.data.platform.toUpperCase()} connection established.`);
      } else if (event.data?.type === 'SYNC_ERROR') {
        setLoadingPlatform(null);
        toast.error(`Connection failed: ${event.data.error || 'Unknown error'}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [linkAccount]);

  const handleConnect = async (platformId: string) => {
    setLoadingPlatform(platformId);
    try {
      let authUrl = '';
      if (platformId === 'spotify') {
        const { data } = await api.get('/spotify/auth-url');
        authUrl = data.url;
      } else if (platformId === 'youtube') {
        const { data } = await api.get('/youtube/auth-url');
        authUrl = data.url;
      } else if (platformId === 'apple') {
        // Placeholder for Apple Music
        setTimeout(() => {
          setLoadingPlatform(null);
          toast.error('Apple Music integration pending protocol release.');
        }, 1000);
        return;
      }

      if (authUrl) {
        const width = 600;
        const height = 700;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;
        
        window.open(
          authUrl,
          'SonicVerseSync',
          `width=${width},height=${height},top=${top},left=${left}`
        );
      }
    } catch (err) {
      console.error('Failed to get auth URL', err);
      setLoadingPlatform(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-t-[3rem] md:rounded-[3rem] overflow-hidden shadow-2xl mt-auto md:mt-0"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
            
            <div className="p-8 md:p-12">
               <div className="flex items-center justify-between mb-8 md:mb-10">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-2xl shadow-blue-500/10">
                        <Zap className="w-5 h-5 md:w-6 md:h-6" />
                     </div>
                     <div>
                        <h2 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter">Sync Archive.</h2>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Neural Connection Interface</p>
                     </div>
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all hover:bg-white/10"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
               </div>

               <div className="space-y-3 md:space-y-4">
                  {PLATFORMS.map((platform) => {
                    const account = linkedAccounts.find(a => a.platform === platform.id);
                    const isLinked = !!account;
                    const isLoading = loadingPlatform === platform.id;

                    return (
                      <div 
                        key={platform.id}
                        className={`group relative flex items-center justify-between p-5 md:p-6 rounded-3xl md:rounded-[2rem] border transition-all duration-500 ${
                          isLinked ? `${platform.bg} ${platform.border}` : 'bg-white/5 border-white/5 hover:border-white/10'
                        }`}
                      >
                         <div className="flex items-center gap-4 md:gap-6">
                            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 ${isLinked ? platform.color : 'text-gray-700'}`}>
                               <platform.icon className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                               <h3 className="font-black text-white uppercase italic tracking-tighter text-base md:text-lg">{platform.name}</h3>
                               {isLinked ? (
                                  <div className="flex items-center gap-2 mt-0.5">
                                     <CheckCircle2 className={`w-2.5 h-2.5 md:w-3 md:h-3 ${platform.color}`} />
                                     <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Linked as {account.username}</p>
                                  </div>
                               ) : (
                                  <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mt-0.5 italic">Awaiting Connection</p>
                               )}
                            </div>
                         </div>

                         {isLinked ? (
                            <div className="flex items-center gap-3 md:gap-4">
                               <span className="hidden sm:inline-block text-[9px] md:text-[10px] font-black uppercase tracking-widest text-green-500/50">Synchronized</span>
                               <button 
                                 onClick={() => handleConnect(platform.id)}
                                 className="px-4 py-2 md:px-6 md:py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all"
                               >
                                 Update
                               </button>
                            </div>
                         ) : (
                            <button 
                              onClick={() => handleConnect(platform.id)}
                              disabled={isLoading}
                              className="px-6 py-3 md:px-8 md:py-3 bg-white text-black rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 disabled:opacity-50"
                            >
                               {isLoading ? <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> : (
                                 <>
                                   Establish Link
                                   <ArrowRight className="w-3 h-3" />
                                 </>
                               )}
                            </button>
                         )}
                      </div>
                    );
                  })}
               </div>

               <div className="mt-8 md:mt-10 p-5 md:p-6 bg-blue-600/5 border border-blue-500/10 rounded-3xl flex items-start gap-4">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 text-blue-500 shrink-0 mt-0.5 md:mt-1" />
                  <p className="text-[10px] md:text-[11px] text-blue-200/40 font-medium leading-relaxed uppercase tracking-wider">
                    SonicVerse protocol ensures encrypted synchronization. Your archive credentials are never stored locally. Only neural metadata is indexed for synthesis.
                  </p>
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
