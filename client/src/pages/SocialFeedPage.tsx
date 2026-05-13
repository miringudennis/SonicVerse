import { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, Music, Send, Zap, Sparkles, TrendingUp, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export const SocialFeedPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.post('/posts', { content });
      setContent('');
      fetchPosts();
    } catch (err) {
      console.error('Failed to create post', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Feed Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <MessageSquare className="w-48 h-48 text-blue-500 -rotate-12" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
           <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                <Sparkles className="w-3 h-3" />
                <span>Global Activity Stream</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                Social <br /> Verse.
              </h1>
              <p className="text-gray-400 text-base max-w-xl font-medium leading-relaxed">
                Connect with the collective. Share your neural discoveries and sonic experiences with the world.
              </p>
           </div>
           <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-1 text-center md:text-right">Global Nodes</span>
                 <span className="text-2xl font-black text-white uppercase italic tracking-tighter text-center md:text-right">4.2k Online</span>
              </div>
              <div className="h-px w-full bg-white/10" />
              <div className="flex flex-col">
                 <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-1 text-center md:text-right">Active Jams</span>
                 <span className="text-2xl font-black text-white uppercase italic tracking-tighter text-center md:text-right">12 Nodes</span>
              </div>
           </div>
        </div>
      </section>

      {/* Post Creation Console */}
      {user && (
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[3rem] bg-[#0a0a0a] border border-white/5 p-8 shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-30" />
          <form onSubmit={handleSubmit}>
            <div className="flex items-start gap-6 mb-8">
               <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-xl uppercase shadow-lg shadow-blue-500/20 shrink-0">
                 {user.username?.[0] || 'U'}
               </div>
               <textarea
                className="flex-1 bg-transparent border-none p-0 text-xl font-medium text-white placeholder:text-gray-700 focus:outline-none focus:ring-0 resize-none pt-2"
                placeholder="Synchronize a message to the Verse..."
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-white/5">
              <div className="flex gap-4">
                <button type="button" className="p-3 rounded-xl bg-white/5 border border-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group">
                    <Music className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
                    <span className="hidden sm:inline">Attach Signal</span>
                </button>
                <button type="button" className="p-3 rounded-xl bg-white/5 border border-white/5 text-gray-500 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest group">
                    <Zap className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="hidden sm:inline">Boost</span>
                </button>
              </div>
              <button 
                type="submit" 
                disabled={!content.trim()}
                className="px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-white/5 disabled:opacity-20 flex items-center gap-3 group"
              >
                Broadcast 
                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </form>
        </motion.section>
      )}

      {/* Feed List */}
      <div className="space-y-10">
        <div className="flex items-center justify-between px-6">
           <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
             <TrendingUp className="w-6 h-6 text-blue-500" /> Live Feed
           </h2>
           <div className="flex gap-6">
              <button className="text-[10px] font-black text-white border-b-2 border-blue-500 pb-1 uppercase tracking-widest">Global</button>
              <button className="text-[10px] font-black text-gray-600 hover:text-white pb-1 uppercase tracking-widest transition-colors">Following</button>
              <button className="text-[10px] font-black text-gray-600 hover:text-white pb-1 uppercase tracking-widest transition-colors">Local</button>
           </div>
        </div>

        <AnimatePresence mode="popLayout">
          {posts.map((post, idx) => (
            <motion.div 
            key={post.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-[#0a0a0a] p-4 rounded-[1.25rem] border border-white/5 hover:border-white/10 transition-all shadow-lg group relative overflow-hidden"
            >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none">
               <Sparkles className="w-10 h-10 text-blue-500" />
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-blue-400 text-sm uppercase group-hover:scale-110 transition-transform">
                  {post.username?.[0] || 'U'}
                </div>
                <div>
                  <h4 className="font-black text-white text-sm uppercase italic tracking-tighter leading-none mb-0.5 group-hover:text-blue-400 transition-colors">{post.username}</h4>
                  <div className="flex items-center gap-1.5 opacity-50">
                     <Clock className="w-2 h-2 text-gray-500" />
                     <p className="text-gray-500 text-[7px] font-black uppercase tracking-[0.15em]">{new Date(post.created_at).toLocaleDateString()} // {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                 <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                 <span className="text-[6px] font-black text-gray-600 uppercase tracking-widest">Verified</span>
              </div>
            </div>

            <p className="text-gray-300 text-xs mb-3 leading-relaxed font-medium px-1">{post.content}</p>

            {post.song_title && (
                <div className="bg-white/5 p-2 rounded-[0.75rem] border border-white/5 mb-3 flex items-center justify-between group/song hover:bg-white/10 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-xl">
                         <img src={post.song_cover || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop'} alt={post.song_title} className="w-full h-full object-cover group-hover/song:scale-110 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/song:opacity-100 transition-opacity">
                            <Music className="w-3 h-3 text-white" />
                         </div>
                      </div>
                      <div>
                          <h5 className="font-black text-white text-xs uppercase italic tracking-tighter leading-none mb-0.5">{post.song_title}</h5>
                          <p className="text-gray-500 text-[7px] font-black uppercase tracking-[0.15em]">Signal Synchronized</p>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center text-gray-500 group-hover/song:text-white group-hover/song:border-white/30 transition-all">
                       <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4 text-gray-600 border-t border-white/5 pt-3 px-1">
              <button className="flex items-center gap-1.5 hover:text-pink-500 transition-all text-[7px] font-black uppercase tracking-widest group/btn">
                <Heart className="w-3 h-3 group-hover/btn:fill-current group-hover/btn:scale-110 transition-transform" /> 
                <span>842</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-blue-500 transition-all text-[7px] font-black uppercase tracking-widest group/btn">
                <MessageSquare className="w-3 h-3 group-hover/btn:scale-110 transition-transform" /> 
                <span>12</span>
              </button>
              <div className="flex-1" />
              <button className="flex items-center gap-1.5 hover:text-white transition-all text-[7px] font-black uppercase tracking-widest group/btn">
                <Share2 className="w-3 h-3 group-hover/btn:rotate-12 transition-transform" /> 
                <span className="hidden sm:inline">Propagate</span>
              </button>
            </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
           <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 rounded-full border-b-4 border-blue-500 animate-spin" />
              <p className="mt-8 text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] animate-pulse">Retrieving Verse Activity...</p>
           </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="py-32 flex flex-col items-center text-center bg-[#0a0a0a] rounded-[3.5rem] border border-white/5 p-12">
             <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-8">
                <Zap className="w-10 h-10 text-blue-500" />
             </div>
             <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-4">Feed Offline</h3>
             <p className="text-gray-500 text-lg font-medium leading-relaxed">No signals detected in this sector of the Verse. Be the first to broadcast.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Play = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 3L19 12L5 21V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
