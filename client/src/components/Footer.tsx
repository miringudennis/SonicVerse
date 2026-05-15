import { Link } from 'react-router-dom';
import { Music, LayoutGrid, Compass, ShoppingCart, Map as MapIcon, Shield, Globe, Cpu, Zap, ChevronRight } from 'lucide-react';

export const Footer = () => {
  const navLinks = [
    { to: '/dashboard', icon: LayoutGrid, label: 'Dash' },
    { to: '/discover', icon: Compass, label: 'Discover' },
    { to: '/catalog', icon: Music, label: 'Catalog' },
    { to: '/feed', icon: ShoppingCart, label: 'Feed' },
    { to: '/map', icon: MapIcon, label: 'Map' },
  ];

  return (
    <footer className="relative z-10 px-4 md:px-6 pb-6 md:pb-12 mt-4 md:mt-20">
      <div className="max-w-7xl mx-auto bg-[#0a0a0a] border border-white/5 rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-20 shadow-2xl relative overflow-hidden group">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 p-8 md:p-16 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
           <Music className="w-64 h-64 md:w-96 md:h-96 text-white -rotate-12" />
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-20" />
        
        <div className="relative z-10 flex flex-col gap-12 md:gap-20">
          {/* Top Section: Brand & Meta */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
            <div className="md:col-span-5 lg:col-span-4 space-y-6 md:space-y-8">
              <div className="flex items-center gap-3 font-black text-2xl md:text-3xl tracking-tighter text-white group/logo">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover/logo:rotate-12 transition-transform">
                  <Music className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
                <span className="italic">SonicVerse</span>
              </div>
              <p className="text-gray-500 font-medium leading-relaxed max-w-sm text-sm md:text-lg">
                The modular music ecosystem for the next generation of listeners and creators.
              </p>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 w-fit">
                 <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                    <Cpu className="w-4 h-4" />
                 </div>
                 <div>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">Node Status</p>
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Neural Grid Active</p>
                 </div>
              </div>
            </div>

            {/* Links Sections - Simplified Grid for Mobile */}
            <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              <div className="space-y-6 md:space-y-8">
                <h4 className="text-white font-black uppercase italic text-[10px] tracking-[0.3em] opacity-40">Protocol</h4>
                <ul className="space-y-4 md:space-y-5">
                  {navLinks.map((item) => (
                    <li key={item.to}>
                      <Link to={item.to} className="flex items-center gap-2 text-gray-500 font-black uppercase tracking-widest text-[9px] hover:text-white transition-all group/link">
                        <item.icon className="w-3.5 h-3.5 text-blue-500/40 group-hover/link:text-blue-500 transition-colors" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6 md:space-y-8">
                <h4 className="text-white font-black uppercase italic text-[10px] tracking-[0.3em] opacity-40">Network</h4>
                <ul className="space-y-4 md:space-y-5 text-gray-500 font-black uppercase tracking-widest text-[9px]">
                  <li><a href="#" className="hover:text-white flex items-center gap-2 transition-all"><Globe className="w-3.5 h-3.5 text-purple-500/40" /> Discord</a></li>
                  <li><a href="#" className="hover:text-white flex items-center gap-2 transition-all"><Zap className="w-3.5 h-3.5 text-orange-500/40" /> Twitter</a></li>
                  <li><a href="#" className="hover:text-white flex items-center gap-2 transition-all"><Music className="w-3.5 h-3.5 text-pink-500/40" /> Instagram</a></li>
                </ul>
              </div>

              <div className="space-y-6 md:space-y-8 col-span-2 lg:col-span-1">
                <h4 className="text-white font-black uppercase italic text-[10px] tracking-[0.3em] opacity-40">Governance</h4>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                  <Link to="/privacy" className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-white/10 transition-all">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-gray-700" /> Privacy
                    </div>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                  <Link to="/terms" className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white hover:border-white/10 transition-all">
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-gray-700" /> Terms
                    </div>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section: Copyright & System Info */}
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 md:pt-12 border-t border-white/5 text-gray-600 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] gap-8">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
               <p className="text-center md:text-left">&copy; 2026 SonicVerse Protocol. Finalizing Archive.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
               <span className="text-gray-800">API v2.4</span>
               <a href="#" className="hover:text-white transition-colors">Credits</a>
               <a href="#" className="hover:text-white transition-colors">Core Nodes</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
