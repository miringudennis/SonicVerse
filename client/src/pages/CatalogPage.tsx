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
  ExternalLink, 
  History, 
  AlertCircle, 
  RefreshCcw,
  ShieldCheck,
  Video,
  Play as AppleMusicIcon,
  ChevronRight,
  Library,
  Heart,
  Calendar,
  Mic2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';
type ViewState = 'welcome' | 'dashboard' | 'artist-detail' | 'album-detail';

const PhoneSection = ({ title, icon: Icon, children, color }: any) => (
  <div className="flex flex-col h-[600px] w-[300px] shrink-0 bg-black rounded-[2.5rem] border-4 border-gray-900 shadow-2xl overflow-hidden relative group snap-center">
    {/* Content */}
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className={`p-1.5 rounded-lg ${color} bg-opacity-20`}>
              <Icon className={`w-4 h-4 ${color.replace('bg-', 'text-')}`} />
           </div>
           <h3 className="text-sm font-black text-white uppercase tracking-tighter italic">{title}</h3>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-8 custom-scrollbar">
        {children}
      </div>
    </div>
  </div>
);

export const CatalogPage = () => {
  const [profile, setProfile] = useState<any>(null);
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [view, setView] = useState<ViewState>('welcome');
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
    setError(null);
    const token = localStorage.getItem(`${activePlatform}_token`);
    
    if (!token) {
      setError(`${activePlatform === 'spotify' ? 'Spotify' : 'YouTube Music'} access token missing. Please re-connect.`);
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
      ];

      if (activePlatform === 'spotify') {
        endpoints.push(api.get(`/spotify/albums`, { headers }));
      }

      const results = await Promise.allSettled(endpoints);

      if (results[0].status === 'fulfilled') setProfile(results[0].value.data);
      if (results[1].status === 'fulfilled') setTopArtists(results[1].value.data);
      if (results[2].status === 'fulfilled') setTopTracks(results[2].value.data);
      if (results[3].status === 'fulfilled') setRecentTracks(results[3].value.data);
      if (results[4].status === 'fulfilled') setPlaylists(results[4].value.data);
      
      if (activePlatform === 'spotify' && results[5]?.status === 'fulfilled') {
        setAlbums(results[5].value.data);
      }

      if (results[0].status === 'rejected') {
        setError(`${activePlatform === 'spotify' ? 'Spotify' : 'YouTube'} session expired. Please re-sync.`);
      }
    } catch (err) {
      console.error('Unexpected error during data fetch:', err);
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleArtistClick = async (artist: any) => {
    setSelectedArtist(artist);
    setArtistLoading(true);
    setDiscography(null);
    if (view !== 'dashboard') setView('artist-detail');
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
    // Remove setView('album-detail') to keep it inside the phone
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

  const playSong = (track: any) => {
    setSong(track);
    setFullScreen(true);
  };

  const platforms = [
    { 
      id: 'spotify', 
      name: 'Spotify', 
      icon: Music, 
      linked: isSpotifyConnected, 
      color: 'bg-green-600', 
      desc: 'Explore your curated Spotify library, top charts, and playback history.' 
    },
    { 
      id: 'youtube', 
      name: 'YT Music', 
      icon: Video, 
      linked: isYoutubeLinked, 
      color: 'bg-red-600', 
      desc: 'Access your YouTube Music collections and history archive.' 
    },
    { 
      id: 'apple', 
      name: 'Apple Music', 
      icon: AppleMusicIcon, 
      linked: isAppleLinked, 
      color: 'bg-pink-600', 
      desc: 'Browse your Apple Music library and personalized playlists.' 
    },
  ];

  const handlePlatformSelect = (p: any) => {
    if (!p.linked) {
      navigate(`/sync/${p.id}`);
      return;
    }
    if (p.id === 'spotify' || p.id === 'youtube') {
      setActivePlatform(p.id as any);
      setView('dashboard');
    } else {
      alert(`${p.name} integration is currently being optimized. Check back soon!`);
    }
  };

  const topGenres = profile ? (topArtists?.[0]?.genres?.slice(0, 5) || []) : [];

  return (
    <div className="py-8 space-y-12 pb-12">
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/10 border border-purple-500/20 text-purple-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                    <Library className="w-3 h-3" /> Unified Music Catalog
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-6">
                    Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-blue-500">Neural Archive</span>
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
                    Access your synchronized libraries from across the streaming universe. Choose a platform to begin exploring your sonic data.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {platforms.map((p) => (
                    <div 
                      key={p.id} 
                      onClick={() => handlePlatformSelect(p)}
                      className="group relative bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800/50 backdrop-blur-xl hover:border-white/10 transition-all cursor-pointer overflow-hidden"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${p.color}/20 flex items-center justify-center mb-6 border border-${p.id === 'spotify' ? 'green' : p.id === 'apple' ? 'pink' : 'red'}-500/20`}>
                            <p.icon className={`w-7 h-7 ${p.id === 'spotify' ? 'text-green-500' : p.id === 'apple' ? 'text-pink-500' : 'text-red-500'}`} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase italic mb-3 tracking-tighter flex items-center justify-between">
                            {p.name}
                            <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                        </h3>
                        <p className="text-gray-500 text-xs font-medium leading-relaxed mb-8">{p.desc}</p>
                        
                        {p.linked ? (
                            <div className="flex items-center gap-2 text-green-500 text-[10px] font-black uppercase tracking-widest">
                                <ShieldCheck className="w-4 h-4" /> Account Linked
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-600 text-[10px] font-black uppercase tracking-widest group-hover:text-gray-400 transition-colors">
                                <Link2 className="w-4 h-4" /> Connect to explore
                            </div>
                        )}
                    </div>
                ))}
            </div>
          </motion.div>
        ) : view === 'dashboard' ? (
          <motion.div 
            key="dashboard-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            {/* Header / Profile Section */}
            <div className="relative">
                <button 
                  onClick={() => setView('welcome')}
                  className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Catalog
                </button>

                {error && !profile ? (
                   <div className="flex flex-col items-center justify-center py-20 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-6 opacity-50" />
                    <h2 className="text-2xl font-black text-white mb-4 uppercase italic tracking-tighter">{error}</h2>
                    <div className="flex gap-4">
                        <button 
                            onClick={fetchAllData}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 border border-gray-800 rounded-full text-xs font-black uppercase tracking-widest text-white hover:bg-gray-800 transition-all"
                        >
                            <RefreshCcw className="w-4 h-4" /> Retry
                        </button>
                    </div>
                  </div>
                ) : profile && (
                  <div className="flex flex-col lg:flex-row items-stretch gap-8">
                    {/* Refined Profile Card */}
                    <div className="flex-1 flex flex-col md:flex-row items-center gap-8 bg-gray-900/40 p-8 rounded-[3rem] border border-gray-800/50 backdrop-blur-xl relative overflow-hidden group">
                      <div className={`absolute inset-0 bg-gradient-to-br ${activePlatform === 'spotify' ? 'from-green-500/5 to-blue-500/5' : 'from-red-500/5 to-orange-500/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-1000`}></div>
                      
                      <div className="relative">
                        <div className={`absolute -inset-1 bg-gradient-to-r ${activePlatform === 'spotify' ? 'from-green-500 to-blue-500' : 'from-red-500 to-orange-500'} rounded-full blur opacity-25`}></div>
                        {profile.images?.[0]?.url || profile.avatar_url ? (
                          <img src={profile.images?.[0]?.url || profile.avatar_url} className="relative w-32 h-32 rounded-full object-cover border-4 border-black shadow-2xl" alt="" />
                        ) : (
                          <div className="relative w-32 h-32 rounded-full bg-gray-800 border-4 border-black flex items-center justify-center">
                              <Users className="w-12 h-12 text-gray-600" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 text-center md:text-left z-10">
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-2">{profile.display_name || profile.username}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                            <span className={`px-3 py-1 bg-white/5 text-gray-400 text-[9px] font-black rounded-full border border-white/10 uppercase tracking-widest`}>
                                {profile.country || 'Global'} Archive
                            </span>
                            <span className={`px-3 py-1 bg-white/5 text-gray-400 text-[9px] font-black rounded-full border border-white/10 uppercase tracking-widest`}>
                                {profile.followers?.total || 0} Followers
                            </span>
                        </div>
                        
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Top Genetic Genres</p>
                          <div className="flex flex-wrap justify-center md:justify-start gap-2">
                            {topGenres.length > 0 ? topGenres.map((genre: string) => (
                              <span key={genre} className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-black/60 text-white rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                                {genre}
                              </span>
                            )) : (
                              <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 bg-black/40 text-gray-600 rounded-lg">Calibrating...</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Time Range Selector */}
                    <div className="flex flex-col justify-center gap-4 bg-black/40 p-6 rounded-[3rem] border border-white/5">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] text-center mb-2">Temporal Filter</p>
                        <div className="flex flex-row lg:flex-col gap-2">
                          {[
                            { id: 'short_term', label: '4 Weeks' },
                            { id: 'medium_term', label: '6 Months' },
                            { id: 'long_term', label: 'All Time' }
                          ].map((range) => (
                            <button 
                              key={range.id}
                              onClick={() => setTimeRange(range.id as TimeRange)}
                              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                                timeRange === range.id 
                                  ? (activePlatform === 'spotify' ? 'bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/20' : 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/20')
                                  : 'bg-white/5 border-white/5 text-gray-500 hover:text-gray-300 hover:bg-white/10'
                              }`}
                            >
                              {range.label}
                            </button>
                          ))}
                        </div>
                    </div>
                  </div>
                )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className={`w-12 h-12 ${activePlatform === 'spotify' ? 'text-green-500' : 'text-red-500'} animate-spin`} />
                <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing with Neural Grid...</p>
              </div>
            ) : profile && (
              <div className="w-screen relative left-1/2 -ml-[50vw] overflow-x-auto flex gap-6 py-12 px-12 custom-scrollbar snap-x snap-mandatory">
                {/* Phone 1: Top Artists */}
                <PhoneSection 
                  title={selectedArtist && view === 'dashboard' ? selectedArtist.name : "Top Artists"} 
                  icon={Users} 
                  color="bg-blue-600"
                >
                  {artistLoading ? (
                    <div className="flex items-center justify-center py-20">
                       <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    </div>
                  ) : selectedArtist && discography && view === 'dashboard' ? (
                    <div className="space-y-4">
                      <button 
                        onClick={() => {
                          setSelectedArtist(null);
                          setDiscography(null);
                        }}
                        className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 hover:text-white transition-colors"
                      >
                        <ArrowLeft className="w-3 h-3" /> Back to Artists
                      </button>
                      
                      <div className="flex flex-col items-center text-center mb-6">
                        <img src={selectedArtist.images?.[0]?.url} className="w-24 h-24 rounded-full object-cover mb-3 shadow-lg" alt="" />
                        <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">{selectedArtist.name}</h4>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">{selectedArtist.genres?.[0]}</p>
                        
                        <div className="w-full p-4 bg-white/5 rounded-2xl border border-white/5 text-left">
                           <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">About on Spotify</p>
                           <p className="text-[11px] text-gray-500 leading-relaxed">
                             {selectedArtist.name} is a renowned artist in the {selectedArtist.genres?.join(', ')} scenes. 
                             With a popularity score of {selectedArtist.popularity}% and over {selectedArtist.followers?.total?.toLocaleString() || 'thousands of'} followers, 
                             they continue to influence the global music grid.
                           </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Top Signals</p>
                        {discography.top_tracks?.slice(0, 5).map((track: any, i: number) => (
                          <div 
                            key={track.id} 
                            onClick={() => playSong(track)}
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                          >
                            <span className="text-[10px] font-black text-gray-600 w-4">{i + 1}</span>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-xs font-bold text-white truncate">{track.title}</p>
                            </div>
                            <Play className="w-3 h-3 text-gray-700 group-hover:text-green-500" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {topArtists.map((artist, i) => (
                        <div 
                          key={artist.id} 
                          onClick={() => handleArtistClick(artist)}
                          className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                        >
                          <span className="text-[10px] font-black text-gray-600 w-4">{i + 1}</span>
                          <img src={artist.images?.[2]?.url} className="w-10 h-10 rounded-full object-cover" alt="" />
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{artist.name}</p>
                            <p className="text-[9px] text-gray-500 uppercase font-black">{artist.genres?.[0] || 'Artist'}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-700 group-hover:text-white transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}
                </PhoneSection>

                {/* Phone 2: Top Tracks */}
                <PhoneSection title="Top Tracks" icon={TrendingUp} color="bg-green-600">
                   <div className="space-y-4">
                    {topTracks.map((track, i) => (
                      <div 
                        key={track.id} 
                        onClick={() => playSong(track)}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                      >
                        <span className="text-[10px] font-black text-gray-600 w-4">{i + 1}</span>
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                           <img src={track.cover_url} className="w-full h-full object-cover" alt="" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-4 h-4 text-white fill-white" />
                           </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-bold text-white truncate">{track.title}</p>
                          <p className="text-[9px] text-gray-500 uppercase font-black truncate">{track.artist_name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </PhoneSection>

                {/* Phone 3: Top Albums (NEW) */}
                {activePlatform === 'spotify' && (
                  <PhoneSection 
                    title={selectedAlbum && view === 'dashboard' ? selectedAlbum.title : "Saved Albums"} 
                    icon={Disc} 
                    color="bg-purple-600"
                  >
                    {albumLoading ? (
                      <div className="flex items-center justify-center py-20">
                         <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                      </div>
                    ) : selectedAlbum && albumTracks && view === 'dashboard' ? (
                      <div className="space-y-4">
                        <button 
                          onClick={() => {
                            setSelectedAlbum(null);
                            setAlbumTracks(null);
                          }}
                          className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 hover:text-white transition-colors"
                        >
                          <ArrowLeft className="w-3 h-3" /> Back to Albums
                        </button>
                        
                        <div className="flex flex-col items-center text-center mb-6">
                           <img src={selectedAlbum.cover_url} className="w-32 h-32 rounded-2xl object-cover mb-3 shadow-lg" alt="" />
                           <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">{selectedAlbum.title}</h4>
                           <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{selectedAlbum.artist_name}</p>
                        </div>

                        <div className="space-y-3">
                          {albumTracks.tracks?.map((track: any, i: number) => (
                            <div 
                              key={track.id} 
                              onClick={() => playSong(track)}
                              className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                            >
                              <span className="text-[10px] font-black text-gray-600 w-4">{i + 1}</span>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-bold text-white truncate">{track.title}</p>
                                <p className="text-[9px] text-gray-500 uppercase font-black">{track.artist_name}</p>
                              </div>
                              <Play className="w-3 h-3 text-gray-700 group-hover:text-green-500" />
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        {albums.map((album) => (
                          <div 
                            key={album.id} 
                            onClick={() => handleAlbumClick(album)}
                            className="flex flex-col bg-white/5 p-2 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                          >
                            <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                               <img src={album.cover_url} className="w-full h-full object-cover" alt="" />
                               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Disc className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-white truncate px-1">{album.title}</p>
                            <p className="text-[8px] text-gray-500 uppercase font-black truncate px-1">{album.artist_name}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </PhoneSection>
                )}

                {/* Phone 4: Recent History */}
                <PhoneSection title="Recent Activity" icon={History} color="bg-red-600">
                   <div className="space-y-4">
                    {recentTracks.map((track, i) => (
                      <div 
                        key={`${track.id}-${i}`} 
                        onClick={() => playSong(track)}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                      >
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                           <img src={track.cover_url} className="w-full h-full object-cover" alt="" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="w-4 h-4 text-white fill-white" />
                           </div>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-bold text-white truncate">{track.title}</p>
                          <p className="text-[9px] text-gray-500 uppercase font-black truncate">{track.artist_name}</p>
                          <p className="text-[8px] text-gray-600 font-bold mt-1 flex items-center gap-1">
                            <Clock className="w-2 h-2" /> {track.played_at ? new Date(track.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </PhoneSection>

                 {/* Phone 5: Collections */}
                 <PhoneSection title="Playlists" icon={Layers} color="bg-pink-600">
                    <div className="space-y-4">
                      {playlists.length > 0 ? playlists.map((p) => (
                        <div 
                          key={p.id} 
                          className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-lg">
                             <img src={p.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'} className="w-full h-full object-cover" alt="" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-white truncate">{p.name}</p>
                            <p className="text-[9px] text-gray-500 uppercase font-black">{p.track_count} Tracks</p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-700 group-hover:text-white" />
                        </div>
                      )) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                           <Layers className="w-8 h-8 text-gray-800 mb-4 opacity-20" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">No collections found in your archive</p>
                        </div>
                      )}
                    </div>
                 </PhoneSection>
              </div>
            )}
          </motion.div>
        ) : view === 'artist-detail' ? (
          /* Artist Detail View - Also in a Phone or Full Screen? 
             Let's do a refined Full Screen Detail but keep the "back" button logic. */
          <motion.div 
            key="artist-detail-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl mx-auto space-y-12"
          >
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setView('dashboard')}
                className="w-14 h-14 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-gray-800 transition-colors shadow-xl"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Mic2 className={`w-4 h-4 ${activePlatform === 'spotify' ? 'text-green-500' : 'text-red-500'}`} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Artist Profile</span>
                </div>
                <h1 className="text-5xl font-black text-white uppercase tracking-tighter italic">{selectedArtist?.name}</h1>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className={`w-12 h-12 ${activePlatform === 'spotify' ? 'text-green-500' : 'text-red-500'} animate-spin`} />
              </div>
            ) : discography ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-green-500/10 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Popular Tracks</h2>
                  </div>
                  <div className="space-y-3">
                    {discography.top_tracks?.map((track: any, i: number) => (
                      <div 
                        key={track.id} 
                        onClick={() => playSong(track)}
                        className="flex items-center gap-4 p-4 bg-gray-900/40 rounded-[2rem] border border-gray-800/50 hover:bg-gray-800 transition-all cursor-pointer group"
                      >
                        <span className="text-xs font-black text-gray-700 w-4">{i + 1}</span>
                        <img src={track.cover_url} className="w-12 h-12 rounded-xl object-cover" alt="" />
                        <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold text-white text-sm truncate">{track.title}</h4>
                          <p className="text-[10px] text-gray-500 uppercase font-black mt-1">
                            {track.duration_ms ? `${Math.floor(track.duration_ms / 60000)}:${(Math.floor((track.duration_ms % 60000) / 1000)).toString().padStart(2, '0')}` : 'N/A'}
                          </p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                           <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-purple-500/10 rounded-xl">
                      <Disc className="w-5 h-5 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Discography</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    {discography.albums?.map((album: any) => (
                      <div 
                        key={album.id} 
                        onClick={() => handleAlbumClick(album)}
                        className="group cursor-pointer"
                      >
                        <div className="relative aspect-square rounded-3xl overflow-hidden mb-4 shadow-2xl border border-white/5">
                          <img src={album.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Disc className="w-12 h-12 text-white/50" />
                          </div>
                        </div>
                        <h4 className="font-bold text-sm text-white truncate">{album.title}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[10px] text-gray-500 font-black uppercase">{album.release_date ? new Date(album.release_date).getFullYear() : 'N/A'}</p>
                          <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] text-gray-600 font-black uppercase">{album.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            ) : null}
          </motion.div>
        ) : (
          /* Album Detail View (NEW) */
          <motion.div 
            key="album-detail-view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
             <button 
                onClick={() => setView(selectedArtist ? 'artist-detail' : 'dashboard')}
                className="mb-12 flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.3em]"
              >
                <ArrowLeft className="w-4 h-4" /> Back to {selectedArtist ? 'Artist' : 'Dashboard'}
              </button>

              <div className="flex flex-col md:flex-row gap-12 items-end mb-16">
                 <div className="w-full md:w-72 aspect-square rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50 border border-white/10 shrink-0">
                    <img src={selectedAlbum?.cover_url} className="w-full h-full object-cover" alt="" />
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                       <span className="px-3 py-1 bg-purple-600/20 text-purple-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/20">
                          {selectedAlbum?.type || 'Album'}
                       </span>
                       {selectedAlbum?.release_date && (
                         <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" /> {new Date(selectedAlbum.release_date).getFullYear()}
                         </span>
                       )}
                    </div>
                    <h1 className="text-6xl font-black text-white uppercase italic tracking-tighter leading-[0.9] mb-6">{selectedAlbum?.title}</h1>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center">
                             <Users className="w-3 h-3 text-gray-500" />
                          </div>
                          <span className="text-sm font-bold text-white">{selectedAlbum?.artist_name}</span>
                       </div>
                       <span className="w-1.5 h-1.5 rounded-full bg-gray-700" />
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{albumTracks?.tracks?.length || 0} Tracks</span>
                    </div>
                 </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                   <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
                </div>
              ) : (
                <div className="bg-gray-900/40 rounded-[3rem] border border-gray-800/50 overflow-hidden backdrop-blur-xl">
                   <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black">
                            <Play className="w-5 h-5 fill-current ml-1" />
                         </div>
                         <h3 className="text-sm font-black text-white uppercase tracking-widest">Tracklist</h3>
                      </div>
                      <Heart className="w-6 h-6 text-gray-700 hover:text-red-500 transition-colors cursor-pointer" />
                   </div>
                   <div className="divide-y divide-white/5">
                      {albumTracks?.tracks?.map((track: any, i: number) => (
                        <div 
                          key={track.id} 
                          onClick={() => playSong(track)}
                          className="px-8 py-5 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group"
                        >
                           <div className="flex items-center gap-6">
                              <span className="text-xs font-black text-gray-700 w-4 group-hover:text-green-500 transition-colors">{i + 1}</span>
                              <div>
                                 <p className="font-bold text-white text-sm group-hover:text-green-500 transition-colors">{track.title}</p>
                                 <p className="text-[10px] text-gray-500 font-black uppercase mt-0.5">{track.artist_name}</p>
                              </div>
                           </div>
                           <span className="text-[10px] font-black text-gray-700">
                             {track.duration_ms ? `${Math.floor(track.duration_ms / 60000)}:${(Math.floor((track.duration_ms % 60000) / 1000)).toString().padStart(2, '0')}` : 'N/A'}
                           </span>
                        </div>
                      ))}
                   </div>
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4 opacity-30">
        <div className="flex items-center gap-3">
           <div className={`w-1.5 h-1.5 rounded-full ${activePlatform === 'spotify' ? 'bg-blue-500' : 'bg-red-500'}`}></div>
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Archive Link Active</span>
        </div>
        <p className="text-[9px] text-gray-600 font-medium uppercase tracking-widest">Powered by SonicVerse Neural Engine</p>
      </div>
    </div>
  );
};
