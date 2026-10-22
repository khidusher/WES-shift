import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import legacyImg from '../assets/images/opt/legacy_monumental_future.webp';

interface FaithSectionProps {
  onOpenRegister: () => void;
}

export const FaithSection: React.FC<FaithSectionProps> = ({ onOpenRegister }) => {
  const shouldReduceMotion = useReducedMotion();

  const foundationMarkers = [
    {
      num: '01 / TALENT',
      title: 'Natural Abilities',
      desc: 'Refining skills and technical acumen to operate at the pinnacle of competence.',
    },
    {
      num: '02 / VOCATION',
      title: 'Professional Work',
      desc: 'Viewing your career not as mere labor, but as a territory of service and excellence.',
    },
    {
      num: '03 / KINGDOM',
      title: 'Eternal Calling',
      desc: 'Anchoring all temporal achievements in God’s unwavering Word and purpose.',
    },
  ];

  return (
    <section className="relative py-28 sm:py-36 bg-[#0C0D0D] border-t border-white/5 overflow-hidden">
      {/* Background Architectural Canvas */}
      <div className="absolute inset-0 z-0">
        <img
          src={legacyImg}
          alt="Imposing academic and spiritual future architecture"
          width="1376"
          height="768"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center opacity-25 filter brightness-75 contrast-125"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D0D] via-[#0C0D0D]/90 to-[#0C0D0D]/70" />
        <div className="absolute inset-0 cinematic-grain opacity-30 pointer-events-none" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-[#7EE647]"
        >
          <span className="w-8 h-[2px] bg-[#7EE647]" />
          <span>FAITH, PURPOSE & ETERNAL LEGACY</span>
          <span className="w-8 h-[2px] bg-[#7EE647]" />
        </motion.div>

        {/* Master Headline */}
        <motion.h2
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tight text-white leading-[1.05] mb-8"
          style={{ textWrap: 'balance' }}
        >
          YOUR FUTURE IS BIGGER <br />
          <span className="text-[#7EE647]">THAN YOUR JOB TITLE.</span>
        </motion.h2>

        {/* Narrative Flow */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.15 }}
          className="max-w-3xl mx-auto space-y-6 text-base sm:text-xl text-neutral-200 font-body leading-relaxed mb-12"
        >
          <p>
            SHIFT is founded on the conviction that professional success and true purpose are incomplete without God. A brilliant career without divine grounding remains a fragile ambition.
          </p>

          <p className="text-neutral-300 text-sm sm:text-base">
            The experience is architected to move deliberately from practical workplace navigation toward a spiritual climax — concluding with the sharing of the Word of God to align every student’s skills, gifts, and ambitions with their eternal, divine calling.
          </p>
        </motion.div>

        {/* Triple Foundation Markers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12 text-left">
          {foundationMarkers.map((marker, index) => (
            <motion.div
              key={marker.num}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : index * 0.1 }}
              className="p-6 bg-[#050505]/90 border border-white/10 hover:border-[#7EE647]/50 transition-colors"
            >
              <span className="text-xs font-mono text-[#7EE647] font-bold block mb-1">{marker.num}</span>
              <h4 className="text-base font-bold text-white mb-2">{marker.title}</h4>
              <p className="text-xs text-neutral-400">{marker.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.25 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onOpenRegister}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#7EE647] hover:bg-[#90f05d] text-[#050505] font-display font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-xl shadow-[#7EE647]/10 cursor-pointer min-h-[48px] active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
          >
            <span>JOIN THE SHIFT CONVOCATION</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </motion.div>

      </div>
    </section>
  );
};
