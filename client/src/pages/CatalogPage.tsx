import { useState, useEffect } from 'react';
import { Play, Plus, Search, Globe, Link2, Music, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { usePlayerStore } from '../store/playerStore';
import { motion, AnimatePresence } from 'framer-motion';

export const CatalogPage = () => {
  const [internalSongs, setInternalSongs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');
  const setSong = usePlayerStore((state) => state.setSong);

  // Mock External Library Data
  const externalSongs = [
    { id: 'ext-1', title: 'Midnight City', artist_name: 'M83', cover_url: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800', source: 'Spotify', mood_tags: ['Electronic', 'Dreamy'] },
    { id: 'ext-2', title: 'Starboy', artist_name: 'The Weeknd', cover_url: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800', source: 'Apple Music', mood_tags: ['Pop', 'Energetic'] },
    { id: 'ext-3', title: 'Blinding Lights', artist_name: 'The Weeknd', cover_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', source: 'Spotify', mood_tags: ['Synthwave', 'Upbeat'] },
    { id: 'ext-4', title: 'Levitating', artist_name: 'Dua Lipa', cover_url: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?w=800', source: 'YouTube Music', mood_tags: ['Dance', 'Fun'] },
  ];

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        const res = await api.get('/songs');
        setInternalSongs(res.data);
      } catch (err) {
        console.error('Failed to fetch songs', err);
      }
    };
    fetchSongs();
  }, []);

  const currentSongs = activeTab === 'internal' ? internalSongs : externalSongs;

  const filteredSongs = currentSongs.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.artist_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="py-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">Music Catalog</h1>
          <p className="text-gray-500 text-sm">Browse the SonicVerse repository and your connected streaming libraries.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Tab Switcher */}
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

            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search library..." 
                    className="w-full bg-gray-900 border border-gray-800 p-3.5 pl-12 rounded-full focus:outline-none focus:border-blue-500 transition text-white text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
        >
          {filteredSongs.map((song) => (
            <div key={song.id} className="group bg-gray-900/40 hover:bg-gray-800/60 rounded-3xl p-5 border border-gray-800/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5">
              <div className="relative aspect-square mb-5 overflow-hidden rounded-2xl shadow-xl">
                <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                
                {/* Source Badge (for external) */}
                {song.source && (
                   <div className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-green-400 flex items-center gap-1.5 z-10">
                      <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                      {song.source}
                   </div>
                )}

                <button 
                  onClick={() => setSong(song as any)}
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

          {activeTab === 'internal' && (
            <div className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-800 rounded-3xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-gray-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <Plus className="w-8 h-8 text-gray-600 group-hover:text-blue-500" />
                </div>
                <p className="font-black text-xs uppercase tracking-widest text-gray-600 group-hover:text-blue-500">Submit Original</p>
            </div>
          )}

          {activeTab === 'external' && filteredSongs.length === 0 && (
            <div className="col-span-full py-20 text-center">
               <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Link2 className="w-10 h-10 text-gray-700" />
               </div>
               <h3 className="text-2xl font-black text-white mb-2 uppercase">No Linked Data</h3>
               <p className="text-gray-500 max-w-md mx-auto">Link your streaming accounts in the Discovery Engine to import your library.</p>
            </div>
          )}
        </motion.div>
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
