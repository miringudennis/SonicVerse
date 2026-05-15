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
    const galaxyData = results[activeGalaxy as keyof typeof results] || [];
    
    // Extract unique genres from all items in this galaxy
    const genreSet = new Set<string>();
    galaxyData.forEach(item => {
      if (item.genres && Array.isArray(item.genres)) {
        item.genres.slice(0, 2).forEach((g: string) => genreSet.add(g));
      }
    });

    const derivedGenres = Array.from(genreSet);
    return derivedGenres.length > 0 ? derivedGenres : ['Ambient Resonance', 'Hyper Neural', 'Sonic Core'];
  }, [activeGalaxy, results]);

  const filteredItems = useMemo(() => {
    if (!activeGalaxy || !activeSystem) return [];
    const galaxyData = results[activeGalaxy as keyof typeof results] || [];
    
    // If it's a "dummy" genre, just return all data
    if (['Ambient Resonance', 'Hyper Neural', 'Sonic Core'].includes(activeSystem)) {
      return galaxyData;
    }

    return galaxyData.filter(item => 
      item.genres && item.genres.some((g: string) => g.toLowerCase() === activeSystem.toLowerCase())
    );
  }, [activeGalaxy, activeSystem, results]);

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

  const handleBack = () => {
    if (view === 'system') {
      setView('galaxy');
      setActiveSystem(null);
    } else if (view === 'galaxy') {
      setView('universe');
      setActiveGalaxy(null);
    }
  };

  const connectedPlatforms = useMemo(() => linkedAccounts.map(a => a.platform), [linkedAccounts]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-0 pb-10 sm:pb-20">
      <section className="mb-8 relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Globe className="w-48 h-48 text-blue-500 animate-pulse" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-[0.2em] mb-4">
            <Zap className="w-3 h-3" />
            <span>Neural Discovery v5.5 // Multiverse Module</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-tight md:leading-none mb-4">
            Neural <br /> Multiverse.
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-xl font-medium leading-relaxed mb-6">
            Traverse your synchronized musical constellations. Select a galaxy to initialize high-frequency exploration across the neural grid.
          </p>
          
          {loading && (
             <div className="flex items-center gap-4 text-blue-500">
                <div className="w-4 h-4 border-b-2 border-current rounded-full animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Mapping Multiverse...</span>
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
           items={view === 'system' ? filteredItems : (results[activeGalaxy as keyof typeof results] || [])}
           onGalaxySelect={handleGalaxySelect}
           onSystemSelect={handleSystemSelect}
           onItemSelect={(item) => setSong(item, results[activeGalaxy as keyof typeof results] || [])}
           onBack={handleBack}
           connectedPlatforms={connectedPlatforms}
         />
         
         {!isSpotifyConnected && !isYoutubeLinked && !isAppleLinked && (
           <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm rounded-[2.5rem] md:rounded-[4rem]">
              <div className="max-w-md w-full mx-4 text-center p-8 md:p-12 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
                 <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 md:mb-8 border border-blue-500/20">
                    <Music className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
                 </div>
                 <h3 className="text-xl md:text-2xl font-black text-white uppercase italic tracking-tighter mb-4">Universe Offline</h3>
                 <p className="text-gray-500 text-xs md:text-sm font-medium mb-8 leading-relaxed">
                    SonicVerse requires access to your platform nodes to synthesize discovery galaxies.
                 </p>
                 <button 
                   onClick={openSyncModal}
                   className="w-full px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
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
