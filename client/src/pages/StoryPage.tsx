import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePlayerStore } from '../store/playerStore';
import { Music, Volume2, ArrowDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface StoryBeat {
  time: number;
  text: string;
  mood: 'calm' | 'energetic' | 'melancholic' | 'intense';
  color: string;
}

const storyBeats: StoryBeat[] = [
  { time: 0, text: "The journey begins in silence", mood: 'calm', color: 'rgba(59, 130, 246, 0.2)' },
  { time: 5, text: "A single note resonates through the void", mood: 'calm', color: 'rgba(37, 99, 235, 0.3)' },
  { time: 10, text: "Pulse starts to quicken with the rhythm", mood: 'energetic', color: 'rgba(147, 51, 234, 0.3)' },
  { time: 15, text: "Colors bleed into the sonic landscape", mood: 'energetic', color: 'rgba(192, 38, 211, 0.4)' },
  { time: 20, text: "We lose ourselves in the melody", mood: 'intense', color: 'rgba(219, 39, 119, 0.5)' },
  { time: 25, text: "Floating between the beats", mood: 'melancholic', color: 'rgba(79, 70, 229, 0.3)' },
  { time: 30, text: "The story is written in frequency", mood: 'calm', color: 'rgba(30, 58, 138, 0.4)' },
];

export const StoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSong, currentTime, duration, isPlaying } = usePlayerStore();
  const [activeBeatIndex, setActiveBeatIndex] = useState(0);

  // Initialize Song
  useEffect(() => {
    setSong({
      id: id || 'demo',
      title: "Sonic Odyssey",
      artist_name: "SonicVerse Collective",
      audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      cover_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop"
    });
  }, [id, setSong]);

  // Sync scroll with music time (experimental/optional feature)
  useEffect(() => {
    const sections = gsap.utils.toArray<HTMLElement>('.story-section');
    
    sections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top center",
        onEnter: () => setActiveBeatIndex(index),
        onEnterBack: () => setActiveBeatIndex(index),
      });

      gsap.fromTo(section, 
        { opacity: 0, scale: 0.9, filter: 'blur(10px)' },
        {
          opacity: 1, scale: 1, filter: 'blur(0px)',
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            end: "top 20%",
            scrub: 1,
          }
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  const activeBeat = storyBeats[activeBeatIndex] || storyBeats[0];

  return (
    <div ref={containerRef} className="relative bg-black min-h-[500vh] text-white overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 transition-colors duration-1000 ease-in-out" style={{ backgroundColor: 'black' }}>
        <div
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: `radial-gradient(circle at center, ${activeBeat.color} 0%, transparent 70%)`,
          }}
        />
        
        {/* Animated Particles/Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
           <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full animate-pulse" />
           <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full animate-pulse" />
        </div>

        {/* Music Visualization Placeholder */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex items-end gap-1 h-12 opacity-50">
           {[...Array(20)].map((_, i) => (
             <div 
               key={i}
               className="w-1 bg-white/30 rounded-full"
               style={{ 
                 height: isPlaying ? `${Math.random() * 40 + 10}px` : '10px',
                 transition: 'height 0.2s ease-in-out'
               }}
             />
           ))}
        </div>
      </div>

      {/* Floating Instructions */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-400">
          <Volume2 className="w-4 h-4" />
          Music Experience
        </div>
        <ArrowDown className="w-4 h-4 animate-bounce" />
      </div>

      {/* Main Content Sections */}
      <div className="relative z-10 pt-40 px-6 max-w-5xl mx-auto">
        {storyBeats.map((beat, i) => (
          <section 
            key={i} 
            className="story-section h-[80vh] flex flex-col items-center justify-center text-center mb-40"
          >
            <div className="space-y-6">
              <span className="inline-block px-4 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
                Chapter 0{i + 1}
              </span>
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-tight">
                {beat.text}
              </h2>
              <div className="flex items-center justify-center gap-4 text-gray-500 font-mono text-sm">
                 <span className={currentTime >= beat.time ? "text-blue-500 font-bold" : ""}>
                   {Math.floor(beat.time / 60)}:{(beat.time % 60).toString().padStart(2, '0')}
                 </span>
                 <div className="w-8 h-[1px] bg-gray-800" />
                 <span className="uppercase tracking-widest text-[10px]">{beat.mood}</span>
              </div>
            </div>
          </section>
        ))}

        {/* End Section */}
        <section className="story-section h-screen flex items-center justify-center">
             <div className="text-center p-12 bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 shadow-2xl">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-600/20 rotate-12">
                   <Music className="w-10 h-10 text-white -rotate-12" />
                </div>
                <h3 className="text-5xl font-black mb-4 tracking-tight text-white">The song ends, but the story continues.</h3>
                <p className="text-gray-400 max-w-md mx-auto mb-10 text-lg">You've successfully navigated the sonic landscape of SonicVerse.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button className="px-10 py-4 bg-white text-black rounded-full font-black hover:scale-105 transition-transform">Share Discovery</button>
                  <button onClick={() => navigate('/dashboard')} className="px-10 py-4 bg-gray-900 border border-gray-800 rounded-full font-black hover:bg-gray-800 transition-colors">Return Home</button>
                </div>
             </div>
        </section>
      </div>

      {/* Audio Progress Bar (Top) */}
      <div className="fixed top-0 left-0 right-0 h-1.5 z-[60] bg-gray-900">
        <div 
          className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all duration-300"
          style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
        />
      </div>
    </div>
  );
};
