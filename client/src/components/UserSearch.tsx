import { useState } from 'react';
import { Search, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const UserSearch = ({ onFollowUpdate }: { onFollowUpdate: () => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.get(`/social/search?query=${query}`);
      setResults(res.data);
    } catch (err) {
      toast.error('Neural search failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (user: any) => {
    try {
      if (user.is_following) {
        await api.post('/social/unfollow', { followingId: user.user_id });
        toast.success(`Connection terminated: @${user.username}`);
      } else {
        await api.post('/social/follow', { followingId: user.user_id });
        toast.success(`Protocol initiated: @${user.username}`);
      }
      // Update local state for immediate feedback
      setResults(prev => prev.map(u => u.user_id === user.user_id ? { ...u, is_following: !u.is_following } : u));
      onFollowUpdate();
    } catch (err) {
      toast.error('Protocol synchronization failure');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Verse by username..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-blue-500/50 transition-all"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600" />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 rounded-xl text-white hover:bg-blue-500 transition-all">
          <Search className="w-4 h-4" />
        </button>
      </form>

      <div className="space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : results.map((u) => (
          <div key={u.user_id} className="flex items-center justify-between p-4 bg-white/5 rounded-[1.5rem] border border-white/5 hover:border-white/10 transition-all group">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center font-black text-white text-xs uppercase shadow-lg shadow-blue-500/20">
                  {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover rounded-xl" alt="" /> : u.username[0]}
               </div>
               <div>
                  <h4 className="text-xs font-black text-white uppercase italic tracking-tighter">@{u.username}</h4>
                  <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{u.display_name || 'Neural Entity'}</p>
               </div>
            </div>
            <button 
              onClick={() => toggleFollow(u)}
              className={`p-2.5 rounded-xl border transition-all ${
                u.is_following 
                  ? 'border-red-500/20 text-red-500 hover:bg-red-500/10' 
                  : 'border-blue-500/20 text-blue-500 hover:bg-blue-500/10'
              }`}
            >
              {u.is_following ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </button>
          </div>
        ))}
        {query && !loading && results.length === 0 && (
          <p className="text-center text-[10px] font-black text-gray-600 uppercase tracking-widest py-8">No matching entities found in the grid</p>
        )}
      </div>
    </div>
  );
};
