import { Component, type ReactNode, useState, useRef, useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Music, Compass, LayoutGrid, Map as MapIcon, ShoppingCart, LogIn, Settings, LogOut, ChevronDown, Menu, X } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/discover', icon: Compass, label: 'Discover' },
    { to: '/catalog', icon: LayoutGrid, label: 'Catalog' },
    { to: '/feed', icon: ShoppingCart, label: 'Feed' },
    { to: '/story/demo', icon: Music, label: 'Stories' },
    { to: '/map', icon: MapIcon, label: 'Map' },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="fixed top-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-md border-b border-gray-800 z-[1000] flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-blue-500">
            <Music className="w-8 h-8" />
            <span className="hidden xs:block">SonicVerse</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-gray-400 font-medium text-sm">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `relative flex items-center gap-2 transition-all duration-300 hover:text-white ${
                  isActive ? 'text-white font-bold' : 'text-gray-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : ''}`} />
                  {item.label}
                  {isActive && (
                    <span className="absolute -bottom-[22px] left-0 right-0 h-[2px] bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <UserDropdown />
        </div>
      </nav>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="fixed top-20 left-6 w-64 bg-gray-900 border border-gray-800 rounded-[2rem] shadow-2xl shadow-blue-500/10 z-[999] md:hidden animate-in fade-in slide-in-from-top-4 duration-300 overflow-hidden">
          <div className="flex flex-col p-3 gap-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => 
                  `flex items-center gap-3 p-3.5 rounded-2xl text-sm font-bold transition-all ${
                    isActive ? 'bg-blue-600/10 text-white' : 'text-gray-400 hover:bg-gray-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : ''}`} />
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      )}

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
