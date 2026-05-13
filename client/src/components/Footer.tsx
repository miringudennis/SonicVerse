import { Link } from 'react-router-dom';
import { Music, LayoutGrid, Compass, ShoppingCart, Map as MapIcon, Shield, Globe, Cpu, Zap } from 'lucide-react';

export const Footer = () => {
  const navLinks = [
    { to: '/dashboard', icon: LayoutGrid, label: 'Dash' },
    { to: '/discover', icon: Compass, label: 'Discover' },
    { to: '/catalog', icon: Music, label: 'Catalog' },
    { to: '/feed', icon: ShoppingCart, label: 'Feed' },
    { to: '/map', icon: MapIcon, label: 'Map' },
  ];

  return (
    <footer className="relative z-10 px-6 pb-12 mt-12">
      <div className="max-w-7xl mx-auto bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] p-12 md:p-20 shadow-2xl relative overflow-hidden group">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
           <Music className="w-96 h-96 text-white -rotate-12" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20" />
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-16 mb-20">
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 font-black text-3xl tracking-tighter text-white mb-8 group/logo">
              <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover/logo:rotate-12 transition-transform">
                <Music className="w-7 h-7 text-white" />
              </div>
              <span className="italic">SonicVerse</span>
            </div>
            <p className="text-gray-500 font-medium leading-relaxed max-w-xs mb-8 text-lg">
              The modular music ecosystem for the next generation of listeners and creators.
            </p>
            <div className="flex items-center gap-4">
               <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-blue-500">
                  <Cpu className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">System Status</p>
                  <p className="text-xs font-black text-white uppercase tracking-widest">Neural Grid Active</p>
               </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-white font-black uppercase italic text-xs tracking-[0.3em] mb-10 border-b border-white/5 pb-4 inline-block">Platform</h4>
            <ul className="space-y-6">
              {navLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="flex items-center gap-3 text-gray-500 font-black uppercase tracking-widest text-[10px] hover:text-white hover:translate-x-1 transition-all">
                    <item.icon className="w-4 h-4 text-blue-500/50" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-white font-black uppercase italic text-xs tracking-[0.3em] mb-10 border-b border-white/5 pb-4 inline-block">Community</h4>
            <ul className="space-y-6 text-gray-500 font-black uppercase tracking-widest text-[10px]">
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-3 hover:translate-x-1 transition-all"><Globe className="w-4 h-4 text-purple-500/50" /> Discord</a></li>
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-3 hover:translate-x-1 transition-all"><Zap className="w-4 h-4 text-orange-500/50" /> Twitter</a></li>
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-3 hover:translate-x-1 transition-all"><Music className="w-4 h-4 text-pink-500/50" /> Instagram</a></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-black uppercase italic text-xs tracking-[0.3em] mb-10 border-b border-white/5 pb-4 inline-block">Legal</h4>
            <ul className="space-y-6 text-gray-500 font-black uppercase tracking-widest text-[10px]">
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-3 hover:translate-x-1 transition-all"><Shield className="w-4 h-4 text-gray-700" /> Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors flex items-center gap-3 hover:translate-x-1 transition-all"><Shield className="w-4 h-4 text-gray-700" /> Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-white/5 text-gray-600 text-[10px] font-black uppercase tracking-[0.3em] gap-8">
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
             <p>&copy; 2026 SonicVerse Protocol. Finalizing Archive.</p>
          </div>
          <div className="flex gap-10">
             <a href="#" className="hover:text-white transition-colors">API v2.4</a>
             <a href="#" className="hover:text-white transition-colors">Credits</a>
             <a href="#" className="hover:text-white transition-colors">Core Nodes</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
