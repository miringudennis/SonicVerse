import { motion } from 'framer-motion';
import { FileText, ShieldAlert, Zap, Globe, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const TermsPage = () => {
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
          <Zap className="w-64 h-64 text-purple-500" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <Globe className="w-3 h-3" />
            <span>Network Directives v1.0</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-10">
            Terms of <br /> Service.
          </h1>

          <div className="space-y-12 text-gray-400 font-medium leading-relaxed">
            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <FileText className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-black uppercase italic tracking-tight">Usage Protocol</h2>
              </div>
              <p>
                By establishing a link with SonicVerse, you agree to operate within the defined parameters of our neural network. This includes respecting the intellectual property of synchronized archives and maintaining the integrity of the modular catalog.
              </p>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-black uppercase italic tracking-tight">Node Liability</h2>
              </div>
              <p>
                SonicVerse provides an interface for archive synthesis but is not responsible for the content retrieved from external streaming protocols. Users are responsible for maintaining the security of their local access keys and credentials.
              </p>
            </section>

            <section className="space-y-4">
               <h3 className="text-white font-black uppercase tracking-widest text-xs mb-4 border-l-2 border-purple-500 pl-4">Service Continuity</h3>
               <p>
                 We reserve the right to recalibrate or terminate node access if usage patterns deviate from the established network directives. Continuous synchronization is subject to the availability of external platform APIs.
               </p>
            </section>

            <div className="pt-12 border-t border-white/5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">
              Directive Issued: May 15, 2026 // SonicVerse Governance Unit
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
