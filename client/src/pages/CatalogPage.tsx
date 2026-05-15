import { useState, useEffect } from 'react';
import { 
  Play, 
  Link2, 
  Music, 
  Loader2, 
  ArrowLeft, 
  Disc, 
  Clock, 
  TrendingUp, 
  Layers, 
  Users,
  History,
  RefreshCcw,
  ShieldCheck,
  Video,
  ChevronRight,
  Library, 
  Heart,
  Calendar,
  Mic2,
  Globe,
  User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../services/api';
import { PlanetaryCatalog } from '../components/PlanetaryCatalog';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';
type ViewState = 'welcome' | 'dashboard' | 'artist-detail' | 'album-detail' | 'playlist-detail';
type PlanetType = 'artists' | 'tracks' | 'albums' | 'history' | 'playlists' | 'profile' | null;

const PhoneSection = ({ title, icon: Icon, children, color, onBack }: any) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: 20 }}
    className="flex flex-col h-[700px] w-full max-w-[500px] mx-auto bg-[#0a0a0a] rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden relative group"
  >
    <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${color} opacity-50`} />
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
           <button 
             onClick={onBack}
             className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
           >
              <ArrowLeft className="w-4 h-4 text-white" />
           </button>
           <div className="flex flex-col">
             <div className="flex items-center gap-2">
               <Icon className={`w-3 h-3 text-gray-500`} />
               <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.1em] italic">Archive Sector</h3>
             </div>
             <h4 className="text-sm font-black text-white uppercase tracking-[0.1em] italic">{title}</h4>
           </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
        {children}
      </div>
    </div>
  </motion.div>
);

export const CatalogPage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [discography, setDiscography] = useState<any>(null);
  const [artistLoading, setArtistLoading] = useState(false);
  
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null);
  const [albumTracks, setAlbumTracks] = useState<any>(null);
  const [albumLoading, setAlbumLoading] = useState(false);

  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [playlistTracks, setPlaylistTracks] = useState<any>(null);
  const [playlistLoading, setPlaylistLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [view, setView] = useState<ViewState>('welcome');
  const [activePlanet, setActivePlanet] = useState<PlanetType>(null);
  const [activePlatform, setActivePlatform] = useState<'spotify' | 'youtube'>('spotify');

  const { setSong, setFullScreen } = usePlayerStore();
  const linkedAccounts = useAuthStore(state => state.linkedAccounts);
  const isSpotifyConnected = linkedAccounts.some(a => a.platform === 'spotify');
  const isYoutubeLinked = linkedAccounts.some(a => a.platform === 'youtube');
  const isAppleLinked = linkedAccounts.some(a => a.platform === 'apple');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (view === 'dashboard') {
      if (activePlatform === 'spotify' && isSpotifyConnected) fetchAllData();
      if (activePlatform === 'youtube' && isYoutubeLinked) fetchAllData();
    }
  }, [view, timeRange, activePlatform]);

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem(`${activePlatform}_token`);
    
    if (!token) {
      toast.error(`${activePlatform === 'spotify' ? 'Spotify' : 'YouTube Music'} access token missing.`);
      setLoading(false);
      return;
    }

    const headers = { [`x-${activePlatform}-token`]: token };

    try {
      const endpoints = [
        api.get(`/${activePlatform}/profile`, { headers }),
        api.get(`/${activePlatform}/top-artists?time_range=${timeRange}`, { headers }),
        api.get(`/${activePlatform}/top-tracks?time_range=${timeRange}`, { headers }),
        api.get(`/${activePlatform}/recently-played`, { headers }),
        api.get(`/${activePlatform}/playlists`, { headers }),
        api.get(`/${activePlatform}/albums`, { headers }),
        activePlatform === 'spotify' ? api.get(`/${activePlatform}/analytics`, { headers }) : Promise.resolve({ data: null }),
      ];

      const results = await Promise.allSettled(endpoints);

      if (results[0].status === 'fulfilled') setProfile(results[0].value.data);
      if (results[1].status === 'fulfilled') setTopArtists(results[1].value.data);
      if (results[2].status === 'fulfilled') setTopTracks(results[2].value.data);
      if (results[3].status === 'fulfilled') setRecentTracks(results[3].value.data);
      if (results[4].status === 'fulfilled') setPlaylists(results[4].value.data);
      if (results[5].status === 'fulfilled') setAlbums(results[5].value.data);
      if (results[6].status === 'fulfilled') setAnalytics(results[6].value.data);

      if (results[0].status === 'rejected') {
        toast.error(`${activePlatform === 'spotify' ? 'Spotify' : 'YouTube'} session expired.`);
      }
    } catch (err) {
      console.error('Unexpected error during data fetch:', err);
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleArtistClick = async (artist: any) => {
    setSelectedArtist(artist);
    setArtistLoading(true);
    setDiscography(null);
    setView('artist-detail');
    try {
      const token = localStorage.getItem(`${activePlatform}_token`);
      if (token) {
        const res = await api.get(`/${activePlatform}/artist/${artist.id}/discography`, {
          headers: { [`x-${activePlatform}-token`]: token }
        });
        setDiscography(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch discography', err);
    } finally {
      setArtistLoading(false);
    }
  };

  const handleAlbumClick = async (album: any) => {
    setSelectedAlbum(album);
    setAlbumLoading(true);
    setAlbumTracks(null);
    setView('album-detail');
    try {
      const token = localStorage.getItem(`${activePlatform}_token`);
      if (token) {
        const res = await api.get(`/${activePlatform}/album/${album.id}/tracks`, {
          headers: { [`x-${activePlatform}-token`]: token }
        });
        setAlbumTracks(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch album tracks', err);
    } finally {
      setAlbumLoading(false);
    }
  };

  const handlePlaylistClick = async (playlist: any) => {
    setSelectedPlaylist(playlist);
    setPlaylistLoading(true);
    setPlaylistTracks(null);
    // For now we don't have a separate playlist detail view, but we could add one.
    // For simplicity, we'll just handle it within the dashboard/planet view if needed.
    try {
      const token = localStorage.getItem(`${activePlatform}_token`);
      if (token) {
        const res = await api.get(`/${activePlatform}/playlist/${playlist.id}/tracks`, {
          headers: { [`x-${activePlatform}-token`]: token }
        });
        setPlaylistTracks(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch playlist tracks', err);
    } finally {
      setPlaylistLoading(false);
    }
  };

  const playSong = (track: any, list: any[]) => {
    setSong(track, list);
    setFullScreen(true);
  };

  const platforms = [
    { 
      id: 'spotify', 
      name: 'Spotify', 
      icon: Music, 
      linked: isSpotifyConnected, 
      gradient: 'from-[#1DB954] to-[#191414]', 
      accent: 'text-[#1DB954]',
      desc: 'Explore your curated Spotify library and top neural charts.' 
    },
    { 
      id: 'youtube', 
      name: 'YT Music', 
      icon: Video, 
      linked: isYoutubeLinked, 
      gradient: 'from-[#FF0000] to-[#282828]', 
      accent: 'text-[#FF0000]',
      desc: 'Access your YouTube Music collections and archive nodes.' 
    },
    { 
      id: 'apple', 
      name: 'Apple Music', 
      icon: Layers, 
      linked: isAppleLinked, 
      gradient: 'from-[#FA243C] to-[#1a1a1a]', 
      accent: 'text-[#FA243C]',
      desc: 'Sync your Apple Music library and premium high-fidelity tracks.' 
    },
  ];
  const handlePlatformSelect = (p: any) => {
    if (!p.linked) {
      if (p.id === 'apple') {
        toast.error('Apple Music integration pending protocol release.');
        return;
      }
      navigate(`/sync/${p.id}`);
      return;
    }
    setActivePlatform(p.id as any);
    setView('dashboard');
    setActivePlanet(null);
  };

  const topGenres = profile ? (topArtists?.[0]?.genres?.slice(0, 5) || []) : [];

  const TimeFilter = () => (
    <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-2xl border border-white/5">
      {[
        { id: 'short_term', label: '4W' },
        { id: 'medium_term', label: '6M' },
        { id: 'long_term', label: 'ALL' }
      ].map((range) => (
        <button 
          key={range.id}
          onClick={() => setTimeRange(range.id as TimeRange)}
          className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] transition-all border ${
            timeRange === range.id 
              ? 'bg-white border-white text-black shadow-lg'
              : 'bg-transparent border-transparent text-gray-500 hover:text-white'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4">
      <AnimatePresence mode="wait">
        {view === 'welcome' ? (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <section className="text-center mb-10 relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 p-8 md:p-12">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.05)_0%,_transparent_70%)]" />
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 relative z-10">
                    <Library className="w-3 h-3" />
                    <span>Neural Catalog Access Protocol</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-6 relative z-10">
                    Neural <br /> Archives.
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium leading-relaxed relative z-10">
                    Access your synchronized archives from across the streaming universe. SonicVerse synthesizes your libraries into a unified modular catalog.
                </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {platforms.map((p) => (
                    <motion.div 
                      key={p.id} 
                      whileHover={{ y: -6 }}
                      onClick={() => handlePlatformSelect(p)}
                      className="group relative bg-[#0a0a0a] p-6 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all cursor-pointer overflow-hidden shadow-lg"
                    >
                        <div className={`absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br ${p.gradient} opacity-0 blur-[50px] rounded-full group-hover:opacity-20 transition-opacity duration-700`} />
                        
                        <div className="w-12 h-12 rounded-[1rem] bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform">
                            <p.icon className={`w-6 h-6 ${p.accent}`} />
                        </div>
                        
                        <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-tighter flex items-center justify-between">
                            {p.name}
                            <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                        </h3>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed mb-6">{p.desc}</p>
                        
                        {p.linked ? (
                            <div className="flex items-center gap-2 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em]">
                                <ShieldCheck className="w-3.5 h-3.5" /> Link Active
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-700 text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-gray-400 transition-colors">
                                <Link2 className="w-3.5 h-3.5" /> Initialize Link
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
          </motion.div>
        ) : view === 'dashboard' ? (
          <motion.div 
            key="dashboard-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between">
                <button 
                  onClick={() => setView('welcome')}
                  className="flex items-center gap-3 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em] group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Archives
                </button>
                
                <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                   <Globe className={`w-3 h-3 ${activePlatform === 'spotify' ? 'text-green-500' : 'text-red-500'}`} />
                   <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{activePlatform} Orbital System</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
              {!activePlanet ? (
                <motion.div
                  key="planetary-system"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative"
                >
                  <PlanetaryCatalog 
                    profile={profile} 
                    analytics={analytics}
                    activePlatform={activePlatform}
                    onPlanetSelect={(type) => setActivePlanet(type as PlanetType)} 
                  />
                  
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-[3rem] z-20">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                        <p className="text-[10px] font-black text-white uppercase tracking-[0.5em] animate-pulse">Syncing Neural Grid...</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center min-h-[600px]">
                   {activePlanet === 'artists' && (
                     <PhoneSection 
                       title="Top Artists" 
                       icon={Users} 
                       color={activePlatform === 'spotify' ? 'from-[#1DB954] to-[#191414]' : 'from-[#FF0000] to-[#282828]'}
                       onBack={() => setActivePlanet(null)}
                     >
                       <TimeFilter />
                       <div className="space-y-4">
                        {topArtists.map((artist, i) => (
                          <div 
                            key={artist.id} 
                            onClick={() => handleArtistClick(artist)}
                            className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                          >
                            <span className="text-[10px] font-black text-gray-700 w-4 group-hover:text-white transition-colors">{i + 1}</span>
                            <img src={artist.images?.[2]?.url} className="w-12 h-12 rounded-full object-cover shadow-lg" alt="" />
                            <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-bold text-white truncate">{artist.name}</p>
                              <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mt-0.5">{artist.genres?.[0] || 'Artist'}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                          </div>
                        ))}
                      </div>
                     </PhoneSection>
                   )}

                   {activePlanet === 'tracks' && (
                     <PhoneSection 
                       title="Top Tracks" 
                       icon={TrendingUp} 
                       color={activePlatform === 'spotify' ? 'from-[#1DB954] to-[#191414]' : 'from-[#FF0000] to-[#282828]'}
                       onBack={() => setActivePlanet(null)}
                     >
                       <TimeFilter />
                       <div className="space-y-4">
                        {topTracks.map((track, i) => (
                          <div 
                            key={track.id} 
                            onClick={() => playSong(track, topTracks)}
                            className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                          >
                            <span className="text-[10px] font-black text-gray-700 w-4 group-hover:text-white transition-colors">{i + 1}</span>
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-lg">
                               <img src={track.cover_url} className="w-full h-full object-cover" alt="" />
                               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                               </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-bold text-white truncate">{track.title}</p>
                              <p className="text-[9px] text-gray-600 uppercase font-black truncate tracking-widest mt-0.5">{track.artist_name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                     </PhoneSection>
                   )}

                   {activePlanet === 'albums' && (
                     <PhoneSection 
                       title="Saved Albums" 
                       icon={Disc} 
                       color={activePlatform === 'spotify' ? 'from-[#1DB954] to-[#191414]' : 'from-[#FF0000] to-[#282828]'}
                       onBack={() => setActivePlanet(null)}
                     >
                       <div className="grid grid-cols-2 gap-4 mt-2">
                        {albums.map((album) => (
                          <div 
                            key={album.id} 
                            onClick={() => handleAlbumClick(album)}
                            className="flex flex-col bg-white/5 p-3 rounded-[1.5rem] border border-white/5 hover:border-white/20 transition-all cursor-pointer group shadow-xl"
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                               <img src={album.cover_url} className="w-full h-full object-cover" alt="" />
                               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Disc className="w-8 h-8 text-white/50" />
                                </div>
                            </div>
                            <p className="text-[10px] font-black text-white truncate uppercase tracking-tighter px-1 mb-0.5">{album.title}</p>
                            <p className="text-[8px] text-gray-600 uppercase font-black truncate px-1 tracking-widest">{album.artist_name}</p>
                          </div>
                        ))}
                      </div>
                     </PhoneSection>
                   )}

                   {activePlanet === 'history' && (
                     <PhoneSection 
                       title="Recent History" 
                       icon={History} 
                       color={activePlatform === 'spotify' ? 'from-[#1DB954] to-[#191414]' : 'from-[#FF0000] to-[#282828]'}
                       onBack={() => setActivePlanet(null)}
                     >
                       <div className="space-y-4 mt-2">
                        {recentTracks.map((track, i) => (
                          <div 
                            key={`${track.id}-${i}`} 
                            onClick={() => playSong(track, recentTracks)}
                            className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                          >
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-lg">
                               <img src={track.cover_url} className="w-full h-full object-cover" alt="" />
                               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                               </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-bold text-white truncate">{track.title}</p>
                              <p className="text-[9px] text-gray-600 uppercase font-black truncate tracking-widest mt-0.5">{track.artist_name}</p>
                              <div className="flex items-center gap-2 mt-2 opacity-50">
                                 <Clock className="w-2 h-2 text-gray-500" />
                                 <span className="text-[8px] font-black uppercase text-gray-600 tracking-widest">
                                   {track.played_at ? new Date(track.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Capture Live'}
                                 </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                     </PhoneSection>
                   )}

                   {activePlanet === 'playlists' && (
                     <PhoneSection 
                       title="Playlists" 
                       icon={Layers} 
                       color={activePlatform === 'spotify' ? 'from-[#1DB954] to-[#191414]' : 'from-[#FF0000] to-[#282828]'}
                       onBack={() => setActivePlanet(null)}
                     >
                        {playlistLoading ? (
                          <div className="flex items-center justify-center py-20">
                             <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                          </div>
                        ) : selectedPlaylist && playlistTracks ? (
                          <div className="space-y-6">
                            <button 
                              onClick={() => {
                                setSelectedPlaylist(null);
                                setPlaylistTracks(null);
                              }}
                              className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] mb-4 hover:text-white transition-colors"
                            >
                              <ArrowLeft className="w-3 h-3" /> Back
                            </button>
                            
                            <div className="flex flex-col items-center text-center mb-8">
                               <img src={selectedPlaylist.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'} className="w-32 h-32 rounded-[1.5rem] object-cover mb-4 shadow-2xl border-2 border-white/5" alt="" />
                               <h4 className="text-xl font-black text-white italic uppercase tracking-tighter mb-1">{selectedPlaylist.name}</h4>
                               <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{selectedPlaylist.track_count} Nodes</p>
                            </div>

                            <div className="space-y-4">
                              {playlistTracks.tracks?.map((track: any, i: number) => (
                                <div 
                                  key={track.id} 
                                  onClick={() => playSong(track, playlistTracks.tracks)}
                                  className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group"
                                >
                                  <span className="text-[10px] font-black text-gray-700 w-4 group-hover:text-white transition-colors">{i + 1}</span>
                                  <div className="flex-1 overflow-hidden">
                                    <p className="text-xs font-bold text-white truncate">{track.title}</p>
                                  </div>
                                  <Play className="w-3 h-3 text-gray-700 group-hover:text-blue-500 transition-colors" />
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {playlists.map((p) => (
                              <div 
                                key={p.id} 
                                onClick={() => handlePlaylistClick(p)}
                                className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group shadow-xl"
                              >
                                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-lg border border-white/5">
                                   <img src={p.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'} className="w-full h-full object-cover" alt="" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                  <p className="text-xs font-bold text-white truncate">{p.name}</p>
                                  <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest mt-1">{p.track_count} Tracks</p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                              </div>
                            ))}
                          </div>
                        )}
                     </PhoneSection>
                   )}

                   {activePlanet === 'profile' && profile && (
                     <PhoneSection 
                       title="Archive Node" 
                       icon={UserIcon} 
                       color={activePlatform === 'spotify' ? 'from-[#1DB954] to-[#191414]' : 'from-[#FF0000] to-[#282828]'}
                       onBack={() => setActivePlanet(null)}
                     >
                        <div className="flex flex-col items-center text-center space-y-8 mt-4">
                           <div className="relative">
                              <div className={`absolute -inset-4 bg-gradient-to-tr ${activePlatform === 'spotify' ? 'from-[#1DB954] to-[#191414]' : 'from-[#FF0000] to-[#282828]'} rounded-full blur-2xl opacity-20 animate-pulse`}></div>
                              {profile.images?.[0]?.url || profile.avatar_url ? (
                                <img src={profile.images?.[0]?.url || profile.avatar_url} className="relative w-32 h-32 rounded-full object-cover border-4 border-white/10 shadow-2xl" alt="" />
                              ) : (
                                <div className="relative w-32 h-32 rounded-full bg-white/5 border-4 border-white/10 flex items-center justify-center">
                                    <UserIcon className="w-12 h-12 text-gray-700" />
                                </div>
                              )}
                           </div>
                           
                           <div className="space-y-2">
                              <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{profile.display_name || profile.username}</h1>
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Verified {activePlatform} Node</p>
                           </div>

                           {analytics && (
                             <div className="w-full space-y-6">
                               <div className="grid grid-cols-3 gap-3">
                                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                     <span className="block text-[7px] font-black text-gray-600 uppercase tracking-widest mb-1">Minutes</span>
                                     <span className="text-xs font-black text-white">{(analytics.total_minutes / 1000).toFixed(1)}k</span>
                                  </div>
                                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                     <span className="block text-[7px] font-black text-gray-600 uppercase tracking-widest mb-1">Signals</span>
                                     <span className="text-xs font-black text-white">{analytics.total_tracks}</span>
                                  </div>
                                  <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                                     <span className="block text-[7px] font-black text-gray-600 uppercase tracking-widest mb-1">Entities</span>
                                     <span className="text-xs font-black text-white">{analytics.total_artists}</span>
                                  </div>
                               </div>

                               <div className="space-y-4 text-left">
                                  <div className="flex items-center justify-between px-2">
                                     <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Alpha Entities (Top 3)</p>
                                     <Users className="w-3 h-3 text-blue-500" />
                                  </div>
                                  <div className="flex gap-3">
                                     {analytics.top_3_artists?.map((artist: any, i: number) => (
                                       <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                          <img src={artist.image} className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg" alt="" />
                                          <span className="text-[8px] font-black text-white uppercase truncate w-full text-center">{artist.name}</span>
                                       </div>
                                     ))}
                                  </div>
                               </div>

                               <div className="space-y-4 text-left">
                                  <div className="flex items-center justify-between px-2">
                                     <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">High Resonance (Top 3)</p>
                                     <TrendingUp className="w-3 h-3 text-green-500" />
                                  </div>
                                  <div className="space-y-2">
                                     {analytics.top_3_tracks?.map((track: any, i: number) => (
                                       <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-xl border border-white/5">
                                          <img src={track.image} className="w-8 h-8 rounded-lg object-cover" alt="" />
                                          <div className="flex-1 min-w-0">
                                             <p className="text-[9px] font-black text-white uppercase truncate">{track.title}</p>
                                             <p className="text-[7px] text-gray-600 font-black uppercase truncate">{track.artist}</p>
                                          </div>
                                       </div>
                                     ))}
                                  </div>
                               </div>
                             </div>
                           )}

                           <div className="grid grid-cols-2 gap-4 w-full">
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                 <span className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Followers</span>
                                 <span className="text-sm font-black text-white">{profile.followers?.total || 0}</span>
                              </div>
                              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                 <span className="block text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Status</span>
                                 <span className="text-sm font-black text-blue-400 uppercase italic">Active</span>
                              </div>
                           </div>

                           <div className="w-full space-y-4 text-left">
                              <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] px-2">High Resonance Genres</p>
                              <div className="flex flex-wrap gap-2">
                                {topGenres.map((genre: string) => (
                                  <span key={genre} className="text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1.5 bg-white/5 text-white rounded-lg border border-white/5">
                                    {genre}
                                  </span>
                                ))}
                              </div>
                           </div>

                           <div className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10`}>
                                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                                 </div>
                                 <div className="text-left">
                                    <p className="text-[9px] font-black text-white uppercase tracking-tighter">Auth Protocol</p>
                                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Secured via OAuth 2.0</p>
                                 </div>
                              </div>
                              <div className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/20 text-[8px] font-black text-green-500 uppercase tracking-widest">
                                Valid
                              </div>
                           </div>
                        </div>
                     </PhoneSection>
                   )}
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : view === 'artist-detail' ? (
          <motion.div 
            key="artist-detail-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto space-y-16"
          >
            <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
              <button 
                onClick={() => setView('dashboard')}
                className="w-16 h-16 rounded-full bg-[#0a0a0a] border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all shadow-2xl shrink-0 group"
              >
                <ArrowLeft className="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform" />
              </button>
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                  <Mic2 className={`w-5 h-5 ${activePlatform === 'spotify' ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Artist Module Detected</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter italic leading-none">{selectedArtist?.name}</h1>
              </div>
            </div>

            {artistLoading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-[#0a0a0a] rounded-[3.5rem] border border-white/5">
                <div className="w-12 h-12 rounded-full border-b-4 border-blue-500 animate-spin" />
              </div>
            ) : discography ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <section>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                      <TrendingUp className="w-6 h-6 text-blue-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">High Resonance</h2>
                  </div>
                  <div className="space-y-4">
                    {discography.top_tracks?.map((track: any, i: number) => (
                      <div 
                        key={track.id} 
                        onClick={() => playSong(track, discography.top_tracks)}
                        className="flex items-center gap-5 p-5 bg-[#0a0a0a] rounded-[2rem] border border-white/5 hover:border-white/20 transition-all cursor-pointer group shadow-xl"
                      >
                        <span className="text-xs font-black text-gray-700 w-4 group-hover:text-blue-500 transition-colors">{i + 1}</span>
                        <img src={track.cover_url} className="w-14 h-14 rounded-[1.25rem] object-cover shadow-lg" alt="" />
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-white text-sm truncate uppercase tracking-tighter">{track.title}</h4>
                          <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
                            {track.duration_ms ? `${Math.floor(track.duration_ms / 60000)}:${(Math.floor((track.duration_ms % 60000) / 1000)).toString().padStart(2, '0')}` : 'N/A'}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                           <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-4 mb-10">
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                      <Disc className="w-6 h-6 text-purple-500" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Archived Nodes</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-8">
                    {discography.albums?.map((album: any) => (
                      <motion.div 
                        key={album.id} 
                        whileHover={{ y: -8 }}
                        onClick={() => handleAlbumClick(album)}
                        className="group cursor-pointer bg-[#0a0a0a] p-4 rounded-[2.5rem] border border-white/5 hover:border-white/20 transition-all shadow-xl"
                      >
                        <div className="relative aspect-square rounded-[1.75rem] overflow-hidden mb-5 shadow-2xl border border-white/5">
                          <img src={album.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-1000" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Disc className="w-16 h-16 text-white/30 animate-spin-slow" />
                          </div>
                        </div>
                        <h4 className="font-black text-sm text-white truncate uppercase tracking-tighter italic mb-1 px-1">{album.title}</h4>
                        <div className="flex items-center justify-between px-1">
                          <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">{album.release_date ? new Date(album.release_date).getFullYear() : 'N/A'}</p>
                          <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] text-gray-700 font-black uppercase tracking-widest border border-white/5">{album.type}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </motion.div>
        ) : (
          <motion.div 
            key="album-detail-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
             <button 
                onClick={() => setView(selectedArtist ? 'artist-detail' : 'dashboard')}
                className="mb-12 flex items-center gap-3 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em] group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
              </button>

              <div className="flex flex-col md:flex-row gap-16 items-end mb-20">
                 <div className="w-full md:w-80 aspect-square rounded-[3.5rem] overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-white/10 shrink-0 relative group">
                    <img src={selectedAlbum?.cover_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 </div>
                 <div className="flex-1 pb-4">
                    <div className="flex items-center gap-3 mb-6">
                       <span className="px-4 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl">
                          {selectedAlbum?.type || 'Album'}
                       </span>
                       {selectedAlbum?.release_date && (
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
                            <Calendar className="w-3 h-3" /> {new Date(selectedAlbum.release_date).getFullYear()}
                         </span>
                       )}
                    </div>
                    <h1 className="text-6xl md:text-[5.5rem] font-black text-white uppercase italic tracking-tighter leading-[0.85] mb-8">{selectedAlbum?.title}</h1>
                    <div className="flex items-center gap-6">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                             <Users className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="text-xl font-black text-white uppercase italic tracking-tighter">{selectedAlbum?.artist_name}</span>
                       </div>
                       <div className="h-6 w-px bg-white/10" />
                       <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">{albumTracks?.tracks?.length || 0} Signal Nodes</span>
                    </div>
                 </div>
              </div>

              {albumLoading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-[#0a0a0a] rounded-[3.5rem] border border-white/5">
                   <div className="w-12 h-12 rounded-full border-b-4 border-blue-500 animate-spin" />
                </div>
              ) : (
                <div className="bg-[#0a0a0a] rounded-[3.5rem] border border-white/5 overflow-hidden backdrop-blur-3xl shadow-2xl">
                   <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                      <div className="flex items-center gap-5">
                         <button 
                            onClick={() => playSong(albumTracks?.tracks?.[0], albumTracks.tracks)}
                            className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                         >
                            <Play className="w-7 h-7 fill-current ml-1" />
                         </button>
                         <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Temporal Sequence</h3>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="p-3 bg-white/5 rounded-2xl border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
                            <RefreshCcw className="w-5 h-5 text-gray-500" />
                         </div>
                         <div className="p-3 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                            <Heart className="w-5 h-5 text-gray-500 hover:text-red-500 transition-colors" />
                         </div>
                      </div>
                   </div>
                   <div className="divide-y divide-white/5">
                      {albumTracks?.tracks?.map((track: any, i: number) => (
                        <div 
                          key={track.id} 
                          onClick={() => playSong(track, albumTracks.tracks)}
                          className="px-10 py-6 flex items-center justify-between hover:bg-white/5 transition-all cursor-pointer group"
                        >
                           <div className="flex items-center gap-10">
                              <span className="text-xs font-black text-gray-800 w-4 group-hover:text-white transition-colors tracking-tighter">{i + 1}</span>
                              <div className="min-w-0">
                                 <p className="font-black text-white text-lg group-hover:text-blue-400 transition-colors uppercase tracking-tighter italic leading-none mb-1">{track.title}</p>
                                 <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">{track.artist_name}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-8">
                             <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link2 className="w-4 h-4 text-gray-700" />
                             </div>
                             <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest tabular-nums w-12 text-right">
                               {track.duration_ms ? `${Math.floor(track.duration_ms / 60000)}:${(Math.floor((track.duration_ms % 60000) / 1000)).toString().padStart(2, '0')}` : 'N/A'}
                             </span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
