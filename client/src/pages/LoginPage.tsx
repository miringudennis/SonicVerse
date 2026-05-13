import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Music, ArrowRight, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { WelcomeCanvas } from '../components/WelcomeCanvas';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await api.post('/auth/login', { 
        emailOrUsername: identifier, 
        password 
      });
      setAuth(res.data.user, res.data.token);
      toast.success('Neural handshake established.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid email/username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative overflow-hidden">
      <WelcomeCanvas />

      {/* Minimal Header */}
      <header className="relative z-10 p-8 max-w-7xl mx-auto w-full">
        <Link to="/" className="inline-flex items-center gap-2 font-black text-2xl tracking-tighter hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Music className="w-6 h-6 text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">SonicVerse</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-md w-full p-10 bg-black/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50" />
          
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Welcome Back</h2>
            <p className="text-gray-400 mt-3 font-medium">Re-enter the modular universe.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-1">Identity</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Email or Username"
                  className="w-full bg-white/5 border border-white/10 p-5 pl-14 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-white placeholder:text-gray-700 font-bold"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Access Key</label>
                <a href="#" className="text-[10px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest">Recovery</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full bg-white/5 border border-white/10 p-5 pl-14 pr-14 rounded-2xl focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all text-white placeholder:text-gray-700 font-bold"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-5 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-white text-black font-black py-5 rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-white/5 flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  Initialize Session
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-white/5 text-center">
            <p className="text-gray-500 text-sm font-medium">
              New explorer? <Link to="/register" className="text-blue-400 font-black hover:text-blue-300 transition-all uppercase tracking-widest ml-1">Register</Link>
            </p>
          </div>
        </motion.div>
      </main>
      
      <footer className="relative z-10 p-8 text-center text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">
        &copy; 2026 SonicVerse Protocol.
      </footer>
    </div>
  );
};
