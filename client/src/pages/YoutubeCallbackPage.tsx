import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { Loader2 } from 'lucide-react';

export const YoutubeCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const linkAccount = useAuthStore((state) => state.linkAccount);

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const code = params.get('code');
      const state = params.get('state');

      if (!code) {
        navigate('/discover');
        return;
      }

      try {
        const { data } = await api.get('/youtube/callback', { 
            params: { code, state } 
        });
        
        if (data.success) {
          linkAccount({
            platform: 'youtube',
            username: data.username,
            connectedAt: new Date().toISOString()
          });
          // Store token in localStorage
          localStorage.setItem('youtube_token', data.access_token);
          navigate('/discover');
        }
      } catch (err) {
        console.error('YouTube Auth Failed', err);
        navigate('/sync/youtube');
      }
    };

    handleCallback();
  }, [location, navigate, linkAccount]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
        <p className="font-bold uppercase tracking-widest">Finalizing YouTube Connection...</p>
      </div>
    </div>
  );
};
