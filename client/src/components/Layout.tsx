import { Component, type ReactNode, useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Music, Compass, LayoutGrid, Map as MapIcon, ShoppingCart, LogIn, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Player } from './Player';

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
    <Link to="/login" className="flex items-center gap-2 bg-blue-600 px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition-all active:scale-95">
      <LogIn className="w-4 h-4" /> Login
    </Link>
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-900 transition-colors group"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white uppercase shadow-lg shadow-blue-500/20">
          {user.username?.[0] || user.email?.[0] || 'U'}
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-bold text-white leading-tight">{user.username || (user.email ? user.email.split('@')[0] : 'User')}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl z-[60] overflow-hidden py-1">
          <div className="px-4 py-3 border-b border-gray-800 bg-gray-900/50">
             <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Signed in as</p>
             <p className="text-sm font-bold truncate text-white">{user.username || user.email}</p>
          </div>
          
          <Link 
            to="/settings" 
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Settings className="w-4 h-4" /> Account Settings
          </Link>
          
          <button 
            onClick={() => {
              setIsOpen(false);
              logout();
              navigate('/');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors border-t border-gray-800"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

export const Layout = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-gray-800 z-[1000] flex items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-blue-500">
          <Music className="w-8 h-8" />
          SonicVerse
        </Link>

        <div className="hidden md:flex items-center gap-8 text-gray-400 font-medium text-sm">
          <Link to="/discover" className="hover:text-white flex items-center gap-1 transition-colors"><Compass className="w-4 h-4" /> Discover</Link>
          <Link to="/catalog" className="hover:text-white flex items-center gap-1 transition-colors"><LayoutGrid className="w-4 h-4" /> Catalog</Link>
          <Link to="/feed" className="hover:text-white flex items-center gap-1 transition-colors"><ShoppingCart className="w-4 h-4" /> Feed</Link>
          <Link to="/story/demo" className="hover:text-white flex items-center gap-1 transition-colors"><Music className="w-4 h-4" /> Stories</Link>
          <Link to="/map" className="hover:text-white flex items-center gap-1 transition-colors"><MapIcon className="w-4 h-4" /> Map</Link>
        </div>

        <div className="flex items-center gap-4">
          <UserDropdown />
        </div>
      </nav>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        <ErrorBoundary fallback={<div className="p-10 border border-red-500 rounded bg-red-900/10 text-red-500">Route Component Crashed</div>}>
          <Outlet />
        </ErrorBoundary>
      </main>

      <ErrorBoundary fallback={null}>
         <Player />
      </ErrorBoundary>
    </div>
  );
};
