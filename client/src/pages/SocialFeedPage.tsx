import { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, Send, Sparkles, Clock, Users, Search, Plus } from 'lucide-react';
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
  
  const [content, setContent] = useState('');
  const [groupName, setGroupName] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const { user } = useAuthStore();

  const fetchData = async () => {
    try {
      if (activeTab === 'global') {
        const res = await api.get('/posts');
        setPosts(res.data);
      } else if (activeTab === 'following') {
        const res = await api.get('/social/following');
        setFollowing(res.data);
        const postsRes = await api.get('/posts');
        setPosts(postsRes.data.filter((p: any) => res.data.some((f: any) => f.user_id === p.user_id)));
      } else if (activeTab === 'groups') {
        const res = await api.get('/groups');
        setGroups(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.post('/posts', { content });
      setContent('');
      fetchData();
      toast.success('Post broadcasted to the Verse');
    } catch (err) {
      toast.error('Broadcast failed');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) return;
    try {
      await api.post('/groups', { name: groupName });
      setGroupName('');
      setShowCreateGroup(false);
      fetchData();
      toast.success('Group synchronized: ' + groupName);
    } catch (err) {
      toast.error('Group initialization failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      {/* Social Header */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] border border-white/5 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <MessageSquare className="w-48 h-48 text-blue-500 -rotate-12" />
        </div>
        <div className="relative z-10">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
             <Sparkles className="w-3 h-3" />
             <span>Neural Social Protocol v3.0</span>
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
      <div className="flex items-center justify-center p-1.5 bg-white/5 rounded-2xl border border-white/5 max-w-md mx-auto">
         {(['global', 'following', 'groups'] as SocialTab[]).map((tab) => (
           <button 
             key={tab}
             onClick={() => {
               setActiveTab(tab);
               setSelectedGroup(null);
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
              <>
                 {user && (
                    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[3rem] bg-[#0a0a0a] border border-white/5 p-8 shadow-2xl">
                       <form onSubmit={handleSubmit}>
                          <div className="flex items-start gap-6 mb-8">
                             <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-xl uppercase shadow-lg shadow-blue-500/20 shrink-0">
                                {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover rounded-2xl" alt="" /> : user.username?.[0]}
                             </div>
                             <textarea
                              className="flex-1 bg-transparent border-none p-0 text-xl font-medium text-white placeholder:text-gray-700 focus:outline-none focus:ring-0 resize-none pt-2"
                              placeholder="Broadcast to the Verse..."
                              rows={3}
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center justify-between pt-6 border-t border-white/5">
                             <button type="submit" disabled={!content.trim()} className="ml-auto px-10 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl disabled:opacity-20 flex items-center gap-3">
                                Broadcast <Send className="w-4 h-4" />
                             </button>
                          </div>
                       </form>
                    </motion.section>
                 )}

                 <div className="space-y-6">
                    {posts.map((post) => <PostCard key={post.id} post={post} />)}
                 </div>
              </>
            )}

            {activeTab === 'following' && (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-8">
                     <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-500" /> Active Connections
                     </h3>
                     <div className="space-y-3">
                        {following.length === 0 ? (
                          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest p-12 bg-white/5 rounded-[2rem] border border-white/5 text-center">No neural links established</p>
                        ) : (
                          following.map((f) => (
                            <div key={f.user_id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-xs uppercase shadow-lg shadow-blue-500/20">
                                  {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full object-cover rounded-xl" alt="" /> : f.username[0]}
                               </div>
                               <div>
                                  <h4 className="text-xs font-black text-white uppercase italic tracking-tighter">@{f.username}</h4>
                                  <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{f.display_name || 'Neural Entity'}</p>
                               </div>
                            </div>
                          ))
                        )}
                     </div>
                  </div>
                  <div className="space-y-8">
                     <h3 className="text-xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Search className="w-5 h-5 text-purple-500" /> Expand Network
                     </h3>
                     <UserSearch onFollowUpdate={fetchData} />
                  </div>
               </div>
            )}

            {activeTab === 'groups' && (
               <div className="space-y-8">
                  <div className="flex items-center justify-between">
                     <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
                        <Users className="w-6 h-6 text-purple-500" /> My Clusters
                     </h3>
                     <button 
                       onClick={() => setShowCreateGroup(!showCreateGroup)}
                       className="p-3 rounded-2xl bg-white text-black hover:scale-105 transition-all shadow-xl"
                     >
                        <Plus className="w-5 h-5" />
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
                            placeholder="Enter cluster name..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-purple-500/50"
                          />
                          <button type="submit" className="px-10 py-4 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-500 transition-all">
                             Initialize Cluster
                          </button>
                       </motion.form>
                     )}
                  </AnimatePresence>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     {groups.length === 0 ? (
                        <div className="col-span-full p-20 bg-white/5 rounded-[3rem] border border-white/5 text-center">
                           <Users className="w-12 h-12 text-gray-800 mx-auto mb-6" />
                           <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">No clusters detected in local space</p>
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
                               <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                                  <Users className="w-6 h-6" />
                               </div>
                               {g.role === 'admin' && (
                                 <div className="px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[6px] font-black text-blue-500 uppercase tracking-widest">Admin</div>
                               )}
                            </div>
                            <h4 className="text-lg font-black text-white uppercase italic tracking-tighter mb-1">{g.name}</h4>
                            <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-4">Cluster Status: {g.status}</p>
                            
                            {g.status === 'invited' && (
                              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                 <span className="text-[10px] font-black text-yellow-500 uppercase tracking-widest text-center px-4">Action Required in Notifications</span>
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
    </div>
  );
};

const PostCard = ({ post }: { post: any }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-[#0a0a0a] p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all shadow-lg group relative"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-blue-400 text-sm uppercase">
          {post.username?.[0] || 'U'}
        </div>
        <div>
          <h4 className="font-black text-white text-sm uppercase italic tracking-tighter leading-none mb-1 group-hover:text-blue-400 transition-colors">@{post.username}</h4>
          <div className="flex items-center gap-1.5 opacity-50">
             <Clock className="w-2.5 h-2.5 text-gray-500" />
             <p className="text-gray-500 text-[8px] font-black uppercase tracking-[0.15em]">{new Date(post.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
    <p className="text-gray-300 text-sm mb-4 leading-relaxed font-medium">{post.content}</p>
    <div className="flex items-center gap-6 text-gray-600 border-t border-white/5 pt-4">
       <button className="flex items-center gap-2 hover:text-pink-500 transition-all text-[8px] font-black uppercase tracking-widest group/btn">
          <Heart className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> 842
       </button>
       <button className="flex items-center gap-2 hover:text-blue-500 transition-all text-[8px] font-black uppercase tracking-widest group/btn">
          <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition-transform" /> 12
       </button>
       <button className="ml-auto flex items-center gap-2 hover:text-white transition-all text-[8px] font-black uppercase tracking-widest group/btn">
          <Share2 className="w-4 h-4" /> Propagate
       </button>
    </div>
  </motion.div>
);
