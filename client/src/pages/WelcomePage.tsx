import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Compass, LayoutGrid, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const WelcomePage = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter text-white">
          <Music className="w-8 h-8 text-blue-500" />
          <span>SonicVerse</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <Link to="/login" className="px-5 py-2 rounded-full border border-gray-800 hover:border-gray-600 transition-colors">Sign In</Link>
          <Link to="/register" className="px-5 py-2 rounded-full bg-white text-black font-bold hover:scale-105 transition-transform">Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-8">
          <Compass className="w-3 h-3" />
          <span>REVOLUTIONIZING THE SONIC VERSE</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-white">
          The Next Generation of <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Music Socialization.
          </span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          Discover, curate, and share your sonic journey. SonicVerse is the modular platform 
          designed for artists, explorers, and the community that drives them.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            to="/register" 
            className="group relative px-10 py-4 bg-white text-black rounded-full font-bold text-lg flex items-center justify-center gap-2 overflow-hidden hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-white/10"
          >
            Enter SonicVerse
          </Link>
          <Link 
            to="/discover" 
            className="px-10 py-4 bg-gray-900 border border-gray-800 text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-colors"
          >
            Explore Discovery
          </Link>
        </div>

        <div className="mt-24 relative w-full max-w-5xl aspect-video rounded-3xl border border-gray-800 bg-black overflow-hidden shadow-2xl shadow-blue-500/10 group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
          <div className="absolute inset-0 flex items-center justify-center p-8 md:p-12">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full h-full">
                {[
                  { title: 'Neon Nights', artist: 'Cyberwave', color: 'bg-blue-500' },
                  { title: 'Ethereal', artist: 'Lumina', color: 'bg-purple-500' },
                  { title: 'Void Ritual', artist: 'Dark Star', color: 'bg-pink-500' },
                  { title: 'Solar Wind', artist: 'Helios', color: 'bg-orange-500' },
                  { title: 'Digital Rain', artist: 'Matrix', color: 'bg-green-500' },
                  { title: 'Pulse', artist: 'Synthetix', color: 'bg-red-500' },
                  { title: 'Subzero', artist: 'Glacier', color: 'bg-cyan-500' },
                  { title: 'Echoes', artist: 'Vast', color: 'bg-indigo-500' },
                ].map((item, i) => (
                  <div key={i} className={`relative group/item overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 transition-all duration-500 hover:scale-[1.02] hover:border-white/20`}>
                    <div className={`absolute inset-0 opacity-20 ${item.color} blur-3xl`} />
                    <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black via-black/20 to-transparent">
                      <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">{item.artist}</p>
                      <h4 className="text-sm font-black text-white truncate">{item.title}</h4>
                    </div>
                  </div>
                ))}
             </div>
          </div>
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-700 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />
        </div>
      </main>

      <section id="features" className="relative z-10 py-32 px-6 max-w-7xl mx-auto text-white">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6 italic tracking-tighter uppercase">The Sonic Ecosystem</h2>
          <p className="text-gray-400 max-w-xl mx-auto">More than just a player. A complete modular environment for the next era of music consumption.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-6 p-10 rounded-[2.5rem] border border-gray-900 bg-gray-950/50 hover:border-blue-500/30 transition-all group hover:-translate-y-2 duration-500">
            <div className="w-16 h-16 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform border border-blue-500/20">
              <Compass className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Neural Discovery</h3>
            <p className="text-gray-400 leading-relaxed">Our proprietary algorithms analyze sonic DNA across platforms to find your next obsession before you do.</p>
            <div className="pt-4 flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Learn More <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          <div className="space-y-6 p-10 rounded-[2.5rem] border border-gray-900 bg-gray-950/50 hover:border-purple-500/30 transition-all group hover:-translate-y-2 duration-500">
            <div className="w-16 h-16 bg-purple-600/10 rounded-3xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform border border-purple-500/20">
              <LayoutGrid className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Modular Catalog</h3>
            <p className="text-gray-400 leading-relaxed">Sync Spotify, YouTube, and Apple Music into a single, cohesive interface. Your library, unified at last.</p>
            <div className="pt-4 flex items-center gap-2 text-purple-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Explore Modules <ArrowRight className="w-3 h-3" />
            </div>
          </div>
          <div className="space-y-6 p-10 rounded-[2.5rem] border border-gray-900 bg-gray-950/50 hover:border-pink-500/30 transition-all group hover:-translate-y-2 duration-500">
            <div className="w-16 h-16 bg-pink-600/10 rounded-3xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform border border-pink-500/20">
              <Music className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">Sonic Stories</h3>
            <p className="text-gray-400 leading-relaxed">Create immersive, interactive narratives around your favorite tracks and share them with the universe.</p>
            <div className="pt-4 flex items-center gap-2 text-pink-500 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              Start Creating <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 px-6 border-t border-gray-900 text-center text-gray-500 text-sm">
        <p>&copy; 2026 SonicVerse Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
