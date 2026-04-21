import { useState, useEffect, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  type Node, 
  type Edge,
  MarkerType,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import api from '../services/api';
import { Loader2, Sparkles, Filter, Music, CheckCircle2, Video, Play as AppleMusicIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const MOODS = ['Energetic', 'Chill', 'Dark', 'Euphoric', 'Calm'];

export const DiscoveryPage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(true);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  
  const linkedAccounts = useAuthStore(state => state.linkedAccounts);
  const navigate = useNavigate();

  const fetchGraphData = useCallback(async (mood?: string) => {
    setLoading(true);
    try {
      const res = await api.get('/songs/discovery/graph', { params: { mood } });
      let songs = res.data;

      // If we have linked accounts, inject real data from Spotify
      if (linkedAccounts.some(a => a.platform === 'spotify')) {
        const token = localStorage.getItem('spotify_token');
        if (token) {
           const res = await api.get('/spotify/top-tracks', {
               headers: { 'x-spotify-token': token }
           });
           songs = [...songs, ...res.data];
        }
      }

      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];

      songs.forEach((song: any, index: number) => {
        const angle = (index / songs.length) * 2 * Math.PI;
        const radius = 250;
        
        newNodes.push({
          id: `song-${song.id}`,
          position: { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius },
          data: { label: song.title },
          className: `rounded-full p-4 font-bold border-none shadow-lg text-xs text-center min-w-[100px] ${
            song.isExternal ? 'bg-green-600 text-white shadow-green-500/20' : 'bg-blue-600 text-white shadow-blue-500/40'
          }`,
        });

        const artistNodeId = `artist-${song.artist_id || song.artist_name}`;
        if (!newNodes.find(n => n.id === artistNodeId)) {
          newNodes.push({
            id: artistNodeId,
            position: { x: Math.cos(angle) * (radius + 150), y: Math.sin(angle) * (radius + 150) },
            data: { label: song.artist_name },
            className: 'bg-purple-900/80 text-purple-200 rounded-lg p-2 border-purple-500/30 text-[10px] font-bold',
          });
        }

        newEdges.push({
          id: `e-${song.id}-a`,
          source: `song-${song.id}`,
          target: artistNodeId,
          animated: true,
          style: { stroke: song.isExternal ? '#10b981' : '#4f46e5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: song.isExternal ? '#10b981' : '#4f46e5' }
        });
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (err) {
      console.error('Failed to fetch discovery graph:', err);
    } finally {
      setLoading(false);
    }
  }, [setNodes, setEdges, linkedAccounts]);

  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  const handleMoodClick = (mood: string) => {
    const nextMood = activeMood === mood ? undefined : mood;
    setActiveMood(nextMood || null);
    fetchGraphData(nextMood);
  };

  const isPlatformLinked = (id: string) => linkedAccounts.some(a => a.platform === id);

  return (
    <div className="flex flex-col gap-8 py-4 text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-4xl font-black tracking-tighter mb-2 uppercase italic flex items-center gap-3">
             <Sparkles className="text-blue-500 w-8 h-8" />
             Discovery Engine
          </h1>
          <p className="text-gray-500 text-sm">Manage your linked accounts and discover new sonic realms based on your history.</p>
        </div>

        <div className="flex items-center gap-3 bg-gray-900/50 p-2 rounded-2xl border border-gray-800">
           {[
             { id: 'spotify', icon: Music, color: 'text-green-500', label: 'Spotify' },
             { id: 'youtube', icon: Video, color: 'text-red-500', label: 'YT Music' },
             { id: 'apple', icon: AppleMusicIcon, color: 'text-pink-500', label: 'Apple' }
           ].map(p => (
             <button
                key={p.id}
                onClick={() => navigate(`/sync/${p.id}`)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isPlatformLinked(p.id) 
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-black/40 text-gray-500 border border-transparent hover:border-gray-700'
                }`}
             >
                {isPlatformLinked(p.id) ? <CheckCircle2 className="w-3 h-3" /> : <p.icon className={`w-3 h-3 ${p.color}`} />}
                {p.label}
             </button>
           ))}
        </div>
      </div>

      <div className="h-[70vh] w-full bg-gray-950 rounded-[3rem] border border-gray-800 relative overflow-hidden shadow-2xl">
        <div className="absolute top-10 left-10 z-10 pointer-events-none">
          <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
              <h1 className="text-2xl font-black tracking-tight uppercase italic">Song DNA</h1>
          </div>
        </div>

        {loading && (
          <div className="absolute inset-0 z-20 bg-black/20 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          </div>
        )}
        
        <div className="absolute inset-0">
          <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              fitView
              style={{ background: '#020617' }}
          >
              <Background color="#1e293b" gap={25} size={1} />
              <Controls className="bg-gray-900 border-gray-800 fill-white !shadow-none rounded-lg overflow-hidden" />
          </ReactFlow>
        </div>

        <div className="absolute bottom-8 right-8 bg-gray-900/40 backdrop-blur-2xl p-6 rounded-3xl border border-gray-800/50 shadow-2xl z-10 w-72">
          <div className="flex items-center gap-2 mb-4 text-gray-400">
             <Filter className="w-4 h-4" />
             <h4 className="font-bold text-xs uppercase tracking-[0.2em]">Mood Engine</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
              {MOODS.map(mood => (
                  <button 
                    key={mood} 
                    onClick={() => handleMoodClick(mood)}
                    className={`text-[10px] font-black uppercase tracking-widest px-3 py-2.5 rounded-xl border transition-all duration-300 ${
                      activeMood === mood 
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-black/40 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'
                    }`}
                  >
                      {mood}
                  </button>
              ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-8 flex items-center gap-6 text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-black/20 backdrop-blur px-4 py-2 rounded-full border border-white/5 z-10">
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600 shadow-[0_0_8px_#2563eb]" /> SonicVerse</div>
           <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#10b981]" /> Linked Library</div>
        </div>
      </div>
    </div>
  );
};
