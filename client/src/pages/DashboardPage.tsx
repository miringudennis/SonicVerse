import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  LayoutGrid, 
  Map as MapIcon, 
  Music, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Play, 
  Clock, 
  MessageSquare,
  Loader2,
  AlertCircle,
  Link2
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

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    if (isSpotifyLinked) {
      fetchRecommendations();
    }
  }, [isSpotifyLinked]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('spotify_token');
    
    if (!token) {
      setError('Spotify token missing');
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/spotify/recommendations', {
        headers: { 'x-spotify-token': token }
      });
      setRecommendations(res.data.slice(0, 4)); // Only show top 4 on dashboard
    } catch (err: any) {
      console.error('Failed to fetch recommendations', err);
      const details = err.response?.data?.details;
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Spotify session expired. Please re-connect.');
      } else if (details) {
        setError(`Neural Engine: ${details}`);
      } else {
        setError('Failed to load neural insights. Check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Sonic Journey', value: '1,240m', icon: Clock, color: 'text-blue-500' },
    { label: 'Frequencies', value: '84', icon: Zap, color: 'text-purple-500' },
    { label: 'Connections', value: '12', icon: MessageSquare, color: 'text-pink-500' },
  ];

  const quickActions = [
    { title: 'Discovery', desc: 'Find new sonic realms', icon: Compass, link: '/discover', color: 'bg-blue-600' },
    { title: 'Catalog', desc: 'Browse your library', icon: LayoutGrid, link: '/catalog', color: 'bg-purple-600' },
    { title: 'Sonic Map', desc: 'Explore global sounds', icon: MapIcon, link: '/map', color: 'bg-pink-600' },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Welcome Header */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-8 md:p-12"
      >
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Music className="w-64 h-64 text-blue-500 -rotate-12" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
               Explorer Rank: Novice
             </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">{user?.username || 'Sonic Explorer'}</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mb-8 leading-relaxed">
            Your sonic signature is evolving. You've explored 4 new genres this week and connected with 3 other explorers.
          </p>
          
          <div className="flex flex-wrap gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-gray-800/50 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-black text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Quick Actions */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" /> Quick Access
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action, i) => (
            <Link 
              key={i} 
              to={action.link}
              className="group relative bg-gray-900/40 p-8 rounded-[2.5rem] border border-gray-800/50 backdrop-blur-xl hover:border-white/10 transition-all overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${action.color} opacity-5 blur-[60px] rounded-full group-hover:opacity-20 transition-opacity`} />
              <div className={`w-14 h-14 rounded-2xl ${action.color}/20 flex items-center justify-center mb-6 border border-white/5`}>
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-tighter">{action.title}</h3>
              <p className="text-gray-500 text-xs font-medium leading-relaxed mb-6">{action.desc}</p>
              <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Explore Now <ArrowRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Neural Insights / Recommendations */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" /> Neural Insights
          </h2>
          <Link to="/discover" className="text-xs font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">View All</Link>
        </div>
        
        {!isSpotifyLinked ? (
          <div className="bg-gray-900/40 p-12 rounded-[2.5rem] border border-gray-800/50 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-600/10 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20">
              <Link2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-black text-white uppercase italic mb-2 tracking-tighter">Spotify Not Connected</h3>
            <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
              Connect your Spotify account to enable our neural engine to analyze your sonic DNA and suggest new frequencies.
            </p>
            <Link 
              to="/sync/spotify"
              className="px-8 py-3 bg-green-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg shadow-green-900/20"
            >
              Connect Spotify
            </Link>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-900/40 p-4 rounded-3xl border border-gray-800/50 h-32 animate-pulse flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-gray-700 animate-spin" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/5 p-8 rounded-[2.5rem] border border-red-500/20 flex flex-col items-center text-center">
             <AlertCircle className="w-8 h-8 text-red-500 mb-4 opacity-50" />
             <p className="text-red-400 text-xs font-black uppercase tracking-widest mb-6">{error}</p>
             <div className="flex gap-4">
                <button 
                  onClick={fetchRecommendations}
                  className="px-6 py-2 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
                >
                  Retry
                </button>
                {(error.includes('expired') || error.includes('token')) && (
                  <Link 
                    to="/sync/spotify"
                    className="px-6 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-500 transition-all shadow-lg shadow-green-900/20"
                  >
                    Re-connect
                  </Link>
                )}
             </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((track) => (
              <div key={track.id} className="group flex flex-col bg-gray-900/40 p-4 rounded-3xl border border-gray-800/50 hover:bg-gray-800/60 transition-all">
                <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-2xl">
                  <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <button 
                    onClick={() => setSong(track)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                  </button>
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-white truncate text-sm">{track.title}</h4>
                  <p className="text-gray-500 text-[10px] font-bold uppercase truncate">{track.artist_name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
