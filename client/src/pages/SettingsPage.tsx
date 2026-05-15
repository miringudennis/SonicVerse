import { useState, useRef } from 'react';
import { useAuthStore, type LinkedAccount } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { User, Shield, Save, Loader2, LogOut, X, Camera, Bell, Eye, EyeOff, Trash2, Settings, Zap, Key, Music, Video, Play as AppleMusicIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const SettingsPage = () => {
  const user = useAuthStore((state) => state.user);
  const linkedAccounts = useAuthStore((state) => state.linkedAccounts) as LinkedAccount[];
  const { unlinkAccount, logout, setUser } = useAuthStore();
  const openSyncModal = useUIStore((state) => state.openSyncModal);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'accounts' | 'prefs'>('profile');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar_url: (user as any)?.avatar_url || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleUnlink = (platform: string) => {
    if (window.confirm(`Are you sure you want to unlink your ${platform} account? This will remove all synchronized data.`)) {
      unlinkAccount(platform);
      localStorage.removeItem(`${platform}_token`);
      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} archive unlinked.`);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (activeTab === 'profile') {
        const res = await api.put('/auth/update-profile', {
          username: formData.username,
          avatar_url: formData.avatar_url
        });
        
        if (res.data.success) {
          if (user) {
            setUser({
              ...user,
              username: formData.username,
              avatar_url: formData.avatar_url
            });
          }
          toast.success('Identity configuration synchronized.');
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Protocol update failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Data payload exceeds 5MB limit.');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      setFormData({ ...formData, avatar_url: publicUrl });
      
      const res = await api.put('/auth/update-profile', { avatar_url: publicUrl });
      
      if (res.data.success && user) {
        setUser({
          ...user,
          avatar_url: publicUrl
        });
      }
      
      toast.success('Visual identifier established.');
    } catch (err: any) {
      toast.error('Neural image upload failed.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Identity', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'accounts', label: 'Accounts', icon: Music },
    { id: 'prefs', label: 'Protocol', icon: Bell },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-0 pb-20">
      {/* Settings Header */}
      <section className="relative overflow-hidden rounded-[2rem] bg-[#0a0a0a] border border-white/5 p-6 md:p-8 mb-8 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Settings className="w-60 h-60 text-blue-500 animate-spin-slow" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                <Zap className="w-2.5 h-2.5" />
                <span>System Configuration Console</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-3">
                Node <br /> Settings.
              </h1>
              <p className="text-gray-400 text-sm max-w-md font-medium leading-relaxed">
                Calibrate your identity and security protocols within the SonicVerse network.
              </p>
           </div>
           <button 
             onClick={() => navigate('/dashboard')}
             className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all group shrink-0"
           >
             <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
           </button>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Column / Row */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] px-4 mb-2">Modules</p>
          <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-shrink-0 lg:w-full flex items-center justify-between px-5 py-4 rounded-[1.25rem] lg:rounded-[1.5rem] text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                  activeTab === tab.id 
                    ? 'bg-white border-white text-black shadow-xl shadow-white/5' 
                    : 'bg-[#0a0a0a] border-white/5 text-gray-500 hover:text-white hover:border-white/10'
                }`}
              >
                <span className="flex items-center gap-3">
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </span>
                {activeTab === tab.id && <motion.div layoutId="active" className="hidden lg:block w-1.5 h-1.5 rounded-full bg-black" />}
              </button>
            ))}
          </div>
          
          <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-white/5">
             <button 
                onClick={() => { logout(); navigate('/'); }}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-[1.25rem] lg:rounded-[1.5rem] bg-red-500/5 border border-red-500/10 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-[0.2em] transition-all"
             >
                <LogOut className="w-4 h-4" /> Terminate Session
             </button>
          </div>
        </div>

        {/* Content Column */}
        <div className="lg:col-span-8">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0a0a] rounded-[2rem] md:rounded-[2.5rem] border border-white/5 p-6 md:p-10 shadow-2xl relative overflow-hidden"
          >
              <div className="absolute top-0 left-0 w-1 bg-blue-500 h-full opacity-30" />
              
              <div className="space-y-10 md:space-y-12">
                
                {activeTab === 'profile' && (
                  <form onSubmit={handleSave} className="space-y-10 md:space-y-12">
                    {/* Identity Avatar */}
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
                      <div className="relative group">
                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] bg-white/5 border-2 border-white/10 flex items-center justify-center text-4xl font-black text-white shadow-2xl relative overflow-hidden">
                          {formData.avatar_url ? (
                            <img src={formData.avatar_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Identity" />
                          ) : (
                            user?.username?.[0]?.toUpperCase() || 'U'
                          )}
                          
                          <AnimatePresence>
                            {uploading && (
                              <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                              >
                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-9 h-9 md:w-10 md:h-10 bg-white text-black rounded-xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform active:scale-95"
                        >
                          <Camera className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileUpload} 
                          className="hidden" 
                          accept="image/*"
                        />
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Visual Identifier</h3>
                        <p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-6">Established Nodes Require Identifiers // Max Payload 5MB</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
                          <button 
                            type="button" 
                            onClick={() => fileInputRef.current?.click()}
                            className="px-5 py-2.5 md:px-6 md:py-3 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                          >
                            Update Data
                          </button>
                          {formData.avatar_url && (
                            <button 
                              type="button" 
                              onClick={() => setFormData({...formData, avatar_url: ''})}
                              className="px-5 py-2.5 md:px-6 md:py-3 text-red-500/70 hover:text-red-500 hover:bg-red-500/5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2"
                            >
                              <Trash2 className="w-3 h-3" /> Wipe Identifier
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 pt-10 border-t border-white/5">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Handle Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            className="w-full bg-white/5 border border-white/10 p-4 md:p-5 pl-12 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-white font-bold uppercase tracking-tighter"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Archive Link</label>
                        <div className="relative">
                          <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 opacity-30" />
                          <input
                            type="email"
                            disabled
                            className="w-full bg-white/5 border border-white/5 p-4 md:p-5 pl-12 rounded-2xl text-gray-600 cursor-not-allowed font-bold"
                            value={formData.email}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-8 md:pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5">
                      <div className="flex-1" />
                      <div className="flex w-full sm:w-auto gap-4">
                        <button
                          type="button"
                          onClick={() => navigate('/dashboard')}
                          className="flex-1 sm:flex-none px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-gray-600 hover:text-white transition-all"
                        >
                          Abort
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 sm:flex-none bg-white text-black px-8 md:px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-white/5 disabled:opacity-30"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Synchronize
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {activeTab === 'security' && (
                  <form onSubmit={handleSave} className="space-y-8 md:space-y-10">
                    <div className="bg-blue-600/5 border border-blue-500/10 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col md:flex-row items-start gap-4 md:gap-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-2xl rounded-full" />
                      <Shield className="w-6 h-6 md:w-8 md:h-8 text-blue-500 shrink-0" />
                      <p className="text-[11px] md:text-sm text-blue-200/50 font-medium uppercase tracking-[0.05em] leading-relaxed relative z-10">
                        Authentication Guard: Modification of security parameters requires immediate verification of current access credentials.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Current Access Key</label>
                      <div className="relative group">
                        <input
                          type={showCurrentPass ? "text" : "password"}
                          placeholder="Initialize Verification"
                          className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all text-white pr-14 font-bold"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                        >
                          {showCurrentPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 pt-6 border-t border-white/5">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">New Access Key</label>
                        <input
                          type="password"
                          placeholder="Generate New Key"
                          className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all text-white font-bold"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 ml-1">Confirm New Key</label>
                        <input
                          type="password"
                          placeholder="Verify New Key"
                          className="w-full bg-white/5 border border-white/10 p-4 md:p-5 rounded-2xl focus:outline-none focus:border-blue-500/50 transition-all text-white font-bold"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="pt-8 md:pt-10 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5">
                      <div className="flex-1" />
                      <div className="flex w-full sm:w-auto gap-4">
                        <button
                          type="button"
                          onClick={() => navigate('/dashboard')}
                          className="flex-1 sm:flex-none px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-gray-600 hover:text-white transition-all"
                        >
                          Abort
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="flex-1 sm:flex-none bg-white text-black px-8 md:px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-white/5 disabled:opacity-30"
                        >
                          {loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="w-4 h-4" />
                              Synchronize
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {activeTab === 'accounts' && (
                  <div className="space-y-6 md:space-y-8">
                    <div className="flex flex-col gap-4 md:gap-6">
                      {[
                        { id: 'spotify', name: 'Spotify', icon: Music, color: 'text-[#1DB954]' },
                        { id: 'youtube', name: 'YouTube Music', icon: Video, color: 'text-[#FF0000]' },
                        { id: 'apple', name: 'Apple Music', icon: AppleMusicIcon, color: 'text-[#fa243c]' },
                      ].map((platform) => {
                        const isLinked = linkedAccounts.some(a => a.platform === platform.id);
                        const accountData = linkedAccounts.find(a => a.platform === platform.id);

                        return (
                          <div key={platform.id} className="group flex flex-col sm:flex-row items-center justify-between p-5 md:p-6 bg-[#0c0c0c] rounded-[2rem] md:rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all shadow-lg gap-4">
                             <div className="flex items-center gap-5 md:gap-6 w-full sm:w-auto">
                                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[1.25rem] bg-white/5 flex items-center justify-center border border-white/10 ${isLinked ? platform.color : 'text-gray-700'} group-hover:scale-110 transition-transform`}>
                                   <platform.icon className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="flex-1">
                                   <p className="font-black uppercase tracking-tighter text-base md:text-lg italic text-white group-hover:text-blue-400 transition-colors">{platform.name}</p>
                                   <p className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">
                                      {isLinked ? `Connected as ${accountData?.username}` : 'Not Synchronized'}
                                   </p>
                                </div>
                             </div>
                             
                             {isLinked ? (
                               <button 
                                 type="button"
                                 onClick={() => handleUnlink(platform.id)}
                                 className="w-full sm:w-auto px-6 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg"
                               >
                                 Unlink Archive
                               </button>
                             ) : (
                               <button 
                                 type="button"
                                 onClick={openSyncModal}
                                 className="w-full sm:w-auto px-6 py-3 bg-white text-black hover:scale-105 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-xl shadow-white/5"
                               >
                                 Establish Link
                               </button>
                             )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-white/5 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-dashed border-white/10 text-center">
                       <p className="text-gray-500 text-[11px] md:text-xs font-medium leading-relaxed max-w-md mx-auto">
                          SonicVerse synchronization allows the neural engine to analyze your external streaming patterns and synthesize personalized discoveries.
                       </p>
                    </div>
                  </div>
                )}

                {activeTab === 'prefs' && (
                  <div className="space-y-6 md:space-y-8">
                    {[
                      { title: 'Neural Notifications', desc: 'Receive synthesized discovery logs', active: true },
                      { title: 'Public Node Status', desc: 'Broadcast listener activity to the grid', active: false },
                      { title: 'High Fidelity Streams', desc: 'Prioritize lossless audio packets', active: true },
                    ].map((pref) => (
                      <div key={pref.title} className="flex items-center justify-between p-5 md:p-6 bg-[#0c0c0c] rounded-[2rem] md:rounded-[2.5rem] border border-white/10 hover:border-white/20 transition-all group shadow-lg">
                         <div className="flex-1 pr-4">
                            <p className="font-black uppercase tracking-tighter text-base md:text-lg italic text-white group-hover:text-blue-400 transition-colors">{pref.title}</p>
                            <p className="text-[9px] md:text-[10px] text-gray-500 font-black uppercase tracking-[0.1em] mt-1">{pref.desc}</p>
                         </div>
                         <div className={`w-12 h-7 md:w-14 md:h-8 rounded-full relative cursor-pointer transition-colors duration-500 flex-shrink-0 ${pref.active ? 'bg-blue-600' : 'bg-white/10'}`}>
                            <div className={`absolute top-1 md:top-1.5 w-5 h-5 bg-white rounded-full shadow-2xl transition-all duration-500 ${pref.active ? 'right-1 md:right-1.5' : 'left-1 md:left-1.5'}`} />
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
