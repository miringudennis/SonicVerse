import { Component, type ReactNode, useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Music, Compass, LayoutGrid, Map as MapIcon, ShoppingCart, LogIn, Settings, LogOut, ChevronDown, Menu, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useUIStore } from '../store/uiStore';
import { Player } from './Player';
import { AppBackground } from './AppBackground';
import { Footer } from './Footer';
import { SyncModal } from './SyncModal';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };
  public static getDerivedStateFromError(): State { return { hasError: true }; }
  public componentDidCatch(error: any, errorInfo: any) {
    console.error('SonicVerse: Internal Component Error:', error, errorInfo);
  }
  public render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

const UserDropdown = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return (
    <Link to="/login" className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg shadow-white/5">
      <LogIn className="w-4 h-4" /> Login
    </Link>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 pr-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all group backdrop-blur-md"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white uppercase shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform overflow-hidden">
          {user.avatar_url ? (
            <img src={user.avatar_url} className="w-full h-full object-cover" alt={user.username} />
          ) : (
            user.username?.[0] || user.email?.[0] || 'U'
          )}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-xs font-black text-white uppercase tracking-tighter">{user.username || 'Explorer'}</p>
        </div>
        <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-4 w-64 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-[60] overflow-hidden py-2"
          >
            <div className="px-5 py-4 border-b border-white/5 bg-white/5">
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Authenticated as</p>
               <p className="text-sm font-black truncate text-white uppercase tracking-tighter">{user.username || user.email}</p>
            </div>
            
            <Link 
              to="/settings" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-5 py-4 text-xs font-black text-gray-400 hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest"
            >
              <Settings className="w-4 h-4 text-blue-500" /> Account Settings
            </Link>
            
            <button 
              onClick={() => {
                setIsOpen(false);
                logout();
                navigate('/');
              }}
              className="w-full flex items-center gap-3 px-5 py-4 text-xs font-black text-red-500 hover:bg-red-500/10 transition-all border-t border-white/5 uppercase tracking-widest"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isSyncModalOpen, closeSyncModal } = useUIStore();

  const navLinks = [
    { to: '/dashboard', icon: LayoutGrid, label: 'Dash' },
    { to: '/discover', icon: Compass, label: 'Discover' },
    { to: '/catalog', icon: Music, label: 'Catalog' },
    { to: '/feed', icon: ShoppingCart, label: 'Feed' },
    { to: '/map', icon: MapIcon, label: 'Map' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 font-sans">
      <AppBackground />
      
      <div className={`transition-all duration-700 ease-in-out ${isSyncModalOpen ? 'blur-2xl scale-[0.98] opacity-50 pointer-events-none' : ''}`}>
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
        </div>

        <nav className="fixed top-0 left-0 right-0 h-20 bg-black/40 backdrop-blur-2xl border-b border-white/5 z-[1000] flex items-center justify-between px-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link to="/dashboard" className="flex items-center gap-2 font-black text-2xl tracking-tighter group">
               <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-transform">
                 <Music className="w-6 h-6 text-white" />
               </div>
               <span className="hidden xs:block bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">SonicVerse</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => 
                  `flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                    isActive ? 'bg-white text-black shadow-xl shadow-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-3 rounded-full bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-3 right-3 w-2 h-2 bg-blue-500 rounded-full border border-black" />
            </button>
            <UserDropdown />
          </div>
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-24 left-6 right-6 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl z-[999] md:hidden overflow-hidden"
            >
              <div className="flex flex-col p-4 gap-2">
                {navLinks.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-4 p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                        isActive ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/5'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="relative z-10 pt-28 px-6 max-w-7xl mx-auto">
          <ErrorBoundary fallback={<div className="p-10 border border-red-500/20 rounded-[2rem] bg-red-900/5 text-red-500 font-black uppercase tracking-widest text-center text-xs">Sonic Driver Conflict: Component Failed</div>}>
            <Outlet />
          </ErrorBoundary>
        </main>

        <Footer />

        <ErrorBoundary fallback={null}>
           <div className="fixed bottom-0 left-0 right-0 z-[1001] px-6 pb-6 pointer-events-none">
             <div className="max-w-7xl mx-auto pointer-events-auto">
               <Player />
             </div>
           </div>
        </ErrorBoundary>
      </div>

      <SyncModal 
        isOpen={isSyncModalOpen} 
        onClose={closeSyncModal} 
      />
    </div>
  );
};
