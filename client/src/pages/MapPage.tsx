import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { Globe, Crosshair, Map as MapIcon, Zap, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { motion } from 'framer-motion';

// Fix for default marker icons in React Leaflet
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CustomMarkerIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #3b82f6; width: 34px; height: 34px; border-radius: 12px; border: 2px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(59, 130, 246, 0.4); transform: rotate(45deg);"><div style="transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const SpotifyMarkerIcon = new L.DivIcon({
  className: 'custom-div-icon',
  html: `<div style="background-color: #1DB954; width: 34px; height: 34px; border-radius: 12px; border: 2px solid rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; box-shadow: 0 0 20px rgba(29, 185, 84, 0.4); transform: rotate(45deg);"><div style="transform: rotate(-45deg); display: flex; align-items: center; justify-content: center;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div></div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
};

export const MapPage = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([-1.2921, 36.8219]); // Nairobi
  const linkedAccounts = useAuthStore(state => state.linkedAccounts);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      try {
        const res = await api.get('/songs/artists/locations');
        let allArtists = res.data;

        if (linkedAccounts.some(a => a.platform === 'spotify')) {
          const token = localStorage.getItem('spotify_token');
          if (token) {
            try {
              const spotifyRes = await api.get('/spotify/top-artists-locations', {
                headers: { 'x-spotify-token': token }
              });
              allArtists = [...allArtists, ...spotifyRes.data];
            } catch (err) {
              console.error('Spotify Map Error:', err);
            }
          }
        }

        setArtists(allArtists);
      } catch (err) {
        console.error('Failed to fetch artist locations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, [linkedAccounts]);

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      <section className="relative overflow-hidden rounded-[3.5rem] bg-[#0a0a0a] border border-white/5 p-12 md:p-16">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Globe className="w-80 h-80 text-blue-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">
              <Sparkles className="w-3 h-3" />
              <span>Global Frequency Mapping</span>
            </div>
            <h1 className="text-5xl md:text-[5rem] font-black text-white uppercase italic tracking-tighter leading-none mb-6">
              Sonic <br /> Cartography.
            </h1>
            <p className="text-gray-400 text-lg max-w-xl font-medium leading-relaxed">
              Discover the geographical roots of sound. Mapping the origins of your archived artists across the global verse.
            </p>
          </div>

          <div className="flex flex-col gap-4 min-w-[200px]">
            <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] text-center md:text-left mb-2">Navigation Nodes</p>
            <button 
              onClick={() => setCenter([-1.2921, 36.8219])} 
              className="group flex items-center justify-between px-8 py-4 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl shadow-white/5"
            >
              Nairobi Hub
              <Crosshair className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
            </button>
            <button 
              onClick={() => setCenter([20, 0])} 
              className="group flex items-center justify-between px-8 py-4 bg-white/5 border border-white/10 text-gray-400 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:text-white hover:bg-white/10 transition-all"
            >
              Global View
              <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      <div className="h-[75vh] w-full bg-[#0a0a0a] rounded-[4rem] border border-white/5 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        {loading ? (
           <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center">
             <div className="w-20 h-20 rounded-full border-b-4 border-blue-500 animate-spin mb-8" />
             <p className="text-blue-500 font-black animate-pulse uppercase tracking-[0.5em] text-[10px]">Scanning Frequencies...</p>
           </div>
        ) : (
          <MapContainer 
            center={center} 
            zoom={6} 
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <ChangeView center={center} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
            />
            {artists.map((artist) => (
              <Marker 
                key={`${artist.id}-${artist.source || 'internal'}`} 
                position={artist.coordinates}
                icon={artist.source === 'Spotify' ? SpotifyMarkerIcon : CustomMarkerIcon}
              >
                <Popup className="custom-popup">
                   <motion.div 
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="p-6 min-w-[240px] bg-[#0a0a0a] text-white rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden"
                   >
                      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${artist.source === 'Spotify' ? 'from-[#1DB954] to-[#191414]' : 'from-blue-600 to-indigo-800'}`} />
                      
                      <div className="flex items-center gap-5 mb-6">
                         {artist.avatar_url ? (
                            <img src={artist.avatar_url} className="w-16 h-16 rounded-[1.25rem] object-cover shadow-2xl border border-white/10" alt={artist.username} />
                         ) : (
                            <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center font-black text-2xl text-white shadow-2xl">
                               {artist.username[0].toUpperCase()}
                            </div>
                         )}
                         <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-black text-lg text-white m-0 leading-tight uppercase italic tracking-tighter truncate">{artist.username}</h4>
                            </div>
                            <div className="flex items-center gap-1.5">
                               <MapIcon className="w-3 h-3 text-gray-500" />
                               <p className="text-[10px] text-gray-500 m-0 uppercase tracking-widest font-black truncate">{artist.location}</p>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-8">
                         {artist.genre_tags?.slice(0, 3).map((tag: string) => (
                           <span key={tag} className="text-[8px] font-black bg-white/5 px-3 py-1.5 rounded-lg text-gray-400 border border-white/5 uppercase tracking-[0.1em]">{tag}</span>
                         ))}
                      </div>

                      <button className={`w-full py-4 rounded-2xl text-[10px] font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${
                        artist.source === 'Spotify' 
                          ? 'bg-[#1DB954] text-white hover:bg-[#1ed760] shadow-[#1DB954]/10' 
                          : 'bg-white text-black shadow-white/5 hover:scale-[1.02]'
                      }`}>
                         <Zap className="w-4 h-4 fill-current" /> 
                         {artist.source === 'Spotify' ? 'SYNC SPOTIFY' : 'INITIALIZE MODULE'}
                      </button>
                   </motion.div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <style>{`
        .leaflet-container { background: #0a0a0a !important; outline: none; }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: transparent !important;
          color: white !important;
          border: none !important;
          border-radius: 2.5rem !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .custom-div-icon { background: none; border: none; }
        .leaflet-bar { border: none !important; }
        .leaflet-container .leaflet-overlay-pane svg { pointer-events: none; }
        .leaflet-tile-pane { filter: brightness(0.6) contrast(1.2) saturate(1.2); opacity: 0.9; }
      `}</style>
    </div>
  );
};
