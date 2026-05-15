import { useState, useEffect, useRef } from 'react';
import { Send, ArrowLeft, Shield, Info, X, Image, Video, FileText, Trash2, Edit2, UserMinus, ExternalLink, Plus, Reply, Check, Camera, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { io, Socket } from 'socket.io-client';
import { supabase } from '../lib/supabaseClient';

const getUserColor = (username: string) => {
  const colors = [
    'text-blue-500', 'text-purple-500', 'text-pink-500', 'text-green-500', 
    'text-yellow-500', 'text-orange-500', 'text-red-500', 'text-indigo-500',
    'text-cyan-500', 'text-emerald-500'
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

interface GroupChatProps {
  group: any;
  onBack: () => void;
}

export const GroupChat = ({ group: initialGroup, onBack }: GroupChatProps) => {
  const [group, setGroup] = useState(initialGroup);
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [inviteQuery, setInviteQuery] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [showMediaSelection, setShowMediaSelection] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(group.name);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const { user } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    setSocket(newSocket);

    newSocket.emit('join_group', group.id);

    newSocket.on('user_typing', ({ username }) => {
      setTypingUsers((prev) => prev.includes(username) ? prev : [...prev, username]);
    });

    newSocket.on('user_stop_typing', ({ username }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== username));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [group.id]);

  const handleTyping = () => {
    if (!socket || !user) return;
    
    socket.emit('typing', { groupId: group.id, username: user.username });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', { groupId: group.id, username: user.username });
    }, 2000);
  };

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
        mediaType: type,
        replyToId: replyingTo?.id
      });
      setMessages([...messages, { ...res.data, username: user?.username, avatar_url: user?.avatar_url }]);
      if (type === 'text') setContent('');
      setReplyingTo(null);
      setShowMediaSelection(false);
    } catch (err) {
      toast.error('Transmission failure');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/groups/${group.id}/${fileName}`;

      // Using 'profiles' bucket as it's confirmed to be active and following user-path policy
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      await handleSend(type, publicUrl);
      toast.success('Media synchronized');
    } catch (err) {
      toast.error('Media upload failed');
      console.error(err);
    } finally {
      setUploading(false);
      if (type === 'image' && imageInputRef.current) imageInputRef.current.value = '';
      if (type === 'video' && videoInputRef.current) videoInputRef.current.value = '';
      if (type === 'document' && docInputRef.current) docInputRef.current.value = '';
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await api.delete(`/groups/messages/${messageId}`);
      setMessages(messages.filter(m => m.id !== messageId));
      toast.success('Message erased');
    } catch (err) {
      toast.error('Erasure failed');
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
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invite protocol failed');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
    <div className="flex flex-col h-full md:h-[750px] fixed inset-0 z-[60] md:relative md:inset-auto bg-[#0a0a0a] md:rounded-[2.5rem] border-0 md:border md:border-white/5 overflow-hidden shadow-2xl transition-all duration-500">
       {/* Wallpaper Background */}
       {group.wallpaper_url && (
         <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
            <img src={group.wallpaper_url} className="w-full h-full object-cover" alt="" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
         </div>
       )}

       {/* Header */}
       <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-black/60 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3 md:gap-4">
             <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 text-gray-400 hover:text-white transition-all">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div onClick={() => setShowDetails(true)} className="cursor-pointer group flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white text-xs uppercase overflow-hidden shadow-lg">
                   {group.image_url ? <img src={group.image_url} className="w-full h-full object-cover" /> : group.name?.[0]}
                </div>
                <div>
                   <h3 className="text-sm md:text-base font-black text-white italic tracking-tighter flex items-center gap-2 group-hover:text-blue-400 transition-colors">
                      {group.name}
                      {group.role === 'admin' && <Shield className="w-3 h-3 text-blue-500" />}
                   </h3>
                   <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Neural Cluster Active</p>
                   </div>
                </div>
             </div>
          </div>
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setShowDetails(true)}
               className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-all hover:scale-105"
             >
                <Info className="w-4 h-4" />
             </button>
          </div>
       </div>

       {/* Main Chat Area */}
       <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar flex flex-col z-10">
          {messages.map((m, i) => {
            const isMe = m.sender_id === user?.id;
            const replyTo = messages.find(msg => msg.id === m.reply_to_id);

            return (
              <div key={m.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group/msg`}>
                 <div className="flex items-center gap-2 mb-1.5 px-1">
                    {!isMe && <span className={`text-[8px] font-black uppercase ${getUserColor(m.username)}`}>@{m.username}</span>}
                    <span className="text-[7px] text-gray-600 font-black uppercase">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
                 
                 <div className="flex items-start gap-2 max-w-[85%]">
                    {isMe && (
                       <button 
                         onClick={() => handleDeleteMessage(m.id)}
                         className="opacity-0 group-hover/msg:opacity-100 p-2 text-gray-600 hover:text-red-500 transition-all self-center"
                       >
                          <Trash2 className="w-3 h-3" />
                       </button>
                    )}
                    
                    <div className="flex flex-col">
                       {replyTo && (
                          <div className={`mb-1 p-2 rounded-xl text-[10px] bg-white/5 border-l-2 border-blue-500 text-gray-500 truncate max-w-xs ${isMe ? 'self-end' : 'self-start'}`}>
                             <span className="font-black">@{replyTo.username}:</span> {replyTo.content}
                          </div>
                       )}
                       <div className={`p-4 rounded-3xl text-sm leading-relaxed relative ${
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
                          {m.media_type === 'document' && (
                             <a href={m.media_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-black/20 rounded-xl mb-2 hover:bg-black/40 transition-all border border-white/5">
                                <FileText className="w-5 h-5 text-blue-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Open Document</span>
                             </a>
                          )}
                          <div className="font-medium whitespace-pre-wrap">{renderContent(m.content)}</div>
                       </div>
                    </div>

                    {!isMe && (
                       <button 
                         onClick={() => setReplyingTo(m)}
                         className="opacity-0 group-hover/msg:opacity-100 p-2 text-gray-600 hover:text-blue-500 transition-all self-center"
                       >
                          <Reply className="w-3 h-3" />
                       </button>
                    )}
                 </div>
              </div>
            );
          })}
          
          <AnimatePresence>
             {typingUsers.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="flex items-center gap-3 text-[10px] text-gray-500 font-black uppercase tracking-widest px-2"
                >
                   <div className="flex gap-1">
                      <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" />
                      <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                   </div>
                   {typingUsers.length === 1 
                     ? `${typingUsers[0]} is typing...` 
                     : `${typingUsers.join(', ')} are typing...`}
                </motion.div>
             )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
       </div>

       {/* Input Area */}
       <div className="p-6 bg-white/5 border-t border-white/5 backdrop-blur-md relative">
          <AnimatePresence>
             {replyingTo && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full left-0 right-0 p-4 bg-blue-600/10 backdrop-blur-xl border-t border-white/10 flex items-center justify-between z-40"
                >
                   <div className="flex items-center gap-3">
                      <Reply className="w-4 h-4 text-blue-500" />
                      <div className="text-[10px] font-black uppercase tracking-widest">
                         Replying to <span className="text-white">@{replyingTo.username}</span>
                      </div>
                   </div>
                   <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white">
                      <X className="w-4 h-4" />
                   </button>
                </motion.div>
             )}

             {showMediaSelection && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  className="absolute bottom-full left-6 mb-4 bg-[#111] border border-white/10 p-4 rounded-[2rem] shadow-2xl flex gap-6 z-50"
                >
                   <button onClick={() => imageInputRef.current?.click()} className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-500 flex items-center justify-center group-hover:scale-110 transition-all">
                         <Image className="w-5 h-5" />
                      </div>
                      <span className="text-[8px] font-black uppercase text-gray-500">Image</span>
                   </button>
                   <button onClick={() => videoInputRef.current?.click()} className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-all">
                         <Video className="w-5 h-5" />
                      </div>
                      <span className="text-[8px] font-black uppercase text-gray-500">Video</span>
                   </button>
                   <button onClick={() => docInputRef.current?.click()} className="flex flex-col items-center gap-2 group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-all">
                         <FileText className="w-5 h-5" />
                      </div>
                      <span className="text-[8px] font-black uppercase text-gray-500">Doc</span>
                   </button>
                </motion.div>
             )}
          </AnimatePresence>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-4 items-center">
             <input 
                type="file" 
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'image')}
             />
             <input 
                type="file" 
                ref={videoInputRef}
                className="hidden"
                accept="video/*"
                onChange={(e) => handleFileSelect(e, 'video')}
             />
             <input 
                type="file" 
                ref={docInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
                onChange={(e) => handleFileSelect(e, 'document')}
             />
             <button 
               type="button" 
               disabled={uploading}
               onClick={() => setShowMediaSelection(!showMediaSelection)}
               className={`p-3.5 rounded-2xl border transition-all ${showMediaSelection ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'}`}
             >
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className={`w-5 h-5 transition-transform duration-300 ${showMediaSelection ? 'rotate-45' : ''}`} />}
             </button>
             <div className="flex-1 relative">
                <textarea 
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    handleTyping();
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                  }}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  placeholder="Sync transmission..."
                  rows={1}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm font-medium focus:outline-none focus:border-blue-500/50 transition-all resize-none custom-scrollbar"
                />
                <button type="button" onClick={() => handleSend()} className="absolute right-2 bottom-2 p-3 bg-white text-black rounded-xl hover:scale-105 active:scale-95 transition-all">
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
              className="absolute top-0 right-0 bottom-0 w-full md:w-[400px] bg-[#050505] z-[100] flex flex-col border-l border-white/10 shadow-2xl"
            >
               <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-white/5">
                  <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Cluster Protocol</h3>
                  <button onClick={() => setShowDetails(false)} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                     <X className="w-6 h-6" />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-12 custom-scrollbar">
                  {/* Identity Section */}
                  <div className="flex flex-col items-center text-center space-y-6">
                     <div className="relative group/avatar">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2.5rem] bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white text-4xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden border-4 border-white/5">
                           {group.image_url ? (
                             <img src={group.image_url} className="w-full h-full object-cover group-hover/avatar:scale-110 transition-transform duration-700" alt="Group" />
                           ) : (
                             group.name?.[0]
                           )}
                        </div>
                        {group.role === 'admin' && (
                          <button 
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = async (e: any) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setUploading(true);
                                try {
                                  const fileExt = file.name.split('.').pop();
                                  const fileName = `group-${group.id}-${Date.now()}.${fileExt}`;
                                  const filePath = `groups/${fileName}`;
                                  const { error } = await supabase.storage.from('profiles').upload(filePath, file);
                                  if (error) throw error;
                                  const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
                                  const res = await api.put('/groups/update', { groupId: group.id, imageUrl: publicUrl });
                                  setGroup({ ...group, image_url: res.data.image_url });
                                  toast.success('Visual established');
                                } catch (err) {
                                  toast.error('Sync failed');
                                } finally {
                                  setUploading(false);
                                }
                              };
                              input.click();
                            }}
                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-black rounded-2xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-10"
                          >
                            <Camera className="w-5 h-5" />
                          </button>
                        )}
                     </div>

                     <div className="space-y-2">
                        {isEditingName ? (
                           <div className="flex gap-2">
                              <input 
                                type="text" 
                                value={newName} 
                                onChange={(e) => setNewName(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm font-black text-white focus:border-blue-500 outline-none"
                              />
                              <button onClick={async () => {
                                try {
                                  const res = await api.put('/groups/update', { groupId: group.id, name: newName });
                                  setGroup({ ...group, name: res.data.name });
                                  setIsEditingName(false);
                                  toast.success('Cluster renamed');
                                } catch (err) {
                                  toast.error('Failed');
                                }
                              }} className="p-2 bg-blue-600 rounded-xl text-white"><Check className="w-4 h-4" /></button>
                           </div>
                        ) : (
                           <div className="flex items-center justify-center gap-3">
                              <h4 className="text-3xl font-black text-white italic tracking-tighter">{group.name}</h4>
                              {group.role === 'admin' && (
                                <button onClick={() => setIsEditingName(true)} className="p-2 text-gray-500 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                              )}
                           </div>
                        )}
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em]">Node Established {new Date(group.created_at).toLocaleDateString()}</p>
                     </div>
                  </div>

                  {/* Wallpaper Section - Admin Only */}
                  {group.role === 'admin' && (
                    <div className="space-y-4 p-6 bg-white/5 rounded-3xl border border-white/5">
                       <div className="flex items-center justify-between">
                          <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                             <Image className="w-3 h-3 text-purple-500" /> Neural Wallpaper
                          </h5>
                          <button 
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = async (e: any) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setUploading(true);
                                try {
                                  const fileExt = file.name.split('.').pop();
                                  const fileName = `wallpaper-${group.id}-${Date.now()}.${fileExt}`;
                                  const filePath = `groups/wallpapers/${fileName}`;
                                  const { error } = await supabase.storage.from('profiles').upload(filePath, file);
                                  if (error) throw error;
                                  const { data: { publicUrl } } = supabase.storage.from('profiles').getPublicUrl(filePath);
                                  const res = await api.put('/groups/update', { groupId: group.id, wallpaperUrl: publicUrl });
                                  setGroup({ ...group, wallpaper_url: res.data.wallpaper_url });
                                  toast.success('Wallpaper synchronized');
                                } catch (err) {
                                  toast.error('Wallpaper sync failed');
                                } finally {
                                  setUploading(false);
                                }
                              };
                              input.click();
                            }}
                            className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors"
                          >
                             Update Signal
                          </button>
                       </div>
                       <div className="h-24 w-full rounded-2xl bg-black/40 border border-white/5 overflow-hidden group/wp relative">
                          {group.wallpaper_url ? (
                            <img src={group.wallpaper_url} className="w-full h-full object-cover opacity-60 group-hover/wp:opacity-100 transition-opacity" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-700 text-[8px] font-black uppercase tracking-widest">No Active Wallpaper</div>
                          )}
                       </div>
                    </div>
                  )}

                  {/* Members Section */}
                  <div className="space-y-6">
                     <div className="flex items-center justify-between">
                        <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Node Roster ({members.length})</h5>
                     </div>
                     
                     <div className="space-y-3">
                        {members.map((m) => (
                           <div key={m.user_id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group/member">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white text-xs uppercase overflow-hidden">
                                    {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" /> : m.username[0]}
                                 </div>
                                 <div>
                                    <h6 className="text-xs font-black text-white group-hover/member:text-blue-400 transition-colors">@{m.username}</h6>
                                    <div className="flex items-center gap-2">
                                       <div className={`w-1 h-1 rounded-full ${m.role === 'admin' ? 'bg-blue-500' : 'bg-gray-600'}`} />
                                       <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{m.role}</p>
                                    </div>
                                 </div>
                              </div>
                              {group.role === 'admin' && m.user_id !== user?.id && (
                                <button onClick={() => handleRemoveMember(m.user_id)} className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                   <UserMinus className="w-4 h-4" />
                                </button>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Invite New Nodes */}
                  {group.role === 'admin' && (
                    <div className="space-y-6 p-6 bg-blue-600/5 border border-blue-500/10 rounded-[2rem]">
                       <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Plus className="w-3 h-3" /> Expand Signal Network
                       </h5>
                       <form onSubmit={handleInvite} className="flex gap-2">
                          <input 
                            type="text" 
                            value={inviteQuery} 
                            onChange={(e) => setInviteQuery(e.target.value)}
                            placeholder="Enter username..."
                            className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white focus:border-blue-500 outline-none"
                          />
                          <button type="submit" className="px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all font-black text-[10px] uppercase tracking-widest">
                             Link
                          </button>
                       </form>
                    </div>
                  )}

                  {/* Danger Zone */}
                  {group.role === 'admin' && (
                     <div className="pt-12 border-t border-white/5">
                        <button 
                          onClick={handleDeleteGroup}
                          className="w-full py-4 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3 group"
                        >
                           <Trash2 className="w-4 h-4 group-hover:animate-bounce" /> Deconstruct Cluster
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
