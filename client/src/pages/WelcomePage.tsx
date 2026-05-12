import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Compass, LayoutGrid, ArrowRight, Share2, Globe, Zap, Headphones } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { WelcomeCanvas } from '../components/WelcomeCanvas';

export const WelcomePage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* 3D Background */}
      <WelcomeCanvas />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto backdrop-blur-sm bg-black/10 mt-4 rounded-3xl border border-white/5">
        <div className="flex items-center gap-2 font-black text-2xl tracking-tighter text-white">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Music className="w-6 h-6 text-white" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">SonicVerse</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-400">
          <a href="#features" className="hover:text-white transition-colors uppercase tracking-widest">Features</a>
          <a href="#about" className="hover:text-white transition-colors uppercase tracking-widest">About</a>
          <Link to="/login" className="px-5 py-2 rounded-full border border-white/10 hover:border-white/30 transition-all">Sign In</Link>
          <Link to="/register" className="px-6 py-2 rounded-full bg-white text-black font-black hover:scale-105 transition-transform shadow-xl shadow-white/5">Join Now</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-24 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-10"
        >
          <Zap className="w-3 h-3 fill-current" />
          <span>The Future of Audio Socialization</span>
        </motion.div>

        <motion.h1 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-[7rem] font-black mb-10 leading-[0.85] tracking-tighter"
        >
          Music is better <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent italic px-2">
            together.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-400 max-w-3xl mb-14 leading-relaxed font-medium"
        >
          SonicVerse bridges the gap between your favorite platforms. Sync, share, and experience music in a modular universe designed for the modern listener.
        </motion.p>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
        >
          <Link 
            to="/register" 
            className="group relative px-12 py-5 bg-white text-black rounded-full font-black text-xl flex items-center justify-center gap-3 overflow-hidden hover:scale-105 transition-all active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            to="/discover" 
            className="px-12 py-5 bg-white/5 border border-white/10 backdrop-blur-xl text-white rounded-full font-black text-xl hover:bg-white/10 transition-all border-b-4 border-b-white/5 active:border-b-0 active:translate-y-1"
          >
            Explore the Verse
          </Link>
        </motion.div>

        {/* Hero Visual Mockup */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-32 relative w-full max-w-6xl aspect-[16/9] rounded-[3rem] border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden shadow-2xl group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-pink-600/20 opacity-50" />
          <div className="absolute inset-0 p-4 md:p-8">
            <div className="w-full h-full rounded-2xl bg-[#0a0a0a] border border-white/5 flex flex-col overflow-hidden">
              <div className="h-12 border-b border-white/5 flex items-center px-6 justify-between bg-black/20">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-green-500/20" />
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">SonicVerse OS v2.4.0</div>
              </div>
              <div className="flex-1 grid grid-cols-12 gap-4 p-4 md:p-6">
                <div className="col-span-3 space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-12 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
                  ))}
                </div>
                <div className="col-span-9 grid grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 group-hover:border-white/20 transition-colors duration-500 relative overflow-hidden">
                       <div className="absolute bottom-4 left-4 right-4 h-3 bg-white/10 rounded-full" />
                       <div className="absolute bottom-10 left-4 w-1/2 h-4 bg-white/20 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
        </motion.div>
      </main>

      {/* Features Bento Grid */}
      <section id="features" className="relative z-10 py-40 px-6 max-w-7xl mx-auto">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          <div className="md:col-span-12 mb-10">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase italic">The Ecosystem</h2>
            <p className="text-gray-400 text-lg max-w-2xl font-medium">SonicVerse isn't just an app. It's a modular OS for your musical identity.</p>
          </div>

          {/* Bento Card 1: Large */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-8 group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-800 p-10 md:p-14 min-h-[400px] flex flex-col justify-end border border-white/10 shadow-2xl"
          >
            <div className="absolute top-10 right-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
               <Compass className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-widest mb-6">Discovery Engine</span>
              <h3 className="text-4xl md:text-5xl font-black mb-6 leading-[0.9] tracking-tighter">Neural Audio <br />Mapping.</h3>
              <p className="text-blue-100/70 text-lg max-w-md font-medium leading-relaxed">Our proprietary AI analyzes frequency patterns and emotional resonance to find your next favorite artist before they go viral.</p>
            </div>
          </motion.div>

          {/* Bento Card 2: Medium */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-4 group relative overflow-hidden rounded-[2.5rem] bg-[#111] p-10 border border-white/10 hover:border-purple-500/30 transition-all duration-500"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 blur-[60px] rounded-full group-hover:bg-purple-500/40 transition-colors" />
            <div className="w-14 h-14 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-400 mb-8 border border-purple-500/20">
              <LayoutGrid className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Unified Library</h3>
            <p className="text-gray-400 font-medium leading-relaxed">Sync Spotify, Apple Music, and YouTube into one seamless vault. No more switching apps.</p>
          </motion.div>

          {/* Bento Card 3: Medium */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-4 group relative overflow-hidden rounded-[2.5rem] bg-[#111] p-10 border border-white/10 hover:border-pink-500/30 transition-all duration-500"
          >
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500/20 blur-[60px] rounded-full group-hover:bg-pink-500/40 transition-colors" />
            <div className="w-14 h-14 bg-pink-600/20 rounded-2xl flex items-center justify-center text-pink-400 mb-8 border border-pink-500/20">
              <Share2 className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Social Stories</h3>
            <p className="text-gray-400 font-medium leading-relaxed">Create immersive visual narratives around your tracks and share them with the global verse.</p>
          </motion.div>

          {/* Bento Card 4: Medium */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-4 group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-500 to-red-600 p-10 border border-white/10"
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-8 border border-white/30 backdrop-blur-md">
              <Globe className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-white">Global Feed</h3>
            <p className="text-orange-100/70 font-medium leading-relaxed">Discover what the world is listening to in real-time. Join listener circles and live jams.</p>
          </motion.div>

          {/* Bento Card 5: Medium */}
          <motion.div 
            variants={itemVariants}
            className="md:col-span-4 group relative overflow-hidden rounded-[2.5rem] bg-[#111] p-10 border border-white/10 hover:border-blue-500/30 transition-all duration-500"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-blue-500/5 blur-[80px] rounded-full" />
            <div className="w-14 h-14 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400 mb-8 border border-blue-500/20">
              <Headphones className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Hifi Engine</h3>
            <p className="text-gray-400 font-medium leading-relaxed">Lossless playback support with customizable DSP and spatial audio enhancement.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto rounded-[4rem] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-1 md:p-1.5 shadow-2xl shadow-purple-500/20">
          <div className="bg-[#050505] rounded-[3.8rem] px-8 py-20 md:py-32 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(99,102,241,0.15)_0%,_transparent_70%)]" />
            
            <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-[0.85] relative z-10">
              Ready to enter <br /> the Verse?
            </h2>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-14 font-medium relative z-10">
              Join 50,000+ sonic explorers already redefining their musical boundaries.
            </p>
            <Link 
              to="/register" 
              className="group relative px-16 py-6 bg-white text-black rounded-full font-black text-2xl flex items-center justify-center gap-3 overflow-hidden hover:scale-105 transition-all active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.3)] z-10"
            >
              Get Started for Free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 font-black text-xl tracking-tighter text-white mb-6">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span>SonicVerse</span>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed max-w-xs">
              The modular music ecosystem for the next generation of listeners and creators.
            </p>
          </div>
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-8">Platform</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li><Link to="/discover" className="hover:text-white transition-colors">Discovery</Link></li>
              <li><Link to="/sync" className="hover:text-white transition-colors">Sync Hub</Link></li>
              <li><Link to="/catalog" className="hover:text-white transition-colors">Modular Catalog</Link></li>
              <li><Link to="/map" className="hover:text-white transition-colors">Sonic Map</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-8">Community</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Newsletter</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-black uppercase text-xs tracking-[0.2em] mb-8">Legal</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-gray-600 text-[10px] font-black uppercase tracking-widest gap-6">
          <p>&copy; 2026 SonicVerse Inc. Built for the future of audio.</p>
          <div className="flex gap-8">
             <a href="#" className="hover:text-white transition-colors">System Status</a>
             <a href="#" className="hover:text-white transition-colors">API Docs</a>
             <a href="#" className="hover:text-white transition-colors">Credits</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
