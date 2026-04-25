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
  Plus,
  MessageSquare,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { usePlayerStore } from '../store/playerStore';

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const setSong = usePlayerStore((state) => state.setSong);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

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

  // Mock data for "Recently Played" or "Recommended"
  const recommendations = [
    { id: '1', title: 'Midnight City', artist_name: 'M83', cover_url: 'https://i.scdn.co/image/ab67616d0000b27387435c6e26214430e3223005', source: 'spotify' },
    { id: '2', title: 'Starboy', artist_name: 'The Weeknd', cover_url: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452', source: 'spotify' },
    { id: '3', title: 'Blinding Lights', artist_name: 'The Weeknd', cover_url: 'https://i.scdn.co/image/ab67616d0000b273c5649addda9f0dad0c028a01', source: 'spotify' },
    { id: '4', title: 'Levitating', artist_name: 'Dua Lipa', cover_url: 'https://i.scdn.co/image/ab67616d0000b273bdad1ca9631694f8ba16886c', source: 'spotify' },
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
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-500" /> Neural Insights
            </h2>
            <Link to="/discover" className="text-xs font-black text-gray-500 hover:text-white uppercase tracking-widest transition-colors">View All</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recommendations.map((track) => (
              <div key={track.id} className="group flex items-center gap-4 bg-gray-900/40 p-4 rounded-3xl border border-gray-800/50 hover:bg-gray-800/60 transition-all">
                <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-2xl">
                  <img src={track.cover_url} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <button 
                    onClick={() => setSong(track as any)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Play className="w-8 h-8 text-white fill-current" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-white truncate">{track.title}</h4>
                  <p className="text-gray-500 text-xs font-bold uppercase truncate">{track.artist_name}</p>
                </div>
                <button className="p-2 rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-500" /> Community
          </h2>
          <div className="bg-gray-900/40 rounded-[2.5rem] border border-gray-800/50 p-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">
                    <span className="text-blue-400">@explorer_{i}</span> shared a new story
                  </p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
            ))}
            <Link 
              to="/feed" 
              className="block w-full py-3 bg-gray-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 transition-all text-center"
            >
              Open Social Feed
            </Link>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-6 text-white overflow-hidden relative group">
            <Award className="absolute -bottom-4 -right-4 w-24 h-24 opacity-20 rotate-12 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-black uppercase italic tracking-tighter mb-2">Weekly Challenge</h3>
            <p className="text-xs text-blue-100 mb-4 leading-relaxed">Discover 5 artists from a genre you've never explored before.</p>
            <div className="w-full bg-blue-900/50 h-2 rounded-full mb-2 overflow-hidden">
               <div className="bg-white h-full w-2/5" />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest">2 / 5 Completed</p>
          </div>
        </div>
      </section>
    </div>
  );
};
