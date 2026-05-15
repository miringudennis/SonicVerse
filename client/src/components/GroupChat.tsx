import { useState, useEffect, useRef } from 'react';
import { Send, UserPlus, ArrowLeft, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

interface GroupChatProps {
  group: any;
  onBack: () => void;
}

export const GroupChat = ({ group, onBack }: GroupChatProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [inviteQuery, setInviteQuery] = useState('');
  const [showInvite, setShowInvite] = useState(false);
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

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling for demo
    return () => clearInterval(interval);
  }, [group.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const res = await api.post('/groups/messages', { groupId: group.id, content });
      setMessages([...messages, { ...res.data, username: user?.username }]);
      setContent('');
    } catch (err) {
      toast.error('Transmission failure');
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

  return (
    <div className="flex flex-col h-[700px] bg-[#0a0a0a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
       {/* Header */}
       <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all">
                <ArrowLeft className="w-5 h-5" />
             </button>
             <div>
                <h3 className="text-sm font-black text-white uppercase italic tracking-tighter flex items-center gap-2">
                   {group.name}
                   {group.role === 'admin' && <Shield className="w-3 h-3 text-blue-500" />}
                </h3>
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">Active Neural Group</p>
             </div>
          </div>
          {group.role === 'admin' && (
            <button 
              onClick={() => setShowInvite(!showInvite)}
              className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600/20 transition-all"
            >
               <UserPlus className="w-4 h-4" />
            </button>
          )}
       </div>

       {/* Invite Overlay */}
       <AnimatePresence>
          {showInvite && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-600/5 border-b border-blue-500/10 overflow-hidden"
            >
               <form onSubmit={handleInvite} className="p-6 flex gap-3">
                  <input 
                    type="text" 
                    value={inviteQuery}
                    onChange={(e) => setInviteQuery(e.target.value)}
                    placeholder="Username to invite..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500/50"
                  />
                  <button type="submit" className="px-6 py-2 bg-blue-600 rounded-xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all">
                     Invite
                  </button>
               </form>
            </motion.div>
          )}
       </AnimatePresence>

       {/* Messages */}
       <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {messages.map((m, i) => {
            const isMe = m.sender_id === user?.id;
            return (
              <div key={m.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                 <div className="flex items-center gap-2 mb-1 px-1">
                    {!isMe && <span className="text-[7px] font-black text-blue-500 uppercase tracking-widest">@{m.username}</span>}
                    <span className="text-[6px] text-gray-600 font-black uppercase">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                 </div>
                 <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-gray-300 rounded-tl-none'
                 }`}>
                    {m.content}
                 </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
       </div>

       {/* Input */}
       <form onSubmit={handleSend} className="p-6 bg-white/5 border-t border-white/5 backdrop-blur-md">
          <div className="relative">
             <input 
               type="text" 
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder="Transmit message..."
               className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500/50"
             />
             <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-white text-black rounded-xl hover:scale-105 transition-all">
                <Send className="w-4 h-4" />
             </button>
          </div>
       </form>
    </div>
  );
};
