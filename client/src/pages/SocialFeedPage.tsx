import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Heart, Share2, Sparkles, Clock, Users, Search, Plus, Radio, ArrowLeft, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { UserSearch } from '../components/UserSearch';
import { GroupChat } from '../components/GroupChat';
import toast from 'react-hot-toast';

type SocialTab = 'global' | 'following' | 'groups';

export const SocialFeedPage = () => {
  const [activeTab, setActiveTab] = useState<SocialTab>('global');
  const [posts, setPosts] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [content, setContent] = useState('');
  const [groupName, setGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const createGroupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createGroupRef.current && !createGroupRef.current.contains(event.target as Node)) {
        setShowCreateGroup(false);
      }
    };

    if (showCreateGroup) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCreateGroup]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const { user } = useAuthStore();

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'global') {
        const res = await api.get('/posts');
        setPosts(res.data);
      } else if (activeTab === 'following') {
        const res = await api.get('/social/following');
        setFollowing(res.data);
      } else if (activeTab === 'groups') {
        const res = await api.get('/groups');
        setGroups(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  useEffect(() => {
    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer) return;
      const rect = footer.getBoundingClientRect();
      // Hide button when footer top comes into view
      setIsFooterVisible(rect.top < window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.post('/posts', { content });
      setContent('');
      setIsBroadcastOpen(false);
      fetchData();
      toast.success('Post broadcasted to the Verse');
    } catch (err) {
      toast.error('Broadcast failed');
    }
  };

  const handleUserClick = async (followedUser: any) => {
    setSelectedUser(followedUser);
    setPosts([]); // Immediate feedback
    setFilterLoading(true);
    try {
      await api.post('/social/update-seen', { followingId: followedUser.user_id });
      const res = await api.get(`/posts?userId=${followedUser.user_id}`);
      setPosts(res.data);
      const followingRes = await api.get('/social/following');
      setFollowing(followingRes.data);
    } catch (err) {
      toast.error('Failed to sync node signals');
    } finally {
      setFilterLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post('/groups', { name: groupName });
      setGroups([...groups, { ...res.data, role: 'admin', status: 'accepted' }]);
      setGroupName('');
      setShowCreateGroup(false);
      toast.success('Cluster initialized');
    } catch (err) {
      toast.error('Failed to initialize cluster');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-32 relative">
      {/* Social Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <MessageSquare className="w-48 h-48 text-blue-500 -rotate-12" />
        </div>
        <div className="relative z-10">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
             <Sparkles className="w-3 h-3" />
             <span>Neural Social Protocol v4.0</span>
           </div>
           <h1 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-4">
             {activeTab === 'global' ? 'Global Verse.' : activeTab === 'following' ? 'Neural Connections.' : 'Group Clusters.'}
           </h1>
           <p className="text-gray-400 text-lg max-w-xl font-medium leading-relaxed">
             {activeTab === 'global' && 'Synchronize with the collective global stream of consciousness.'}
             {activeTab === 'following' && 'Monitor specifically tuned signals from your established connections.'}
             {activeTab === 'groups' && 'Private multi-node communication channels for hyper-focused jam sessions.'}
           </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="flex items-center justify-center p-1.5 bg-white/5 rounded-2xl border border-white/5 max-w-md mx-auto sticky top-24 z-40 backdrop-blur-xl">
         {(['global', 'following', 'groups'] as SocialTab[]).map((tab) => (
           <button 
             key={tab}
             onClick={() => {
               setActiveTab(tab);
               setSelectedGroup(null);
               setSelectedUser(null);
             }}
             className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
               activeTab === tab 
                 ? 'bg-white text-black shadow-xl' 
                 : 'text-gray-500 hover:text-white'
             }`}
           >
             {tab}
           </button>
         ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'groups' && selectedGroup ? (
           <motion.div key="chat" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <GroupChat group={selectedGroup} onBack={() => setSelectedGroup(null)} />
           </motion.div>
        ) : (
          <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
            
            {activeTab === 'global' && (
              <div className="space-y-6">
                {posts.map((post) => <PostCard key={post.id} post={post} />)}
              </div>
            )}

            {activeTab === 'following' && (
               <div className="space-y-12">
                  {selectedUser ? (
                    <div className="space-y-8">
                       <button 
                         onClick={() => setSelectedUser(null)}
                         className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] hover:text-white transition-colors"
                       >
                         <ArrowLeft className="w-4 h-4" /> Back to connections
                       </button>
                       <div className="flex items-center gap-4 p-6 bg-white/5 rounded-[2rem] border border-white/5">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-2xl shadow-xl">
                             {selectedUser.avatar_url ? <img src={selectedUser.avatar_url} className="w-full h-full object-cover rounded-2xl" alt="" /> : selectedUser.username[0]}
                          </div>
                          <div>
                             <h3 className="text-2xl font-black text-white italic tracking-tighter">@{selectedUser.username}</h3>
                             <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{selectedUser.display_name || 'Neural Entity'}</p>
                          </div>
                       </div>
                       <div className="space-y-6">
                          {filterLoading ? (
                             <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                                <p className="text-[8px] font-black text-gray-600 uppercase tracking-[0.4em] animate-pulse">Filtering Signal...</p>
                             </div>
                          ) : posts.length === 0 ? (
                            <p className="text-center text-gray-600 py-12 font-black uppercase text-[10px] tracking-widest bg-white/5 rounded-3xl border border-white/5">No signals broadcasted from this node</p>
                          ) : posts.map(post => <PostCard key={post.id} post={post} />)}
                       </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-8">
                          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                             <Users className="w-5 h-5 text-blue-500" /> Active Links
                          </h3>
                          <div className="space-y-3">
                             {following.length === 0 ? (
                               <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest p-12 bg-white/5 rounded-[2rem] border border-white/5 text-center">No neural links established</p>
                             ) : (
                               following.map((f) => (
                                 <div 
                                   key={f.user_id} 
                                   onClick={() => handleUserClick(f)}
                                   className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/20 transition-all cursor-pointer group relative"
                                 >
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-blue-500/20">
                                          {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full object-cover rounded-xl" alt="" /> : f.username[0]}
                                       </div>
                                       <div>
                                          <h4 className="text-xs font-black text-white italic tracking-tighter">@{f.username}</h4>
                                          <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{f.display_name || 'Neural Entity'}</p>
                                       </div>
                                    </div>
                                    {f.has_new_posts && (
                                      <div className="flex items-center gap-2">
                                         <span className="text-[6px] font-black text-blue-500 uppercase tracking-widest animate-pulse">New Signal</span>
                                         <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                                      </div>
                                    )}
                                 </div>
                               ))
                             )}
                          </div>
                       </div>
                       <div className="space-y-8">
                          <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                             <Search className="w-5 h-5 text-purple-500" /> Link Expansion
                          </h3>
                          <UserSearch onFollowUpdate={fetchData} />
                       </div>
                    </div>
                  )}
               </div>
            )}

            {activeTab === 'groups' && (
               <div className="space-y-8" ref={createGroupRef}>
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Users className="w-6 h-6 text-purple-500" /> Private Clusters
                     </h3>
                     <button 
                       onClick={() => setShowCreateGroup(!showCreateGroup)}
                       className={`p-3 rounded-2xl transition-all shadow-xl ${showCreateGroup ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-white text-black hover:scale-105'}`}
                     >
                        {showCreateGroup ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                     </button>
                  </div>

                  <AnimatePresence>
                     {showCreateGroup && (
                       <motion.form 
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                         exit={{ opacity: 0, height: 0 }}
                         onSubmit={handleCreateGroup}
                         className="p-8 bg-purple-600/10 border border-purple-500/20 rounded-[2.5rem] flex flex-col md:flex-row gap-4 overflow-hidden"
                       >
                          <input 
                            type="text" 
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Enter cluster identity..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-purple-500/50"
                          />
                          <button type="submit" className="px-10 py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all">
                             Initialize
                          </button>
                       </motion.form>
                     )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     {groups.length === 0 ? (
                        <div className="col-span-full p-20 bg-white/5 rounded-[3rem] border border-white/5 text-center">
                           <Users className="w-12 h-12 text-gray-800 mx-auto mb-6" />
                           <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">No private clusters established</p>
                        </div>
                     ) : (
                       groups.map((g) => (
                         <div 
                           key={g.id} 
                           onClick={() => g.status === 'accepted' ? setSelectedGroup(g) : null}
                           className={`p-6 rounded-[2rem] border transition-all cursor-pointer group relative overflow-hidden ${
                             g.status === 'invited' 
                               ? 'bg-yellow-500/5 border-yellow-500/20' 
                               : 'bg-white/5 border-white/5 hover:border-white/20'
                           }`}
                         >
                            <div className="flex items-center justify-between mb-4">
                               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 overflow-hidden">
                                  {g.image_url ? (
                                    <img src={g.image_url} className="w-full h-full object-cover" alt="" />
                                  ) : (
                                    <Users className="w-6 h-6" />
                                  )}
                               </div>
                               {g.role === 'admin' && (
                                 <div className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[6px] font-black text-blue-500 uppercase tracking-widest">Admin</div>
                               )}
                            </div>
                            <h4 className="text-lg font-black text-white italic tracking-tighter mb-1">{g.name}</h4>
                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-4">Link Status: {g.status}</p>
                            
                            {g.status === 'invited' && (
                              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest text-center px-6">Action Required in Alerts Hub</span>
                              </div>
                            )}
                         </div>
                       ))
                     )}
                  </div>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Broadcast Bar - Global Only */}
      {activeTab === 'global' && user && (
         <motion.div 
           initial={{ opacity: 1, y: 0 }}
           animate={{ 
             opacity: isFooterVisible ? 0 : 1,
             y: isFooterVisible ? 100 : 0,
             pointerEvents: isFooterVisible ? 'none' : 'auto'
           }}
           transition={{ duration: 0.4, ease: 'circOut' }}
           className="fixed bottom-32 right-8 z-[5000] flex items-end gap-4 pointer-events-none"
         >
            <AnimatePresence>
               {isBroadcastOpen && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0, x: 20 }}
                    animate={{ width: 'min(calc(100vw - 120px), 450px)', opacity: 1, x: 0 }}
                    exit={{ width: 0, opacity: 0, x: 20 }}
                    className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto overflow-hidden relative"
                  >
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-purple-600 opacity-50" />
                     <textarea
                       value={content}
                       onChange={(e) => {
                          setContent(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
                       }}
                       onKeyDown={handleKeyDown}
                       placeholder="Broadcast signal..."
                       rows={1}
                       autoFocus
                       className="w-full bg-transparent border-none p-2 text-base font-medium text-white placeholder:text-gray-700 focus:outline-none focus:ring-0 resize-none custom-scrollbar"
                     />
                     {content.trim() && (
                        <div className="flex justify-end mt-2">
                           <button 
                             onClick={() => handleSubmit()}
                             className="px-8 py-2.5 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                           >
                             Deploy
                           </button>
                        </div>
                     )}
                  </motion.div>
               )}
            </AnimatePresence>
            <button 
              onClick={() => {
                setIsBroadcastOpen(!isBroadcastOpen);
                if (isBroadcastOpen) setContent('');
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.6)] hover:scale-110 transition-all active:scale-95 group pointer-events-auto relative z-10 ${isBroadcastOpen ? 'bg-white text-black' : 'bg-blue-600 text-white'}`}
            >
               {isBroadcastOpen ? <X className="w-7 h-7" /> : <Radio className="w-7 h-7 group-hover:animate-pulse" />}
            </button>
         </motion.div>
      )}

      {loading && !posts.length && (
         <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em] animate-pulse">Syncing Neural Grid...</p>
         </div>
      )}
    </div>
  );
};

const PostCard = ({ post }: { post: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#0a0a0a] p-6 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all shadow-lg group relative"
  >
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-blue-400 text-lg overflow-hidden shadow-xl group-hover:scale-105 transition-transform">
          {post.avatar_url ? <img src={post.avatar_url} className="w-full h-full object-cover" alt="" /> : (post.username?.[0] || 'U')}
        </div>
        <div>
          <h4 className="font-black text-white text-base italic tracking-tighter leading-none mb-1 group-hover:text-blue-400 transition-colors">@{post.username}</h4>
          <div className="flex items-center gap-2 opacity-50">
             <Clock className="w-3 h-3 text-gray-500" />
             <p className="text-gray-500 text-[8px] font-black uppercase tracking-[0.2em]">{new Date(post.created_at).toLocaleDateString()} // {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
         <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
         <span className="text-[7px] font-black text-gray-700 uppercase tracking-widest">Active Node</span>
      </div>
    </div>
    <p className="text-gray-300 text-sm mb-6 leading-relaxed font-medium px-1 whitespace-pre-wrap">{post.content}</p>
    <div className="flex items-center gap-8 text-gray-600 border-t border-white/5 pt-5 px-1">
       <button className="flex items-center gap-2 hover:text-pink-500 transition-all text-[8px] font-black uppercase tracking-widest group/btn">
          <Heart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> 1.2k
       </button>
       <button className="flex items-center gap-2 hover:text-blue-500 transition-all text-[8px] font-black uppercase tracking-widest group/btn">
          <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> 48
       </button>
       <button className="ml-auto flex items-center gap-2 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest group/btn">
          <Share2 className="w-4 h-4" /> Propagate
       </button>
    </div>
  </motion.div>
);
