import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import aboutImg from '../assets/images/opt/about_scholars_mentorship.webp';

export const VisionSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="vision"
      aria-label="The Vision"
      className="relative py-20 sm:py-32 bg-[#0C0D0D] border-t border-white/5 overflow-hidden"
    >
      {/* Anchor alias for backwards compatibility */}
      <span id="about" className="absolute -top-24 left-0" aria-hidden="true" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Identifier & Label */}
        <motion.div
          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6"
        >
          <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#7EE647]">
            01 / THE VISION
          </span>
          <motion.span
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="w-8 sm:w-12 h-[2px] bg-[#7EE647] origin-left"
          />
        </motion.div>

        {/* Headline with fluid wrap */}
        <div className="max-w-4xl mb-10 sm:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-white leading-[1.08] break-words"
            style={{ textWrap: 'balance' }}
          >
            <span>YOUR DEGREE IS A FOUNDATION.</span>
            <br className="hidden sm:inline" />{' '}
            <span className="text-[#7EE647] inline-block">NOT THE FINISH LINE.</span>
          </motion.h2>
        </div>

        {/* Editorial Split: Prose & Photographic Frame (natural vertical stacking on mobile) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center mb-12 sm:mb-16">
          
          {/* Left: Body Narrative */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-7 flex flex-col gap-5 text-neutral-300 font-body text-sm sm:text-base lg:text-lg leading-relaxed"
          >
            <p className="text-base sm:text-xl text-white font-medium leading-relaxed">
              SHIFT 1.0 is a Christ-centered career, purpose and personal development experience designed to help university students look beyond their academic degrees and intentionally prepare for life, work, leadership and long-term impact.
            </p>

            <p className="text-neutral-300">
              Built on the conviction that education is a beginning rather than an endpoint, SHIFT bridges the gap between university and the professional world through practical conversations, mentorship, personal growth and spiritual direction.
            </p>

            {/* Supporting Statement as a striking editorial moment */}
            <div className="mt-2 p-5 sm:p-6 bg-[#050505] border border-[#7EE647]/40 relative overflow-hidden">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#7EE647] font-bold mb-1.5">
                MANDATE
              </div>
              <p className="text-base sm:text-xl font-display font-bold text-white tracking-tight leading-snug">
                THE NEXT CHAPTER STARTS WITH A SHIFT IN PERSPECTIVE.
              </p>
            </div>
          </motion.div>

          {/* Right: Photographic Frame */}
          <motion.div
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-5 relative mt-4 lg:mt-0"
          >
            <div className="relative border border-white/10 p-2 sm:p-2.5 bg-[#050505] shadow-2xl">
              <div className="overflow-hidden aspect-[4/3] relative">
                <img
                  src={aboutImg}
                  alt="Scholars and mentors at UENR engaged in purposeful conversation"
                  width="1200"
                  height="896"
                  decoding="async"
                  className="w-full h-full object-cover filter contrast-110"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
              </div>
              <div className="p-3 sm:p-4 bg-[#050505] flex items-center justify-between border-t border-white/5">
                <span className="text-[11px] sm:text-xs font-semibold text-neutral-400 uppercase tracking-wider font-body">
                  UENR CAMPUS · SUNYANI
                </span>
                <span className="text-[11px] sm:text-xs font-mono text-[#7EE647] font-semibold">
                  01 / VISION
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Conviction Pull Quote with mobile-friendly padding */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="p-6 sm:p-12 bg-[#050505] border border-white/10 relative overflow-hidden text-center"
        >
          <div className="max-w-4xl mx-auto">
            <span className="inline-block text-[11px] font-mono text-[#7EE647] tracking-widest uppercase mb-3 font-semibold">
              THE SHIFT AXIOM
            </span>
            <blockquote className="text-lg sm:text-2xl md:text-3xl font-display font-bold text-white leading-tight mb-3">
              “A successful career without purpose is incomplete. Purpose without God is misunderstood. And achievement without impact leaves an empty legacy.”
            </blockquote>
            <p className="text-[11px] sm:text-xs uppercase tracking-widest text-neutral-400 font-body">
              PREPARING INTENTIONALLY FOR WORK, LEADERSHIP & ETERNITY
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
