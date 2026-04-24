import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Loader2, 
  Music, 
  Video, 
  Play as AppleMusicIcon, 
  ArrowRight, 
  ShieldCheck, 
  Link2,
  Play,
  RotateCcw,
  Zap,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { motion, AnimatePresence } from 'framer-motion';

export const DiscoveryPage = () => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [view, setView] = useState<'welcome' | 'results'>('welcome');
  const [error, setError] = useState<string | null>(null);

  const linkedAccounts = useAuthStore(state => state.linkedAccounts);
  const setSong = usePlayerStore(state => state.setSong);
  const navigate = useNavigate();

  const isSpotifyLinked = linkedAccounts.some(a => a.platform === 'spotify');
  const isYoutubeLinked = linkedAccounts.some(a => a.platform === 'youtube');
  const isAppleLinked = linkedAccounts.some(a => a.platform === 'apple');

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('spotify_token');
    
    if (!token) {
      setError('Spotify connection lost. Please re-sync.');
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/spotify/recommendations', {
        headers: { 'x-spotify-token': token }
      });
      setRecommendations(res.data);
      setView('results');
    } catch (err: any) {
      console.error('Failed to fetch recommendations', err);
      setError('Neural algorithm failed to generate seeds. Check your Spotify connection.');
    } finally {
      setLoading(false);
    }
  };

  const platforms = [
    { 
      id: 'spotify', 
      name: 'Spotify', 
      icon: Music, 
      linked: isSpotifyLinked, 
      color: 'bg-green-600', 
      desc: 'Sync your top tracks and artists for neural recommendations.' 
    },
    { 
      id: 'youtube', 
      name: 'YT Music', 
      icon: Video, 
      linked: isYoutubeLinked, 
      color: 'bg-red-600', 
      desc: 'Algorithmically derive mood from your YouTube playback history.' 
    },
    { 
      id: 'apple', 
      name: 'Apple Music', 
      icon: AppleMusicIcon, 
      linked: isAppleLinked, 
      color: 'bg-pink-600', 
      desc: 'Integrate your curated Apple Music library into the discovery engine.' 
    },
  ];

  return (
    <div className="py-8 space-y-12 pb-32">
      <AnimatePresence mode="wait">
        {view === 'welcome' ? (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                    <Zap className="w-3 h-3" /> Neural Discovery Engine
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-6">
                    Expand Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Sonic Realm</span>
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                    Connect your streaming platforms to allow our neural algorithms to analyze your DNA and suggest similar sonic signatures.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                {platforms.map((p) => (
                    <div key={p.id} className="group relative bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800/50 backdrop-blur-xl hover:border-white/10 transition-all">
                        <div className={`w-14 h-14 rounded-2xl ${p.color}/20 flex items-center justify-center mb-6 border border-${p.id === 'spotify' ? 'green' : p.id === 'apple' ? 'pink' : 'red'}-500/20`}>
                            <p.icon className={`w-7 h-7 ${p.id === 'spotify' ? 'text-green-500' : p.id === 'apple' ? 'text-pink-500' : 'text-red-500'}`} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase italic mb-3 tracking-tighter">{p.name}</h3>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8">{p.desc}</p>
                        
                        {p.linked ? (
                            <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                                <ShieldCheck className="w-4 h-4" /> Account Linked
                            </div>
                        ) : (
                            <button 
                                onClick={() => navigate(`/sync/${p.id}`)}
                                className="w-full py-3 bg-gray-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
                            >
                                <Link2 className="w-3 h-3" /> Link Account
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex flex-col items-center gap-6">
                <button 
                    disabled={!isSpotifyLinked || loading}
                    onClick={fetchRecommendations}
                    className={`group px-12 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center gap-4 ${
                        isSpotifyLinked 
                        ? 'bg-white text-black hover:bg-blue-500 hover:text-white shadow-2xl shadow-blue-500/20' 
                        : 'bg-gray-900 text-gray-700 cursor-not-allowed border border-gray-800'
                    }`}
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Initialize Discovery
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                {!isSpotifyLinked && (
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">Connect at least one platform to begin</p>
                )}
                {error && (
                    <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-12"
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 bg-gray-900/40 p-10 rounded-[3rem] border border-gray-800/50 backdrop-blur-xl">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Neural Output</h2>
                    </div>
                    <p className="text-gray-500 text-sm max-w-xl">Algorithm synthesized 20 recommendations based on your listening DNA. These tracks share similar frequencies with your most vibed artists.</p>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setView('welcome')}
                        className="px-6 py-3 bg-gray-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 transition-all flex items-center gap-2"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180" /> Back
                    </button>
                    <button 
                        onClick={fetchRecommendations}
                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                    >
                        <RotateCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Resynthesize
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {recommendations.map((track) => (
                    <div key={track.id} className="group bg-gray-900/40 p-6 rounded-[2.5rem] border border-gray-800/50 hover:bg-gray-800/60 transition-all duration-500">
                        <div className="relative aspect-square mb-6 overflow-hidden rounded-3xl shadow-2xl">
                            <img src={track.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                            <button 
                                onClick={() => setSong(track)}
                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-500"
                            >
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition duration-500">
                                    <Play className="w-8 h-8 ml-1 fill-current" />
                                </div>
                            </button>
                            <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[8px] font-black text-white uppercase tracking-widest">Preview</span>
                            </div>
                        </div>
                        <h3 className="font-black text-lg text-white mb-1 truncate">{track.title}</h3>
                        <p className="text-gray-500 text-sm mb-4 font-bold uppercase tracking-tight truncate">{track.artist_name}</p>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{track.source} Signal</span>
                            </div>
                            <a href={track.external_url} target="_blank" rel="noreferrer" className="text-gray-600 hover:text-white transition-colors">
                                <Globe className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
