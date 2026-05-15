import { useState, useEffect, useRef } from 'react';
import { Bell, Users, MessageSquare, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import toast from 'react-hot-toast';

export const NotificationsDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/social/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRespondToInvite = async (groupId: string, accept: boolean) => {
    try {
      await api.post('/groups/respond', { groupId, accept });
      toast.success(accept ? 'Joined group!' : 'Invite declined');
      fetchNotifications();
    } catch (err) {
      toast.error('Failed to respond to invite');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/social/notifications/read');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-full bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-blue-500 rounded-full border-2 border-black flex items-center justify-center text-[8px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-80 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl z-[60] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
               <h3 className="text-xs font-black text-white uppercase tracking-widest">Neural Alerts</h3>
               {unreadCount > 0 && (
                 <button onClick={markAllAsRead} className="text-[8px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors">Clear All</button>
               )}
            </div>

            <div className="max-h-96 overflow-y-auto custom-scrollbar">
               {notifications.length === 0 ? (
                 <div className="p-10 text-center text-gray-600">
                    <Bell className="w-8 h-8 mx-auto mb-3 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No alerts detected</p>
                 </div>
               ) : (
                 notifications.map((n) => (
                   <div key={n.id} className={`p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-blue-500/5' : ''}`}>
                      <div className="flex gap-3">
                         <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0">
                            {n.type === 'group_invite' ? <Users className="w-4 h-4 text-purple-500" /> : 
                             n.type === 'follow' ? <UserPlus className="w-4 h-4 text-blue-500" /> :
                             <MessageSquare className="w-4 h-4 text-green-500" />}
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-300 leading-relaxed">
                               {n.type === 'group_invite' ? (
                                 <>
                                   <span className="font-black text-white">{n.data.username || 'System'}</span> invited you to <span className="font-black text-purple-400">{n.data.group_name}</span>
                                 </>
                               ) : n.type === 'follow' ? (
                                 <>
                                   <span className="font-black text-white">@{n.data.username}</span> initialized a following protocol
                                 </>
                               ) : (
                                 n.data.message || 'System transmission received'
                               )}
                            </p>
                            <p className="text-[7px] text-gray-600 font-black uppercase tracking-widest mt-1">
                               {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>

                            {n.type === 'group_invite' && (
                              <div className="flex gap-2 mt-3">
                                 <button 
                                   onClick={() => handleRespondToInvite(n.data.group_id, true)}
                                   className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all"
                                 >
                                    Accept
                                 </button>
                                 <button 
                                   onClick={() => handleRespondToInvite(n.data.group_id, false)}
                                   className="flex-1 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 text-[8px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                 >
                                    Decline
                                 </button>
                              </div>
                            )}
                         </div>
                      </div>
                   </div>
                 ))
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
