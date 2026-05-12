import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Music, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Play, 
  AlertCircle,
  Link2,
  TrendingUp,
  Activity,
  Shield,
  Radio,
  Share2,
  Lock,
  LayoutGrid,
  Map as MapIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';
import api from '../services/api';

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const linkedAccounts = useAuthStore((state) => state.linkedAccounts);
  const setSong = usePlayerStore((state) => state.setSong);
  
  const [greeting, setGreeting] = useState('');
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSpotifyLinked = linkedAccounts.some(a => a.platform === 'spotify');
  const isYoutubeLinked = linkedAccounts.some(a => a.platform === 'youtube');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    if (isSpotifyLinked || isYoutubeLinked) {
      fetchRecommendations();
    }
  }, [isSpotifyLinked, isYoutubeLinked]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    const spotifyToken = localStorage.getItem('spotify_token');
    const youtubeToken = localStorage.getItem('youtube_token');
    
    try {
      const requests = [];
      if (isSpotifyLinked && spotifyToken) {
        requests.push(api.get('/spotify/neural-insights', { headers: { 'x-spotify-token': spotifyToken } }));
      }
      if (isYoutubeLinked && youtubeToken) {
        requests.push(api.get('/youtube/neural-insights', { headers: { 'x-youtube-token': youtubeToken } }));
      }

      if (requests.length === 0) {
        setLoading(false);
        return;
      }

      const results = await Promise.allSettled(requests);
      let allRecs: any[] = [];
      
      results.forEach((res) => {
        if (res.status === 'fulfilled') {
          allRecs = [...allRecs, ...res.value.data];
        }
      });

      setRecommendations(allRecs.sort(() => Math.random() - 0.5).slice(0, 6));
    } catch (err: any) {
      console.error('Failed to fetch recommendations', err);
      setError('Neural pathway disruption. Check link status.');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Neural Journey', value: '4.8k Hz', icon: Activity, color: 'text-blue-500' },
    { label: 'Signal Nodes', value: linkedAccounts.length.toString(), icon: Radio, color: 'text-purple-500' },
    { label: 'Sync Status', value: 'Nominal', icon: Shield, color: 'text-green-500' },
  ];

  return (
    <div className="space-y-10 pb-20">
      {/* Top Layer: Greeting & Status Pulse */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-8 relative overflow-hidden rounded-[3rem] bg-[#0a0a0a] border border-white/5 p-12 md:p-16 shadow-2xl group"
        >
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform duration-1000 group-hover:scale-110">
            <Sparkles className="w-80 h-80 text-blue-500" />
          </div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-600/10 blur-[120px] rounded-full" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10">
              <Zap className="w-3 h-3 fill-current" />
              <span>Neural Interface: Active</span>
            </div>
            
            <h1 className="text-5xl md:text-[6rem] font-black text-white mb-6 tracking-tighter leading-none">
              {greeting}, <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 italic">
                {user?.username || 'Explorer'}
              </span>
            </h1>
            
            <p className="text-gray-500 text-lg max-w-xl mb-12 font-medium leading-relaxed">
              System diagnostics report stable connectivity. Your sonic profile has synchronized with <span className="text-white">{linkedAccounts.length} archives</span>.
            </p>

            <div className="flex gap-4">
               <Link to="/discover" className="px-8 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/5">
                  Begin Exploration
               </Link>
               <button onClick={fetchRecommendations} className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                  Sync Neural Grid
               </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 bg-[#0a0a0a] rounded-[3rem] border border-white/5 p-10 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent" />
          
          <div className="relative z-10">
             <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-8">System Analytics</p>
             <div className="space-y-8">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0">
                    <div className="flex items-center gap-4">
                       <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                       </div>
                       <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{stat.label}</span>
                    </div>
                    <span className="text-xl font-black text-white italic">{stat.value}</span>
                  </div>
                ))}
             </div>
          </div>

          <div className="relative z-10 pt-10">
             <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Neural Load</span>
                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">42%</span>
             </div>
             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '42%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
             </div>
          </div>
        </motion.div>
      </div>

      {/* Middle Layer: Bento Quick Access & Platform Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Link 
          to="/catalog"
          className="md:col-span-2 group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-800 p-8 shadow-2xl transition-all hover:scale-[1.02]"
        >
           <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
              <LayoutGrid className="w-32 h-32 text-white" />
           </div>
           <div className="relative z-10 flex flex-col h-full justify-between min-h-[180px]">
              <div>
                 <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white mb-4">Identity Core</span>
                 <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Synchronized <br /> Library.</h3>
              </div>
              <p className="text-indigo-100/60 text-sm font-medium">Access all archived signals from a single node.</p>
           </div>
        </Link>

        <Link 
          to="/map"
          className="group relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 p-8 shadow-2xl transition-all hover:border-blue-500/30"
        >
           <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
              <MapIcon className="w-6 h-6" />
           </div>
           <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-2">Sonic Map</h3>
           <p className="text-gray-500 text-xs font-medium leading-relaxed mb-6">Locate signal origins across the global verse.</p>
           <ArrowRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-all group-hover:translate-x-1" />
        </Link>

        <div className="bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 p-8 shadow-2xl flex flex-col justify-between group">
           <div>
              <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-6">Archive Status</p>
              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full ${isSpotifyLinked ? 'bg-[#1DB954]' : 'bg-gray-800'}`} />
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Spotify</span>
                    </div>
                    {isSpotifyLinked ? <Shield className="w-3 h-3 text-[#1DB954]" /> : <Lock className="w-3 h-3 text-gray-800" />}
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className={`w-2 h-2 rounded-full ${isYoutubeLinked ? 'bg-[#FF0000]' : 'bg-gray-800'}`} />
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">YouTube</span>
                    </div>
                    {isYoutubeLinked ? <Shield className="w-3 h-3 text-[#FF0000]" /> : <Lock className="w-3 h-3 text-gray-800" />}
                 </div>
              </div>
           </div>
           <Link to="/settings" className="text-[9px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors flex items-center gap-2">
              Configure Archives <ArrowRight className="w-3 h-3" />
           </Link>
        </div>
      </div>

      {/* Bottom Layer: Neural Insights (Detailed Grid) */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
               <Sparkles className="w-6 h-6 text-purple-500" />
            </div>
            <div>
               <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Neural Insights</h2>
               <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Algorithmic Resonances detected from your archives</p>
            </div>
          </div>
          <button onClick={fetchRecommendations} className="p-3 rounded-full bg-white/5 border border-white/5 text-gray-500 hover:text-white transition-all">
             <TrendingUp className="w-5 h-5" />
          </button>
        </div>
        
        {(!isSpotifyLinked && !isYoutubeLinked) ? (
          <div className="bg-[#0a0a0a] p-20 rounded-[4rem] border border-white/5 flex flex-col items-center text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(59,130,246,0.05)_0%,_transparent_70%)]" />
            <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mb-10 border border-blue-500/20 relative z-10 shadow-2xl shadow-blue-500/10">
              <Link2 className="w-12 h-12 text-blue-500" />
            </div>
            <h3 className="text-4xl font-black text-white uppercase italic mb-4 tracking-tighter relative z-10">Neural Grid Offline</h3>
            <p className="text-gray-500 text-lg max-w-md mb-12 font-medium leading-relaxed relative z-10">
              Establish synchronization with your external streaming archives to allow the neural engine to map your audio identity.
            </p>
            <div className="flex gap-6 relative z-10">
              <Link 
                to="/sync/spotify"
                className="px-12 py-5 bg-[#1DB954] text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-[#1DB954]/20 flex items-center gap-3"
              >
                <Music className="w-4 h-4 fill-current" /> Sync Spotify
              </Link>
              <Link 
                to="/sync/youtube"
                className="px-12 py-5 bg-[#FF0000] text-white rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-[#FF0000]/20 flex items-center gap-3"
              >
                <Play className="w-4 h-4 fill-current" /> Sync YouTube
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <div key={num} className="bg-[#0a0a0a] aspect-square rounded-[2rem] border border-white/5 flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full border-4 border-white/5 border-t-blue-500 animate-spin" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/5 p-16 rounded-[3.5rem] border border-red-500/10 flex flex-col items-center text-center">
             <AlertCircle className="w-16 h-16 text-red-500 mb-8 opacity-30" />
             <p className="text-red-400 text-sm font-black uppercase tracking-[0.2em] mb-10">{error}</p>
             <button 
               onClick={fetchRecommendations}
               className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all"
             >
               Retry Protocol
             </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {recommendations.map((track, idx) => (
              <motion.div 
                key={track.id} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -6 }}
                className="group flex flex-col bg-[#0a0a0a] p-3 rounded-[1.5rem] border border-white/5 hover:border-white/20 transition-all shadow-lg relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-[1rem] shadow-xl">
                  <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button 
                      onClick={() => setSong(track, recommendations)}
                      className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                    >
                      <Play className="w-6 h-6 fill-current ml-0.5" />
                    </button>
                  </div>
                </div>
                <div className="px-1 relative z-10">
                  <h4 className="font-black text-white truncate text-xs tracking-tighter mb-0.5 uppercase italic group-hover:text-blue-400 transition-colors">{track.title}</h4>
                  <p className="text-gray-600 text-[8px] font-black uppercase tracking-[0.2em] truncate">{track.artist_name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Footer Info Layer */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5 opacity-30 px-6">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Neural Sync established</span>
            </div>
            <div className="flex items-center gap-2">
               <Share2 className="w-3 h-3 text-gray-500" />
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500">Node Public</span>
            </div>
         </div>
         <p className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-600">SonicVerse protocol v2.4.0-Stable</p>
      </div>
    </div>
  );
};
