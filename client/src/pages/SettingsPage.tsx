import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { User, Shield, Save, Loader2, LogOut, X, Camera, Bell, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'prefs'>('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    
    // Simulate verification and update
    setTimeout(() => {
      setLoading(false);
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }, 1200);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'prefs', label: 'Preferences', icon: Bell },
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header with Close */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Settings</h1>
          <p className="text-gray-400">Manage your SonicVerse account and experience.</p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-3 bg-gray-900 border border-gray-800 rounded-full text-gray-400 hover:text-white hover:border-gray-600 transition-all active:scale-90"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Modular Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all border ${
                activeTab === tab.id 
                  ? 'bg-blue-600/10 text-blue-500 border-blue-600/20 shadow-lg shadow-blue-900/10' 
                  : 'text-gray-400 hover:bg-gray-900 border-transparent'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
          <div className="pt-4 mt-4 border-t border-gray-900">
             <button 
                onClick={() => { logout(); navigate('/'); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-xl font-bold transition-all"
             >
                <LogOut className="w-5 h-5" /> Sign Out
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-gray-900/30 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl">
              <form onSubmit={handleSave} className="space-y-8">
                
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-800/50">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-2xl shadow-blue-500/20">
                          {user?.username?.[0] || 'U'}
                        </div>
                        <button type="button" className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-8 h-8 text-white" />
                        </button>
                      </div>
                      <div className="text-center sm:text-left">
                        <h3 className="text-xl font-bold mb-1">Profile Picture</h3>
                        <p className="text-gray-500 text-sm mb-4">PNG, JPG or GIF. Max 5MB.</p>
                        <div className="flex gap-2">
                          <button type="button" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-bold transition-colors">Upload New</button>
                          <button type="button" className="px-4 py-2 text-red-500 text-sm font-bold hover:bg-red-500/10 rounded-lg transition-colors">Remove</button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Username</label>
                        <input
                          type="text"
                          className="w-full bg-black/50 border border-gray-800 p-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-white"
                          value={formData.username}
                          onChange={(e) => setFormData({...formData, username: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Email Address</label>
                        <input
                          type="email"
                          className="w-full bg-black/50 border border-gray-800 p-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-white"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div className="bg-blue-600/5 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                      <p className="text-sm text-blue-200/70">For your protection, you must verify your current password before making security changes.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPass ? "text" : "password"}
                          placeholder="Verify current password"
                          className="w-full bg-black/50 border border-gray-800 p-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-white pr-10"
                          value={formData.currentPassword}
                          onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowCurrentPass(!showCurrentPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                          {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-black/50 border border-gray-800 p-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-white"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">Confirm New Password</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-black/50 border border-gray-800 p-3 rounded-xl focus:outline-none focus:border-blue-500 transition-all text-white"
                          value={formData.confirmPassword}
                          onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'prefs' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                       <div>
                          <p className="font-bold">Email Notifications</p>
                          <p className="text-xs text-gray-500">Receive weekly discovery digests</p>
                       </div>
                       <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                       </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                       <div>
                          <p className="font-bold">Public Feed</p>
                          <p className="text-xs text-gray-500">Allow others to see your posts</p>
                       </div>
                       <div className="w-12 h-6 bg-gray-700 rounded-full relative cursor-pointer">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                       </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-500/10 border border-green-500/50 text-green-500 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {success}
                  </div>
                )}

                <div className="pt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-3 rounded-xl font-bold text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-xl font-black transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-blue-900/40 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
          </div>
        </div>
      </div>
    </div>
  );
};
