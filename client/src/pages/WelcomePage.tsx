import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Music, Compass, LayoutGrid } from 'lucide-react';
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
            to="/catalog" 
            className="group relative px-10 py-4 bg-blue-600 rounded-full font-bold text-lg flex items-center justify-center gap-2 overflow-hidden hover:bg-blue-700 transition-all active:scale-95"
          >
            Enter Application
          </Link>
          <Link 
            to="/discover" 
            className="px-10 py-4 bg-gray-900 border border-gray-800 rounded-full font-bold text-lg hover:bg-gray-800 transition-colors"
          >
            Explore Discovery
          </Link>
        </div>

        <div className="mt-24 relative w-full max-w-5xl aspect-video rounded-3xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black overflow-hidden shadow-2xl shadow-blue-500/10">
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="grid grid-cols-3 gap-8 p-12 w-full">
                {[1,2,3].map(i => (
                  <div key={i} className="aspect-square bg-gray-800/50 rounded-2xl animate-pulse" />
                ))}
             </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black to-transparent" />
        </div>
      </main>

      <section id="features" className="relative z-10 py-32 px-6 max-w-7xl mx-auto text-white">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 p-8 rounded-3xl border border-gray-900 bg-gray-950/50 hover:border-blue-500/30 transition-colors group">
            <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Global Discovery</h3>
            <p className="text-gray-400">Navigate the sonic graph and find music that resonates with your soul from across the universe.</p>
          </div>
          <div className="space-y-4 p-8 rounded-3xl border border-gray-900 bg-gray-950/50 hover:border-purple-500/30 transition-colors group">
            <div className="w-12 h-12 bg-purple-600/10 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
              <LayoutGrid className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Social Feed</h3>
            <p className="text-gray-400">Share your stories and connect with other explorers in real-time through interactive posts.</p>
          </div>
          <div className="space-y-4 p-8 rounded-3xl border border-gray-900 bg-gray-950/50 hover:border-pink-500/30 transition-colors group">
            <div className="w-12 h-12 bg-pink-600/10 rounded-2xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
              <Music className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Immersive Player</h3>
            <p className="text-gray-400">A seamless playback experience that integrates perfectly with your social interactions.</p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-12 px-6 border-t border-gray-900 text-center text-gray-500 text-sm">
        <p>&copy; 2026 SonicVerse Inc. All rights reserved.</p>
      </footer>
    </div>
  );
};
