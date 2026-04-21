import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { Music, CheckCircle2, Shield, ArrowRight, Loader2, Video, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PLATFORMS = {
  spotify: {
    name: 'Spotify',
    icon: Music,
    color: 'bg-green-600',
    hover: 'hover:bg-green-700',
    shadow: 'shadow-green-900/40',
    description: 'Sync your top artists, tracks and curated playlists.',
    permissions: ['Read public profile', 'Access top artists and tracks', 'Read library saved tracks']
  },
  youtube: {
    name: 'YouTube Music',
    icon: Video,
    color: 'bg-red-600',
    hover: 'hover:bg-red-700',
    shadow: 'shadow-red-900/40',
    description: 'Import your music preferences and liked videos.',
    permissions: ['View YouTube account', 'Manage music activity', 'Access private playlists']
  },
  apple: {
    name: 'Apple Music',
    icon: Music,
    color: 'bg-pink-600',
    hover: 'hover:bg-pink-700',
    shadow: 'shadow-pink-900/40',
    description: 'Connect your Apple Music library and playback history.',
    permissions: ['Access Media Library', 'View listening history', 'Read account info']
  }
};

export const SyncPage = () => {
  const { platform } = useParams<{ platform: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const selectedPlatform = PLATFORMS[platform as keyof typeof PLATFORMS];

  if (!selectedPlatform) {
    return <div className="p-20 text-center text-white">Platform not found.</div>;
  }

  const handleConnect = async () => {
    setLoading(true);
    try {
        if (platform === 'spotify') {
            const { data } = await api.get('/spotify/auth-url');
            window.location.href = data.url;
        } else {
            // Placeholder for other platforms
            setTimeout(() => navigate('/discover'), 1000);
        }
    } catch (err) {
        console.error('Connection failed', err);
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] opacity-20 blur-[150px] rounded-full ${selectedPlatform.color}`} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg w-full bg-gray-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl relative z-10"
      >
        <button onClick={() => navigate('/discover')} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="space-y-8 text-center">
            <div className={`w-20 h-20 ${selectedPlatform.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl ${selectedPlatform.shadow} rotate-12`}>
                <selectedPlatform.icon className="w-10 h-10 text-white -rotate-12" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">Connect {selectedPlatform.name}</h2>
            <p className="text-gray-400">{selectedPlatform.description}</p>

            <button 
                onClick={handleConnect}
                disabled={loading}
                className={`w-full py-4 ${selectedPlatform.color} ${selectedPlatform.hover} rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${selectedPlatform.shadow}`}
            >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>Authorize Connection <ArrowRight className="w-5 h-5" /></>
                )}
            </button>
        </div>
      </motion.div>
    </div>
  );
};
