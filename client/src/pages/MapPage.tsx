import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { Loader2, Music } from 'lucide-react';

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
  html: `<div style="background-color: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(59, 130, 246, 0.5);"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

export const MapPage = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([-1.2921, 36.8219]); // Nairobi

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const res = await api.get('/songs/artists/locations');
        setArtists(res.data);
      } catch (err) {
        console.error('Failed to fetch artist locations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  return (
    <div className="flex flex-col gap-8 py-4">
      <div className="flex items-center justify-between px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase text-blue-500">Sonic Map</h1>
          <p className="text-gray-500 text-sm">Discover artists by their global and local roots.</p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={() => setCenter([-1.2921, 36.8219])} 
              className="px-6 py-2.5 bg-blue-600/10 text-blue-500 rounded-full text-xs font-black border border-blue-500/20 hover:bg-blue-600/20 transition-all active:scale-95"
            >
              FOCUS KENYA
            </button>
            <button 
              onClick={() => setCenter([20, 0])} 
              className="px-6 py-2.5 bg-gray-900 text-gray-400 rounded-full text-xs font-black border border-gray-800 hover:bg-gray-800 transition-all active:scale-95"
            >
              WORLD VIEW
            </button>
        </div>
      </div>

      <div className="h-[75vh] w-full bg-gray-950 rounded-[3rem] border border-gray-800 relative overflow-hidden shadow-2xl">
        {loading ? (
           <div className="absolute inset-0 z-20 bg-black/40 backdrop-blur-sm flex items-center justify-center">
             <div className="flex flex-col items-center gap-4">
               <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
               <p className="text-blue-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Artists...</p>
             </div>
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
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {artists.map((artist) => (
              <Marker 
                key={artist.id} 
                position={artist.coordinates}
                icon={CustomMarkerIcon}
              >
                <Popup className="custom-popup">
                   <div className="p-4 min-w-[200px] bg-gray-900 text-white rounded-2xl border border-gray-800">
                      <div className="flex items-center gap-4 mb-4">
                         <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-lg">
                            {artist.username[0].toUpperCase()}
                         </div>
                         <div>
                            <h4 className="font-black text-sm text-white m-0 leading-tight">{artist.username}</h4>
                            <p className="text-[10px] text-gray-500 m-0 uppercase tracking-widest font-bold mt-0.5">{artist.location}</p>
                         </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                         {artist.genre_tags?.slice(0, 3).map((tag: string) => (
                           <span key={tag} className="text-[9px] font-bold bg-gray-800 px-2.5 py-1 rounded-full text-gray-400 border border-gray-700/50 uppercase tracking-tighter">{tag}</span>
                         ))}
                      </div>
                      <button className="w-full py-2.5 bg-blue-600 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-900/40">
                         <Music className="w-3 h-3" /> EXPLORE TRACKS
                      </button>
                   </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <style>{`
        .leaflet-container { background: #020617 !important; outline: none; }
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: transparent !important;
          color: white !important;
          border: none !important;
          border-radius: 2rem !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-content { margin: 0 !important; width: auto !important; }
        .custom-div-icon { background: none; border: none; }
        .leaflet-bar { border: none !important; }
        .leaflet-container .leaflet-overlay-pane svg { pointer-events: none; }
      `}</style>
    </div>
  );
};
