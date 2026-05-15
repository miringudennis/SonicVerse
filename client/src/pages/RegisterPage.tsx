import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Music, ArrowRight, Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { WelcomeCanvas } from '../components/WelcomeCanvas';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.post('/auth/register', { email, username, password });
      setAuth(res.data.user, res.data.token);
      toast.success('Neural identity registered.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.detail || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden">
      <WelcomeCanvas />

      {/* Minimal Header */}
      <header className="relative z-10 p-6 sm:p-8 max-w-7xl mx-auto w-full">
        <Link to="/" className="inline-flex items-center gap-2 font-black text-xl sm:text-2xl tracking-tighter hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-tr from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Music className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">SonicVerse</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-md w-full p-8 sm:p-10 bg-black/40 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-50" />
          
          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase italic">Create Identity</h2>
            <p className="text-gray-400 mt-2 sm:mt-3 text-xs sm:text-sm font-medium">Join the global sonic collective.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-500 transition-colors">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Handlename"
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl sm:rounded-2xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm sm:text-base text-white placeholder:text-gray-700 font-bold pl-11 sm:pl-14"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-500 transition-colors">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <input
                  type="email"
                  placeholder="navigator@verse.com"
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl sm:rounded-2xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm sm:text-base text-white placeholder:text-gray-700 font-bold pl-11 sm:pl-14"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Access Key</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-purple-500 transition-colors">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create Password"
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-xl sm:rounded-2xl focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all text-sm sm:text-base text-white placeholder:text-gray-700 font-bold pl-11 sm:pl-14 pr-11 sm:pr-14"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 sm:pr-5 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 sm:py-5 rounded-xl sm:rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-white/5 flex items-center justify-center gap-3 group relative overflow-hidden mt-4"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {loading ? (
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
              ) : (
                <span className="relative z-10 flex items-center gap-2 text-xs sm:text-sm">
                  Create Account
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-xs sm:text-sm font-medium">
              Already synced? <Link to="/login" className="text-purple-400 font-black hover:text-purple-300 transition-all uppercase tracking-widest ml-1">Login</Link>
            </p>
          </div>
        </motion.div>
      </main>
      
      <footer className="relative z-10 p-6 sm:p-8 text-center text-gray-600 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em]">
        &copy; 2026 SonicVerse Protocol.
      </footer>
    </div>
  );
};
