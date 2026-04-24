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
  Library
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';
type ViewState = 'welcome' | 'dashboard' | 'artist-detail';

export const CatalogPage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [discography, setDiscography] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [view, setView] = useState<ViewState>('welcome');

  const setSong = usePlayerStore((state) => state.setSong);
  const linkedAccounts = useAuthStore(state => state.linkedAccounts);
  const isSpotifyConnected = linkedAccounts.some(a => a.platform === 'spotify');
  const isYoutubeLinked = linkedAccounts.some(a => a.platform === 'youtube');
  const isAppleLinked = linkedAccounts.some(a => a.platform === 'apple');
  
  const navigate = useNavigate();

  useEffect(() => {
    if (view === 'dashboard' && isSpotifyConnected) {
      fetchAllData();
    }
  }, [view, timeRange]);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('spotify_token');
    
    if (!token) {
      setError('Spotify access token missing. Please re-connect your account.');
      setLoading(false);
      return;
    }

    const headers = { 'x-spotify-token': token };

    try {
      const results = await Promise.allSettled([
        api.get('/spotify/profile', { headers }),
        api.get(`/spotify/top-artists?time_range=${timeRange}`, { headers }),
        api.get(`/spotify/top-tracks?time_range=${timeRange}`, { headers }),
        api.get('/spotify/recently-played', { headers }),
        api.get('/spotify/playlists', { headers })
      ]);

      if (results[0].status === 'fulfilled') setProfile(results[0].value.data);
      if (results[1].status === 'fulfilled') setTopArtists(results[1].value.data);
      if (results[2].status === 'fulfilled') setTopTracks(results[2].value.data);
      if (results[3].status === 'fulfilled') setRecentTracks(results[3].value.data);
      if (results[4].status === 'fulfilled') setPlaylists(results[4].value.data);

      if (results[0].status === 'rejected') {
        const error = results[0].reason;
        if (error.response?.status === 403 || error.response?.status === 401) {
          setError('Spotify session expired or permissions missing. Please re-sync.');
        } else {
          setError('Failed to connect to Spotify API. Please try again.');
        }
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
    setLoading(true);
    setDiscography(null);
    setView('artist-detail');
    try {
      const token = localStorage.getItem('spotify_token');
      if (token) {
        const res = await api.get(`/spotify/artist/${artist.id}/discography`, {
          headers: { 'x-spotify-token': token }
        });
        setDiscography(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch discography', err);
    } finally {
      setLoading(false);
    }
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
    if (p.id === 'spotify') {
      setView('dashboard');
    } else {
      // Future platforms
      alert(`${p.name} integration is currently being optimized. Check back soon!`);
    }
  };

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
                        <button 
                            onClick={() => navigate('/sync/spotify')}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg shadow-green-900/20"
                        >
                            Refresh Connection
                        </button>
                    </div>
                  </div>
                ) : profile && (
                  <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-900/40 p-10 rounded-[3rem] border border-gray-800/50 backdrop-blur-xl">
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                      {profile.images?.[0]?.url ? (
                        <img src={profile.images[0].url} className="relative w-32 h-32 rounded-full object-cover border-2 border-white/10" alt="" />
                      ) : (
                        <div className="relative w-32 h-32 rounded-full bg-gray-800 border-2 border-white/10 flex items-center justify-center">
                            <Users className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">{profile.display_name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-full border border-green-500/20 uppercase tracking-widest flex items-center gap-1.5">
                                <Users className="w-3 h-3" /> {profile.followers?.total?.toLocaleString()} Followers
                            </span>
                            <span className="px-3 py-1 bg-white/5 text-gray-400 text-[10px] font-black rounded-full border border-white/10 uppercase tracking-widest">
                                {profile.country}
                            </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {topArtists?.[0]?.genres?.slice(0, 3)?.map((genre: string) => (
                          <span key={genre} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-black/40 text-gray-500 rounded-xl border border-white/5">
                            {genre}
                          </span>
                        )) || (
                          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-black/40 text-gray-600 rounded-xl border border-white/5">
                            Analyzing Genres...
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 self-stretch md:self-auto">
                        {[
                          { id: 'short_term', label: '4 Weeks' },
                          { id: 'medium_term', label: '6 Months' },
                          { id: 'long_term', label: 'All Time' }
                        ].map((range) => (
                          <button 
                            key={range.id}
                            onClick={() => setTimeRange(range.id as TimeRange)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              timeRange === range.id ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'text-gray-500 hover:text-gray-300'
                            }`}
                          >
                            {range.label}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
                <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing with Spotify Neural Grid...</p>
              </div>
            ) : profile && (
              <div className="space-y-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <section>
                    <div className="flex items-center justify-between mb-8 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                          <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Top Artists</h2>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {topArtists.length > 0 ? topArtists.map((artist, index) => (
                        <div 
                          key={artist.id}
                          onClick={() => handleArtistClick(artist)}
                          className="group flex items-center gap-4 p-4 bg-gray-900/30 rounded-[2rem] border border-gray-800/40 hover:bg-gray-800/60 transition-all cursor-pointer"
                        >
                          <span className="w-6 text-center text-xs font-black text-gray-600 group-hover:text-white">{(index + 1).toString().padStart(2, '0')}</span>
                          {artist.images?.[2]?.url ? (
                              <img src={artist.images[2].url} className="w-14 h-14 rounded-full object-cover shadow-lg" alt="" />
                          ) : (
                              <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center">
                                  <Users className="w-6 h-6 text-gray-700" />
                              </div>
                          )}
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-sm group-hover:text-green-500 transition-colors">{artist.name}</h4>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">{artist.genres?.[0] || 'Artist'}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowLeft className="w-4 h-4 text-gray-500 rotate-180" />
                          </div>
                        </div>
                      )) : (
                          <div className="p-8 bg-gray-900/20 rounded-[2rem] border border-dashed border-gray-800 flex flex-col items-center justify-center text-center">
                              <Users className="w-8 h-8 text-gray-700 mb-4 opacity-20" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">No listener history for this period</p>
                          </div>
                      )}
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center justify-between mb-8 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-600/10 flex items-center justify-center border border-green-500/20">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Top Songs</h2>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {topTracks.length > 0 ? topTracks.map((track, index) => (
                        <div 
                          key={track.id}
                          className="group flex items-center gap-4 p-4 bg-gray-900/30 rounded-[2rem] border border-gray-800/40 hover:bg-gray-800/60 transition-all"
                        >
                          <span className="w-6 text-center text-xs font-black text-gray-600 group-hover:text-white">{(index + 1).toString().padStart(2, '0')}</span>
                          <div className="relative overflow-hidden rounded-xl">
                            <img src={track.cover_url} className="w-14 h-14 object-cover" alt="" />
                            <button 
                              onClick={() => setSong(track)}
                              className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Play className="w-5 h-5 text-white fill-white" />
                            </button>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-sm">{track.title}</h4>
                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">{track.artist_name}</p>
                          </div>
                          <span className="text-[10px] font-black text-gray-600 group-hover:text-gray-400">
                            {Math.floor(track.duration_ms / 60000)}:{(Math.floor((track.duration_ms % 60000) / 1000)).toString().padStart(2, '0')}
                          </span>
                        </div>
                      )) : (
                          <div className="p-8 bg-gray-900/20 rounded-[2rem] border border-dashed border-gray-800 flex flex-col items-center justify-center text-center">
                              <Music className="w-8 h-8 text-gray-700 mb-4 opacity-20" />
                              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">No tracks found in archive</p>
                          </div>
                      )}
                    </div>
                  </section>
                </div>

                <section>
                  <div className="flex items-center gap-3 mb-8 px-4 border-l-4 border-purple-500 pl-4">
                    <History className="w-6 h-6 text-purple-500" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Recent Activity</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {recentTracks.length > 0 ? recentTracks.slice(0, 5).map(track => (
                      <div key={track.played_at} className="group bg-gray-900/40 p-4 rounded-3xl border border-gray-800/50 hover:bg-gray-800/60 transition-all">
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-xl">
                          <img src={track.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" alt="" />
                          <button 
                              onClick={() => setSong(track)}
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Play className="w-8 h-8 text-white fill-white" />
                            </button>
                        </div>
                        <h4 className="font-bold text-white text-xs truncate">{track.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-1 font-bold">{track.artist_name}</p>
                        <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-2 text-[9px] text-gray-600 font-black uppercase tracking-widest">
                          <Clock className="w-3 h-3" />
                          {new Date(track.played_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-12 bg-gray-900/20 rounded-[2rem] border border-dashed border-gray-800 flex flex-col items-center justify-center">
                          <History className="w-8 h-8 text-gray-700 mb-4 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">No recent playback signals detected</p>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-8 px-4 border-l-4 border-pink-500 pl-4">
                    <Layers className="w-6 h-6 text-pink-500" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Collections</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {playlists.length > 0 ? playlists.map(playlist => (
                      <div key={playlist.id} className="group cursor-pointer">
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg border border-white/5 group-hover:shadow-pink-500/10 transition-all">
                          <img src={playlist.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity"></div>
                          <div className="absolute bottom-3 left-3 right-3">
                             <p className="text-[10px] font-black text-white uppercase truncate">{playlist.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">{playlist.track_count} Tracks</span>
                          <ExternalLink className="w-3 h-3 text-gray-700 group-hover:text-pink-500" />
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full py-12 bg-gray-900/20 rounded-[2rem] border border-dashed border-gray-800 flex flex-col items-center justify-center">
                          <Layers className="w-8 h-8 text-gray-700 mb-4 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">No public playlists found</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </motion.div>
        ) : (
          /* Artist Detail View */
          <motion.div 
            key="artist-detail-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-16"
          >
            <div className="flex items-center gap-6 mb-12">
              <button 
                onClick={() => setView('dashboard')}
                className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">{selectedArtist?.name}</h1>
                <p className="text-gray-500 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  Popularity Score: {selectedArtist?.popularity}%
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              </div>
            ) : discography ? (
              <>
                <section>
                  <div className="flex items-center gap-3 mb-8 border-l-4 border-green-500 pl-4">
                    <Music className="w-6 h-6 text-green-500" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Top Songs</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {discography.top_tracks?.length > 0 ? discography.top_tracks.map((track: any) => (
                      <div key={track.id} className="flex items-center justify-between p-4 bg-gray-900/40 rounded-2xl border border-gray-800 hover:bg-gray-800/60 transition-colors group">
                        <div className="flex items-center gap-4">
                          <img src={track.cover_url} className="w-12 h-12 rounded-lg object-cover" alt="" />
                          <div>
                            <h4 className="font-bold text-white text-sm">{track.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {Math.floor(track.duration_ms / 60000)}:{(Math.floor((track.duration_ms % 60000) / 1000)).toString().padStart(2, '0')}
                              </span>
                              <span className="text-[10px] text-green-500 font-black uppercase tracking-widest">{track.play_count?.toLocaleString()} plays</span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => setSong(track)}
                          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play className="w-4 h-4 text-white fill-white" />
                        </button>
                      </div>
                    )) : (
                      <p className="col-span-full py-8 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">No top songs discovered for this artist</p>
                    )}
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-3 mb-8 border-l-4 border-blue-500 pl-4">
                    <Disc className="w-6 h-6 text-blue-500" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Discography</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {discography.albums?.length > 0 ? discography.albums.map((album: any) => (
                      <div key={album.id} className="group">
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg border border-white/5">
                          <img src={album.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded-lg text-[8px] font-black text-blue-400 uppercase">
                            {album.type}
                          </div>
                        </div>
                        <h4 className="font-bold text-xs text-white truncate mb-1">{album.title}</h4>
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] text-gray-500 font-bold uppercase">{album.release_date ? new Date(album.release_date).getFullYear() : 'N/A'}</p>
                          <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter">{album.play_count?.toLocaleString()} plays</span>
                        </div>
                      </div>
                    )) : (
                      <p className="col-span-full py-8 text-center text-gray-600 font-bold uppercase tracking-widest text-[10px]">No albums or EPs found in the neural link</p>
                    )}
                  </div>
                </section>
              </>
            ) : !loading && (
              <div className="flex flex-col items-center justify-center py-20">
                  <AlertCircle className="w-12 h-12 text-gray-800 mb-4 opacity-20" />
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Discography Archive Unavailable</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-20 border-t border-white/5 flex flex-col items-center gap-4 opacity-30">
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Archive Link Active</span>
        </div>
        <p className="text-[9px] text-gray-600 font-medium uppercase tracking-widest">Powered by SonicVerse Neural Engine</p>
      </div>
    </div>
  );
};
