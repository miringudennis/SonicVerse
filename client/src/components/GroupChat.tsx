import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Shield, Info, X, Image, Video, FileText, Trash2, Edit2, UserMinus, ExternalLink, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

interface GroupChatProps {
  group: any;
  onBack: () => void;
}

export const GroupChat = ({ group: initialGroup, onBack }: GroupChatProps) => {
  const [group, setGroup] = useState(initialGroup);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteQuery, setInviteQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [showMediaSelection, setShowMediaSelection] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(group.name);
  
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get(`/groups/${group.id}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/groups/${group.id}/members`);
      setMembers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 4000);
    return () => clearInterval(interval);
  }, [group.id]);

  useEffect(() => {
    if (showDetails) fetchMembers();
  }, [showDetails]);

  const handleSend = async (type: 'text' | 'image' | 'video' | 'document' = 'text', url?: string) => {
    if (!content.trim() && !url) return;
    try {
      const res = await api.post('/groups/messages', { 
        groupId: group.id, 
        content: type === 'text' ? content : `Shared a ${type}`,
        mediaUrl: url,
        mediaType: type
      });
      setMessages([...messages, { ...res.data, username: user?.username }]);
      if (type === 'text') setContent('');
      setShowMediaSelection(false);
    } catch (err) {
      toast.error('Transmission failure');
    }
  };

  const handleRename = async () => {
    try {
      const res = await api.put('/groups/rename', { groupId: group.id, name: newName });
      setGroup({ ...group, name: res.data.name });
      setIsEditingName(false);
      toast.success('Cluster renamed');
    } catch (err) {
      toast.error('Rename failed');
    }
  };

  const handleDeleteGroup = async () => {
    if (!confirm('Destroy this cluster permanently?')) return;
    try {
      await api.delete(`/groups/${group.id}`);
      toast.success('Cluster terminated');
      onBack();
    } catch (err) {
      toast.error('Termination failure');
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    try {
      await api.post('/groups/remove-member', { groupId: group.id, targetUserId });
      setMembers(members.filter(m => m.user_id !== targetUserId));
      toast.success('Member removed from cluster');
    } catch (err) {
      toast.error('Eviction failed');
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/groups/invite', { groupId: group.id, username: inviteQuery });
      toast.success(`Invite dispatched to @${inviteQuery}`);
      setInviteQuery('');
      setShowInvite(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invite protocol failed');
    }
  };

  const renderContent = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-1">
            {part} <ExternalLink className="w-2 h-2" />
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[750px] bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
       {/* Header */}
       <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div onClick={() => setShowDetails(true)} className="cursor-pointer group">
                <h3 className="text-sm font-black text-white italic tracking-tighter flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                   {group.name}
                   {group.role === 'admin' && <Shield className="w-3 h-3 text-blue-500" />}
                </h3>
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Active Cluster // Tap for info</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setShowDetails(true)}
               className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-all"
             >
                <Info className="w-4 h-4" />
             </button>
          </div>
       </div>

       {/* Main Chat Area */}
       <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar flex flex-col">
          {messages.map((m, i) => {
            const isMe = m.sender_id === user?.id;
            return (
              <div key={m.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                 <div className="flex items-center gap-2 mb-1.5 px-1">
                    {!isMe && <span className="text-[8px] font-black text-blue-500 uppercase">@{m.username}</span>}
                    <span className="text-[7px] text-gray-600 font-black uppercase">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
                 
                 <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-[0_4px_15px_rgba(37,99,235,0.3)]' 
                      : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'
                 }`}>
                    {m.media_type === 'image' && (
                       <img src={m.media_url} className="rounded-2xl mb-2 max-w-full border border-white/10" alt="" />
                    )}
                    {m.media_type === 'video' && (
                       <video src={m.media_url} controls className="rounded-2xl mb-2 max-w-full border border-white/10" />
                    )}
                    <div className="font-medium">{renderContent(m.content)}</div>
                 </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-4" />
       </div>

       {/* Input Area */}
       <div className="p-6 bg-white/5 border-t border-white/5 backdrop-blur-md relative">
          <AnimatePresence>
             {showMediaSelection && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full left-6 mb-4 bg-[#111] border border-white/10 p-4 rounded-[2rem] shadow-2xl flex gap-6 z-50"
                >
                   <button onClick={() => handleSend('image', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop')} className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-all">
                         <Image className="w-5 h-5" />
                      </div>
                      <span className="text-[8px] font-black uppercase text-gray-500">Image</span>
                   </button>
                   <button onClick={() => handleSend('video', '#')} className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-all">
                         <Video className="w-5 h-5" />
                      </div>
                      <span className="text-[8px] font-black uppercase text-gray-500">Video</span>
                   </button>
                   <button onClick={() => handleSend('document', '#')} className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-all">
                         <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[8px] font-black uppercase text-gray-500">Doc</span>
                   </button>
                </motion.div>
             )}
          </AnimatePresence>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-4 items-center">
             <button 
               type="button" 
               onClick={() => setShowMediaSelection(!showMediaSelection)}
               className={`p-3.5 rounded-2xl border transition-all ${showMediaSelection ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
             >
                <Plus className={`w-5 h-5 transition-transform duration-300 ${showMediaSelection ? 'rotate-45' : ''}`} />
             </button>
             <div className="flex-1 relative">
                <input 
                  type="text" 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Sync transmission..."
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:outline-none focus:border-blue-500/50 transition-all"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-white text-black rounded-xl hover:scale-105 active:scale-95 transition-all">
                   <Send className="w-4 h-4" />
                </button>
             </div>
          </form>
       </div>

       {/* Details Sidebar / Overlay */}
       <AnimatePresence>
          {showDetails && (
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute inset-0 bg-[#050505] z-[100] flex flex-col"
            >
               <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Cluster Details</h3>
                  <button onClick={() => setShowDetails(false)} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                     <X className="w-6 h-6" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-12 custom-scrollbar">
                  {/* Identity */}
                  <div className="flex flex-col items-center text-center">
                     <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white text-3xl font-black mb-6 shadow-2xl">
                        {group.name?.[0]}
                     </div>
                     {isEditingName ? (
                        <div className="flex gap-2 w-full max-w-xs">
                           <input 
                             type="text" 
                             value={newName} 
                             onChange={(e) => setNewName(e.target.value)}
                             className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-black"
                           />
                           <button onClick={handleRename} className="p-2 bg-blue-600 rounded-xl"><CheckIcon className="w-4 h-4" /></button>
                        </div>
                     ) : (
                        <div className="flex items-center gap-3">
                           <h4 className="text-2xl font-black text-white italic tracking-tighter">{group.name}</h4>
                           {group.role === 'admin' && (
                             <button onClick={() => setIsEditingName(true)} className="p-2 text-gray-500 hover:text-white"><Edit2 className="w-3 h-3" /></button>
                           )}
                        </div>
                     )}
                     <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2">Active Cluster Since {new Date(group.created_at).toLocaleDateString()}</p>
                  </div>

                  {/* Members List */}
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Node Roster ({members.length})</h5>
                     </div>
                     
                     <AnimatePresence>
                        {showInvite && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                             <form onSubmit={handleInvite} className="flex gap-2 p-4 bg-blue-600/5 border border-blue-500/20 rounded-2xl">
                                <input 
                                  type="text" 
                                  value={inviteQuery} 
                                  onChange={(e) => setInviteQuery(e.target.value)}
                                  placeholder="Invite by username..."
                                  className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-black"
                                />
                                <button type="submit" className="p-2 bg-blue-600 rounded-xl text-white"><Plus className="w-4 h-4" /></button>
                                <button type="button" onClick={() => setShowInvite(false)} className="p-2 text-gray-500"><X className="w-4 h-4" /></button>
                             </form>
                          </motion.div>
                        )}
                     </AnimatePresence>

                     <div className="space-y-3">
                        {members.map((m) => (
                           <div key={m.user_id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white text-xs uppercase overflow-hidden">
                                    {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" /> : m.username[0]}
                                 </div>
                                 <div>
                                    <h6 className="text-xs font-black text-white">@{m.username}</h6>
                                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{m.role}</p>
                                 </div>
                              </div>
                              {group.role === 'admin' && m.user_id !== user?.id && (
                                <button onClick={() => handleRemoveMember(m.user_id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                   <UserMinus className="w-4 h-4" />
                                </button>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Invite Member - Visible to admin in details or just a separate form */}
                  {group.role === 'admin' && (
                    <div className="space-y-6 border-t border-white/5 pt-12">
                       <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Invite New Node</h5>
                       <form onSubmit={handleInvite} className="flex gap-2">
                          <input 
                            type="text" 
                            value={inviteQuery} 
                            onChange={(e) => setInviteQuery(e.target.value)}
                            placeholder="Username..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black"
                          />
                          <button type="submit" className="p-2 bg-blue-600 rounded-xl text-white"><Plus className="w-4 h-4" /></button>
                       </form>
                    </div>
                  )}

                  {/* Actions */}
                  {group.role === 'admin' && (
                     <div className="pt-12 border-t border-white/5 space-y-4">
                        <button 
                          onClick={handleDeleteGroup}
                          className="w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-3"
                        >
                           <Trash2 className="w-4 h-4" /> Terminate Cluster
                        </button>
                     </div>
                  )}
               </div>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};

const CheckIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
