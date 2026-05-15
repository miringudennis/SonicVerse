import { useState, useEffect, useMemo } from 'react';
import { 
  Music,
  Zap,
  Globe
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import { useUIStore } from '../store/uiStore';
import api from '../services/api';
import toast from 'react-hot-toast';
import { DiscoveryUniverse } from '../components/DiscoveryUniverse';

type DiscoveryView = 'universe' | 'galaxy' | 'system';

export const DiscoveryPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ spotify: any[], youtube: any[], apple: any[] }>({ 
    spotify: [], 
    youtube: [], 
    apple: [] 
  });
  
  const [view, setView] = useState<DiscoveryView>('universe');
  const [activeGalaxy, setActiveGalaxy] = useState<string | null>(null);
  const [activeSystem, setActiveSystem] = useState<string | null>(null);

  const linkedAccounts = useAuthStore(state => state.linkedAccounts);
  const setSong = usePlayerStore(state => state.setSong);
  const openSyncModal = useUIStore(state => state.openSyncModal);

  const isSpotifyConnected = linkedAccounts.some(a => a.platform === 'spotify');
  const isYoutubeLinked = linkedAccounts.some(a => a.platform === 'youtube');
  const isAppleLinked = linkedAccounts.some(a => a.platform === 'apple');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
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
      toast.error('Failed to fetch recommendations. Please check your connections.');
    } finally {
      setLoading(false);
    }
  };

  const systems = useMemo(() => {
    if (!activeGalaxy) return [];
    // Extract unique genres or just mock them for now based on artists if we had genre data per track
    return ['Electronic', 'Neural Pop', 'Deep Bass', 'Ambient', 'High Resonance'].slice(0, 5);
  }, [activeGalaxy]);

  const items = useMemo(() => {
    if (!activeGalaxy) return [];
    return results[activeGalaxy as keyof typeof results] || [];
  }, [activeGalaxy, results]);

  const handleGalaxySelect = (platform: string) => {
    if (platform === 'universe') {
       setView('universe');
       setActiveGalaxy(null);
       setActiveSystem(null);
       return;
    }
    
    const isLinked = linkedAccounts.some(a => a.platform === platform);
    if (!isLinked) {
       toast.error(`${platform.toUpperCase()} connection required for galaxy access.`);
       openSyncModal();
       return;
    }
    
    setActiveGalaxy(platform);
    setView('galaxy');
  };

  const handleSystemSelect = (genre: string) => {
    setActiveSystem(genre);
    setView('system');
  };

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <section className="mb-10 relative overflow-hidden rounded-[3rem] bg-[#0a0a0a] border border-white/5 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Globe className="w-64 h-64 text-blue-500 animate-pulse" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <Zap className="w-3 h-3" />
            <span>Neural Discovery v5.0 // Astro Module</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none mb-6">
            Discovery <br /> Galaxies.
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl font-medium leading-relaxed mb-10">
            Traverse the musical universe. SonicVerse has mapped your archives into high-frequency constellations. Select a galaxy to initialize exploration.
          </p>
          
          {loading && (
             <div className="flex items-center gap-4 text-blue-500">
                <div className="w-6 h-6 border-b-2 border-current rounded-full animate-spin" />
                <span className="text-xs font-black uppercase tracking-[0.3em]">Mapping Verse...</span>
             </div>
          )}
        </div>
      </section>

      <div className="relative">
         <DiscoveryUniverse 
           view={view}
           activeGalaxy={activeGalaxy}
           activeSystem={activeSystem}
           systems={systems}
           items={items}
           onGalaxySelect={handleGalaxySelect}
           onSystemSelect={handleSystemSelect}
           onItemSelect={(item) => setSong(item, items)}
         />
         
         {!isSpotifyConnected && !isYoutubeLinked && !isAppleLinked && (
           <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-[4rem]">
              <div className="max-w-md text-center p-12 bg-[#0a0a0a] border border-white/10 rounded-[3rem] shadow-2xl">
                 <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
                    <Music className="w-8 h-8 text-blue-500" />
                 </div>
                 <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Universe Offline</h3>
                 <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                    SonicVerse requires access to your platform nodes to synthesize discovery galaxies.
                 </p>
                 <button 
                   onClick={openSyncModal}
                   className="w-full px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all"
                 >
                   Establish Archive Link
                 </button>
              </div>
           </div>
         )}
      </div>
    </div>
  );
};
