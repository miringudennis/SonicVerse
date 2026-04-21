import { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, Music } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export const SocialFeedPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const { user } = useAuthStore();

  const fetchPosts = async () => {
    try {
      const res = await api.get('/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await api.post('/posts', { content });
      setContent('');
      fetchPosts();
    } catch (err) {
      console.error('Failed to create post', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-4xl font-black mb-8">Activity Feed</h1>

      {user && (
        <form onSubmit={handleSubmit} className="mb-10 bg-gray-900 p-6 rounded-2xl border border-gray-800">
          <textarea
            className="w-full bg-black border border-gray-700 p-4 rounded-xl focus:outline-none focus:border-blue-500 transition mb-4 resize-none"
            placeholder="Share your musical journey..."
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <div className="flex justify-between items-center">
            <button type="button" className="text-gray-400 hover:text-white flex items-center gap-2">
                <Music className="w-5 h-5" /> Attach Song
            </button>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full font-bold transition">
              Post
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {posts.map((post) => (
          <div key={post.id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">
                {post.username[0].toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold">{post.username}</h4>
                <p className="text-gray-500 text-xs">{new Date(post.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <p className="text-gray-200 mb-6 leading-relaxed">{post.content}</p>

            {post.song_title && (
                <div className="bg-black/50 p-4 rounded-xl border border-gray-800 mb-6 flex items-center gap-4">
                    <img src={post.song_cover} alt={post.song_title} className="w-12 h-12 rounded object-cover" />
                    <div>
                        <h5 className="font-bold text-sm">{post.song_title}</h5>
                        <p className="text-gray-500 text-xs">Shared via SonicVerse</p>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-8 text-gray-400 border-t border-gray-800 pt-4">
              <button className="flex items-center gap-2 hover:text-red-500 transition"><Heart className="w-5 h-5" /> 0</button>
              <button className="flex items-center gap-2 hover:text-blue-500 transition"><MessageSquare className="w-5 h-5" /> 0</button>
              <button className="flex items-center gap-2 hover:text-green-500 transition"><Share2 className="w-5 h-5" /> Share</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
