import { useState, useEffect } from 'react';
import { 
  Loader2, 
  AlertCircle, 
  Music,
  Video,
  Play
} from 'lucide-react';
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
    const colorClass = platform === 'spotify' ? 'text-green-500' : platform === 'youtube' ? 'text-red-500' : 'text-pink-500';

    return (
      <section className="mb-12">
        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-8 flex items-center gap-3">
          <Icon className={colorClass} />
          {title} Suggestions
        </h2>
        
        {data.length === 0 ? (
          <p className="text-gray-600 italic text-xs font-bold uppercase tracking-widest">No neural insights available for {title} yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {data.map((item) => (
              <div key={item.id} className="group bg-gray-900/40 p-4 rounded-[2rem] border border-gray-800/50 hover:border-white/10 transition-all cursor-pointer relative overflow-hidden">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-lg border border-white/5">
                  <img src={item.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt={item.title} />
                  <button 
                    onClick={() => setSong(item)}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px]"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                  </button>
                </div>
                <h4 className="font-bold text-white text-[11px] truncate uppercase tracking-tighter">{item.title}</h4>
                <p className="text-[9px] text-gray-500 mt-1 font-black uppercase tracking-widest">{item.artist_name}</p>
                
                <div className="absolute top-2 right-2">
                   <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-full bg-black/60 border border-white/10 ${colorClass}`}>
                      {platform}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    );
  };

  return (
    <div className="py-8 space-y-12 pb-32 max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter mb-2 leading-none">
            Discovery
          </h1>
          <p className="text-gray-500 font-black uppercase tracking-[0.3em] text-xs">Neural Grid Insights // Algorithmic Suggestions</p>
        </div>
        
        {!loading && (
          <button 
            onClick={fetchRecommendations}
            className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            Refresh Neural Grid
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="mt-6 text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] animate-pulse">Calibrating Neural Pathways...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[2rem] flex flex-col items-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-white font-black uppercase italic tracking-tighter mb-2">{error}</h3>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Ensure your streaming archives are correctly synchronized.</p>
        </div>
      ) : (
        <div className="space-y-20">
          {isSpotifyConnected && renderSection('Spotify', 'spotify', results.spotify)}
          {isYoutubeLinked && renderSection('YouTube Music', 'youtube', results.youtube)}
          {isAppleLinked && renderSection('Apple Music', 'apple', results.apple)}
          
          {!isSpotifyConnected && !isYoutubeLinked && !isAppleLinked && (
            <div className="py-20 flex flex-col items-center text-center max-w-xl mx-auto">
               <div className="w-20 h-20 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-8">
                  <Music className="w-8 h-8 text-gray-700" />
               </div>
               <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Neural Grid Offline</h2>
               <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                  To generate neural insights, you must first synchronize your external streaming archives. 
                  SonicVerse analyzes your listening patterns to synthesize personalized suggestions.
               </p>
               <button 
                 onClick={() => window.location.href = '/sync'}
                 className="px-8 py-3 bg-blue-600 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-all"
               >
                 Initialize Sync Sequence
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
