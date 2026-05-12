import { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Music,
  Video,
  Play,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import api from '../services/api';

export const DiscoveryPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ spotify: any[], youtube: any[], apple: any[] }>({ 
    spotify: [], 
    youtube: [], 
    apple: [] 
  });
  const [error, setError] = useState<string | null>(null);

  const linkedAccounts = useAuthStore(state => state.linkedAccounts);
  const setSong = usePlayerStore(state => state.setSong);

  const isSpotifyConnected = linkedAccounts.some(a => a.platform === 'spotify');
  const isYoutubeLinked = linkedAccounts.some(a => a.platform === 'youtube');
  const isAppleLinked = linkedAccounts.some(a => a.platform === 'apple');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    const newResults = { spotify: [], youtube: [], apple: [] };

    try {
      const promises = [];

      if (isSpotifyConnected) {
        const token = localStorage.getItem('spotify_token');
        promises.push(
          api.get('/spotify/neural-insights', { 
            headers: { 'x-spotify-token': token } 
          }).then(res => newResults.spotify = res.data)
        );
      }
      
      if (isYoutubeLinked) {
        const token = localStorage.getItem('youtube_token');
        promises.push(
          api.get('/youtube/neural-insights', { 
            headers: { 'x-youtube-token': token } 
          }).then(res => newResults.youtube = res.data)
        );
      }

      if (isAppleLinked) {
        const token = localStorage.getItem('apple_token');
        promises.push(
          api.get('/apple/neural-insights', { 
            headers: { 'x-apple-token': token } 
          }).then(res => newResults.apple = res.data)
        );
      }

      await Promise.allSettled(promises);
      setResults(newResults);
    } catch (err) {
      setError('Failed to fetch recommendations. Please check your connections.');
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (title: string, platform: 'spotify' | 'youtube' | 'apple', data: any[]) => {
    const Icon = platform === 'spotify' ? Music : platform === 'youtube' ? Video : Play;
    const gradientClass = platform === 'spotify' ? 'from-[#1DB954] to-[#191414]' : platform === 'youtube' ? 'from-[#FF0000] to-[#282828]' : 'from-[#fa243c] to-[#1a1a1a]';
    const accentColor = platform === 'spotify' ? 'text-[#1DB954]' : platform === 'youtube' ? 'text-[#FF0000]' : 'text-[#fa243c]';

    return (
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-24"
      >
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${accentColor}`}>
              <Icon className="w-8 h-8" />
            </div>
            {title} Insights
          </h2>
          <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent mx-8 hidden md:block" />
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{data.length} Nodes Identified</span>
        </div>
        
        {data.length === 0 ? (
          <div className="bg-[#0a0a0a] p-12 rounded-[2.5rem] border border-white/5 border-dashed flex flex-col items-center text-center">
            <p className="text-gray-600 text-xs font-black uppercase tracking-[0.2em]">No neural data captured for {title}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-6">
            {data.map((item, idx) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="group relative bg-[#0a0a0a] p-3 rounded-[1.5rem] border border-white/5 hover:border-white/20 transition-all shadow-lg"
              >
                <div className="relative aspect-square rounded-[1rem] overflow-hidden mb-4 shadow-xl">
                  <img src={item.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" alt={item.title} />
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
                  <button 
                    onClick={() => setSong(item, data)}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                  >
                    <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl">
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </div>
                  </button>
                </div>
                <div className="px-1">
                  <h4 className="font-black text-white text-xs truncate uppercase italic tracking-tighter mb-0.5">{item.title}</h4>
                  <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] truncate">{item.artist_name}</p>
                </div>
                
                <div className="absolute top-3 right-3">
                   <div className={`w-1.5 h-1.5 rounded-full ${accentColor.replace('text', 'bg')} shadow-[0_0_6px_currentColor]`} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Discovery Header */}
      <section className="mb-20 relative overflow-hidden rounded-[3.5rem] bg-[#0a0a0a] border border-white/5 p-12 md:p-20">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Globe className="w-96 h-96 text-blue-500 animate-pulse" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
            <Sparkles className="w-3 h-3" />
            <span>Neural Discovery Protocol v4.0</span>
          </div>
          <h1 className="text-6xl md:text-[8rem] font-black text-white uppercase italic tracking-tighter leading-none mb-8">
            Explore <br /> the Verse.
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl font-medium leading-relaxed mb-12">
            SonicVerse analyzes frequency resonance across your archives to synthesize the next evolution of your listening experience.
          </p>
          {!loading && (
            <button 
              onClick={fetchRecommendations}
              className="group flex items-center gap-3 px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-white/5"
            >
              <Zap className="w-4 h-4 fill-current group-hover:animate-bounce" />
              Recalibrate Grid
            </button>
          )}
        </div>
      </section>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 bg-[#0a0a0a] rounded-[3.5rem] border border-white/5">
          <div className="relative">
             <div className="w-24 h-24 rounded-full border-b-4 border-blue-500 animate-spin" />
             <div className="absolute inset-0 flex items-center justify-center">
                <Music className="w-8 h-8 text-blue-500 animate-pulse" />
             </div>
          </div>
          <p className="mt-10 text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] animate-pulse">Mapping Neural Frequencies</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/5 border border-red-500/10 p-20 rounded-[3.5rem] flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-8 border border-red-500/20">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Frequency Distortion</h3>
            <p className="text-gray-500 text-lg max-w-md font-medium leading-relaxed">{error}</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div 
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {isSpotifyConnected && renderSection('Spotify', 'spotify', results.spotify)}
            {isYoutubeLinked && renderSection('YouTube Music', 'youtube', results.youtube)}
            {isAppleLinked && renderSection('Apple Music', 'apple', results.apple)}
            
            {!isSpotifyConnected && !isYoutubeLinked && !isAppleLinked && (
              <div className="py-32 flex flex-col items-center text-center max-w-2xl mx-auto bg-[#0a0a0a] rounded-[3.5rem] border border-white/5 p-12">
                 <div className="w-24 h-24 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-10 shadow-2xl shadow-blue-500/5">
                    <Zap className="w-10 h-10 text-blue-500" />
                 </div>
                 <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-6 leading-none">Archives Unreachable</h2>
                 <p className="text-gray-500 text-lg font-medium leading-relaxed mb-12">
                    SonicVerse requires access to your external sonic archives to generate neural insights. 
                    Synchronize your accounts to initialize the mapping sequence.
                 </p>
                 <button 
                   onClick={() => window.location.href = '/settings'}
                   className="px-12 py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-white/5 hover:scale-105 transition-all"
                 >
                   Establish Archive Link
                 </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
