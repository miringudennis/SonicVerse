import { useState, useEffect, useMemo } from 'react';
import { 
  Play, 
  Search, 
  Link2, 
  Music, 
  Loader2, 
  ArrowLeft, 
  Disc, 
  Clock, 
  TrendingUp, 
  Calendar,
  Layers,
  Users,
  ExternalLink,
  History
} from 'lucide-react';
import api from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export const CatalogPage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [recentTracks, setRecentTracks] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [discography, setDiscography] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [view, setView] = useState<'dashboard' | 'artist-detail'>('dashboard');

  const setSong = usePlayerStore((state) => state.setSong);
  const linkedAccounts = useAuthStore(state => state.linkedAccounts);
  const isSpotifyConnected = linkedAccounts.some(a => a.platform === 'spotify');

  useEffect(() => {
    if (isSpotifyConnected) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [isSpotifyConnected, timeRange]);

  const fetchAllData = async () => {
    setLoading(true);
    const token = localStorage.getItem('spotify_token');
    if (!token) {
      setLoading(false);
      return;
    }

    const headers = { 'x-spotify-token': token };

    try {
      const [profRes, artistsRes, tracksRes, recentRes, playlistsRes] = await Promise.all([
        api.get('/spotify/profile', { headers }),
        api.get(`/spotify/top-artists?time_range=${timeRange}`, { headers }),
        api.get(`/spotify/top-tracks?time_range=${timeRange}`, { headers }),
        api.get('/spotify/recently-played', { headers }),
        api.get('/spotify/playlists', { headers })
      ]);

      setProfile(profRes.data);
      setTopArtists(artistsRes.data);
      setTopTracks(tracksRes.data);
      setRecentTracks(recentRes.data);
      setPlaylists(playlistsRes.data);
    } catch (err) {
      console.error('Failed to fetch Spotify dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleArtistClick = async (artist: any) => {
    setSelectedArtist(artist);
    setLoading(true);
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

  if (!isSpotifyConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-8 border border-green-500/20">
          <Link2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-3xl font-black text-white mb-4 uppercase italic tracking-tighter">Spotify Not Connected</h2>
        <p className="text-gray-500 max-w-md mb-8">Connect your Spotify account to unlock your personalized Volt.fm style dashboard.</p>
        <button 
          onClick={() => window.location.href = '/sync/spotify'}
          className="px-8 py-3 bg-green-600 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-green-500 transition-all shadow-lg shadow-green-900/20"
        >
          Connect Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-12 pb-32">
      {/* Header / Profile Section */}
      <AnimatePresence mode="wait">
        {view === 'dashboard' ? (
          <motion.div 
            key="dashboard-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
          >
            {profile && (
              <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-900/40 p-10 rounded-[3rem] border border-gray-800/50 backdrop-blur-xl">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <img src={profile.images[0]?.url} className="relative w-32 h-32 rounded-full object-cover border-2 border-white/10" alt="" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                    <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter">{profile.display_name}</h1>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <span className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-full border border-green-500/20 uppercase tracking-widest flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> {profile.followers?.total} Followers
                        </span>
                        <span className="px-3 py-1 bg-white/5 text-gray-400 text-[10px] font-black rounded-full border border-white/10 uppercase tracking-widest">
                            {profile.country}
                        </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {topArtists[0]?.genres?.slice(0, 3)?.map((genre: string) => (
                      <span key={genre} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-black/40 text-gray-500 rounded-xl border border-white/5">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Time Range Selector */}
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
          </motion.div>
        ) : (
          <motion.div 
            key="artist-header"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-6"
          >
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
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
          <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing with Spotify Neural Grid...</p>
        </div>
      ) : (
        <motion.div layout transition={{ duration: 0.5 }}>
          {view === 'dashboard' ? (
            <div className="space-y-16">
              {/* Main Grid: Top Artists & Top Songs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Top Artists Column */}
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
                    {topArtists.map((artist, index) => (
                      <div 
                        key={artist.id}
                        onClick={() => handleArtistClick(artist)}
                        className="group flex items-center gap-4 p-4 bg-gray-900/30 rounded-[2rem] border border-gray-800/40 hover:bg-gray-800/60 transition-all cursor-pointer"
                      >
                        <span className="w-6 text-center text-xs font-black text-gray-600 group-hover:text-white">{(index + 1).toString().padStart(2, '0')}</span>
                        <img src={artist.images[2]?.url} className="w-14 h-14 rounded-full object-cover shadow-lg" alt="" />
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-sm group-hover:text-green-500 transition-colors">{artist.name}</h4>
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">{artist.genres[0]}</p>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowLeft className="w-4 h-4 text-gray-500 rotate-180" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Top Tracks Column */}
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
                    {topTracks.map((track, index) => (
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
                    ))}
                  </div>
                </section>
              </div>

              {/* Recent Activity Section */}
              <section>
                <div className="flex items-center gap-3 mb-8 px-4 border-l-4 border-purple-500 pl-4">
                  <History className="w-6 h-6 text-purple-500" />
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Recent Activity</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {recentTracks.slice(0, 5).map(track => (
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
                  ))}
                </div>
              </section>

              {/* Playlists Section */}
              <section>
                <div className="flex items-center gap-3 mb-8 px-4 border-l-4 border-pink-500 pl-4">
                  <Layers className="w-6 h-6 text-pink-500" />
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Collections</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {playlists.map(playlist => (
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
                  ))}
                </div>
              </section>
            </div>
          ) : (
            /* Artist Detail View */
            <div className="space-y-16">
              {discography && (
                <>
                  {/* Top Tracks for Artist */}
                  <section>
                    <div className="flex items-center gap-3 mb-8 border-l-4 border-green-500 pl-4">
                      <Music className="w-6 h-6 text-green-500" />
                      <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Top Songs</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {discography.top_tracks?.map((track: any) => (
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
                      ))}
                    </div>
                  </section>

                  {/* Albums Section */}
                  <section>
                    <div className="flex items-center gap-3 mb-8 border-l-4 border-blue-500 pl-4">
                      <Disc className="w-6 h-6 text-blue-500" />
                      <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Discography</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                      {discography.albums?.map((album: any) => (
                        <div key={album.id} className="group">
                          <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg border border-white/5">
                            <img src={album.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="" />
                            <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded-lg text-[8px] font-black text-blue-400 uppercase">
                              {album.type}
                            </div>
                          </div>
                          <h4 className="font-bold text-xs text-white truncate mb-1">{album.title}</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-[9px] text-gray-500 font-bold uppercase">{new Date(album.release_date).getFullYear()}</p>
                            <span className="text-[9px] text-blue-500 font-black uppercase tracking-tighter">{album.play_count?.toLocaleString()} plays</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Footer Branding */}
      <div className="pt-20 border-t border-white/5 flex flex-col items-center gap-4 opacity-30">
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Spotify Data Link Active</span>
        </div>
        <p className="text-[9px] text-gray-600 font-medium uppercase tracking-widest">Analytics powered by SonicVerse Neural Engine</p>
      </div>
    </div>
  );
};
