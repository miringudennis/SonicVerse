import { useState, useEffect, useMemo } from 'react';
import { Play, Plus, Search, Globe, Link2, Music, CheckCircle2, Loader2, ArrowLeft, Disc, Clock, BarChart3 } from 'lucide-react';
import api from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

type View = 'internal' | 'external-artists' | 'artist-detail';

export const CatalogPage = () => {
  const [internalSongs, setInternalSongs] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [discography, setDiscography] = useState<{ albums: any[], top_tracks: any[] } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');
  const [view, setView] = useState<View>('internal');

  const setSong = usePlayerStore((state) => state.setSong);
  const linkedAccounts = useAuthStore(state => state.linkedAccounts);

  useEffect(() => {
    if (activeTab === 'internal') {
      const fetchSongs = async () => {
        setLoading(true);
        try {
          const res = await api.get('/songs');
          setInternalSongs(res.data);
          setView('internal');
        } catch (err) {
          console.error('Failed to fetch internal songs', err);
        } finally {
          setLoading(false);
        }
      };
      fetchSongs();
    } else {
      setView('external-artists'); // Ensure view changes to external
      fetchTopArtists();
    }
  }, [activeTab]);

  const fetchTopArtists = async () => {
    if (!linkedAccounts.some(a => a.platform === 'spotify')) {
      setView('external-artists');
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('spotify_token');
      if (token) {
        const res = await api.get('/spotify/top-artists', {
          headers: { 'x-spotify-token': token }
        });
        setTopArtists(res.data);
        setView('external-artists');
      }
    } catch (err) {
      console.error('Failed to fetch top artists', err);
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

  const filteredInternal = useMemo(() => {
    return internalSongs.filter(s => 
      s.title.toLowerCase().includes(search.toLowerCase()) || 
      s.artist_name.toLowerCase().includes(search.toLowerCase())
    );
  }, [internalSongs, search]);

  const filteredArtists = useMemo(() => {
    return topArtists.filter(a => a.name.toLowerCase().includes(search.toLowerCase()));
  }, [topArtists, search]);

  return (
    <div className="py-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div className="flex items-center gap-6">
          {view === 'artist-detail' && (
            <button 
              onClick={() => setView('external-artists')}
              className="w-12 h-12 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
          )}
          <div>
            <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">
              {view === 'artist-detail' ? selectedArtist?.name : 'Music Catalog'}
            </h1>
            <p className="text-gray-500 text-sm">
              {view === 'artist-detail' 
                ? `Exploring discography and listening history for ${selectedArtist?.name}`
                : 'Browse the SonicVerse repository and your connected streaming libraries.'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Tab Switcher */}
            {view !== 'artist-detail' && (
              <div className="flex bg-gray-900/80 p-1 rounded-2xl border border-gray-800 self-stretch sm:self-auto">
                <button 
                    onClick={() => setActiveTab('internal')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      activeTab === 'internal' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <Globe className="w-3.5 h-3.5" />
                    SonicVerse
                </button>
                <button 
                    onClick={() => setActiveTab('external')}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                      activeTab === 'external' ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'text-gray-500 hover:text-gray-300'
                    }`}
                >
                    <Link2 className="w-3.5 h-3.5" />
                    Linked Library
                </button>
              </div>
            )}

            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder={view === 'external-artists' ? "Search artists..." : "Search library..."} 
                    className="w-full bg-gray-900 border border-gray-800 p-3.5 pl-12 rounded-full focus:outline-none focus:border-blue-500 transition text-white text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Accessing Neural Archive...</p>
          </div>
        ) : (
          <motion.div 
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {view === 'internal' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredInternal.map((song) => (
                  <div key={song.id} className="group bg-gray-900/40 hover:bg-gray-800/60 rounded-3xl p-5 border border-gray-800/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5">
                    <div className="relative aspect-square mb-5 overflow-hidden rounded-2xl shadow-xl">
                      <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                      <button 
                        onClick={() => setSong(song)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-500"
                      >
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white scale-75 group-hover:scale-100 transition duration-500">
                            <Play className="w-8 h-8 ml-1 fill-current" />
                        </div>
                      </button>
                    </div>
                    <h3 className="font-black text-lg mb-1 truncate text-white">{song.title}</h3>
                    <p className="text-gray-500 text-sm mb-4 font-medium">{song.artist_name}</p>
                    <div className="flex flex-wrap gap-2">
                        {song.mood_tags?.map((tag: string) => (
                            <span key={tag} className="text-[9px] uppercase font-black tracking-widest px-2.5 py-1 bg-blue-600/5 text-blue-500 rounded-lg border border-blue-500/10">
                                {tag}
                            </span>
                        ))}
                    </div>
                  </div>
                ))}
                <div className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-800 rounded-3xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group">
                    <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <Plus className="w-8 h-8 text-gray-600 group-hover:text-blue-500" />
                    </div>
                    <p className="font-black text-xs uppercase tracking-widest text-gray-600 group-hover:text-blue-500">Submit Original</p>
                </div>
              </div>
            )}

            {view === 'external-artists' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredArtists.map((artist) => (
                  <div 
                    key={artist.id} 
                    onClick={() => handleArtistClick(artist)}
                    className="group bg-gray-900/40 hover:bg-gray-800/60 rounded-3xl p-6 border border-gray-800/50 transition-all duration-500 cursor-pointer text-center relative overflow-hidden"
                  >
                    <div className="absolute top-4 right-4 bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-[10px] font-black border border-green-500/20 flex items-center gap-1.5">
                      <BarChart3 className="w-3 h-3" />
                      {artist.play_count.toLocaleString()} PLAYS
                    </div>

                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <img src={artist.images[0]?.url} className="w-full h-full object-cover rounded-full shadow-2xl group-hover:scale-110 transition duration-700 border-2 border-transparent group-hover:border-green-500/50" alt={artist.name} />
                    </div>
                    
                    <h3 className="font-black text-xl text-white mb-2 uppercase italic tracking-tighter">{artist.name}</h3>
                    <div className="flex flex-wrap justify-center gap-2">
                      {artist.genres?.slice(0, 2).map((genre: string) => (
                        <span key={genre} className="text-[9px] uppercase font-black tracking-widest px-2.5 py-1 bg-white/5 text-gray-500 rounded-lg">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
                {topArtists.length === 0 && !loading && (
                   <div className="col-span-full py-20 text-center">
                      <Link2 className="w-12 h-12 text-gray-800 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-500 uppercase">No accounts linked</h3>
                   </div>
                )}
              </div>
            )}

            {view === 'artist-detail' && discography && (
              <div className="space-y-16">
                {/* Top Tracks Section */}
                <section>
                  <div className="flex items-center gap-3 mb-8 border-l-4 border-green-500 pl-4">
                    <Music className="w-6 h-6 text-green-500" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Most Listened Tracks</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {discography.top_tracks.map(track => (
                      <div key={track.id} className="flex items-center justify-between p-4 bg-gray-900/40 rounded-2xl border border-gray-800 hover:bg-gray-800/60 transition-colors group">
                        <div className="flex items-center gap-4">
                          <img src={track.cover_url} className="w-12 h-12 rounded-lg object-cover" alt="" />
                          <div>
                            <h4 className="font-bold text-white text-sm">{track.title}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {Math.floor(track.duration_ms / 60000)}:{(Math.floor((track.duration_ms % 60000) / 1000)).toString().padStart(2, '0')}
                              </span>
                              <span className="text-[10px] text-green-500 font-black uppercase">{track.play_count} plays</span>
                            </div>
                          </div>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Albums & EPs</h2>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {discography.albums.map(album => (
                      <div key={album.id} className="group">
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg border border-white/5">
                          <img src={album.cover_url} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={album.title} />
                          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur rounded-lg text-[8px] font-black text-blue-400 uppercase">
                            {album.type}
                          </div>
                        </div>
                        <h4 className="font-bold text-sm text-white truncate mb-1">{album.title}</h4>
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] text-gray-500 font-bold uppercase">{new Date(album.release_date).getFullYear()}</p>
                          <span className="text-[10px] text-blue-500 font-black uppercase tracking-tighter">{album.play_count} library plays</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync Status Banner */}
      <div className="mt-16 p-8 rounded-[2.5rem] bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
               <Music className="w-7 h-7 text-blue-500" />
            </div>
            <div>
               <h4 className="text-xl font-black text-white uppercase italic tracking-tighter">Unified Library</h4>
               <p className="text-gray-400 text-sm">SonicVerse seamlessly blends your local catalog with global streaming platforms.</p>
            </div>
         </div>
         <div className="flex items-center gap-3 px-6 py-3 bg-black/40 rounded-2xl border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span className="text-xs font-black uppercase tracking-widest text-gray-300">Intelligent Sync Active</span>
         </div>
      </div>
    </div>
  );
};
