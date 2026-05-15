import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto pb-20 px-4">
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="mb-8 flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
      </motion.button>

      <section className="bg-[#0a0a0a] rounded-[3rem] border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <Shield className="w-64 h-64 text-blue-500" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <Lock className="w-3 h-3" />
            <span>Privacy Protocol v1.0</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-10">
            Privacy <br /> Policy.
          </h1>

          <div className="space-y-12 text-gray-400 font-medium leading-relaxed">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <Eye className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-black uppercase italic tracking-tight">Data Synthesis</h2>
              </div>
              <p>
                SonicVerse synchronizes with your external streaming platforms (Spotify, YouTube Music, Apple Music) to analyze your auditory patterns. We do not store your raw credentials; all authentication is handled via secure OAuth 2.0 protocols.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-black uppercase italic tracking-tight">Information Grid</h2>
              </div>
              <p>
                The information we collect includes your public profile data, top artists, listening history, and playlists. This data is used exclusively to synthesize discovery experiences and map your position within the SonicVerse neural network.
              </p>
            </section>

            <section className="space-y-4">
               <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4 border-l-2 border-blue-500 pl-4">Neural Security</h3>
               <p>
                 Your data is protected by industry-standard encryption protocols. We do not sell your neural patterns to third-party entities. Your data remains your own, accessible only to authorized nodes within the network.
               </p>
            </section>

            <div className="pt-12 border-t border-white/5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
              Last Calibration: May 15, 2026 // SonicVerse Legal Node
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
