import React from 'react';
import { motion } from 'motion/react';
import { Compass, GraduationCap, Target, Quote } from 'lucide-react';
import aboutImg from '../assets/images/about_scholars_mentorship_1792567733399.jpg';

export const About: React.FC = () => {
  return (
    <section id="about" className="relative py-24 sm:py-32 bg-[#0C0D0D] border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-[#7EE647]">
            <span className="w-6 h-[2px] bg-[#7EE647]" />
            <span>THE SHIFT CONTEXT</span>
          </div>
          <h2
            className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white leading-tight"
            style={{ textWrap: 'balance' }}
          >
            YOUR DEGREE IS A FOUNDATION.{' '}
            <span className="text-[#7EE647]">NOT THE FINISH LINE.</span>
          </h2>
        </div>

        {/* 2-Column Split: Editorial Storytelling & Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20">
          
          {/* Left Column: Narrative Prose */}
          <div className="lg:col-span-7 flex flex-col gap-6 text-neutral-300 font-body text-base sm:text-lg leading-relaxed">
            <p className="text-xl sm:text-2xl text-white font-medium leading-relaxed">
              SHIFT 1.0 is a Christ-centered career, purpose and personal development experience designed to help university students look beyond their academic degrees and intentionally prepare for life, work, leadership and long-term impact.
            </p>

            <p>
              Thousands of students graduate every year armed with academic honors, yet find themselves unprepared for corporate politics, unwritten industry expectations, psychological pressures, and the existential question of identity.
            </p>

            <p>
              The event bridges the critical gap between university lecture halls and the professional arena by creating intentional space for practical learning, meaningful conversations, high-level executive mentorship, and spiritual direction.
            </p>

            {/* Shift Dimensions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/10">
              <div className="p-4 bg-[#050505] border border-white/5">
                <GraduationCap className="w-5 h-5 text-[#7EE647] mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">Academic Base</h4>
                <p className="text-xs text-neutral-400">Honoring scholarship as the preparatory stepping stone.</p>
              </div>

              <div className="p-4 bg-[#050505] border border-white/5">
                <Target className="w-5 h-5 text-[#7EE647] mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">Intentional Living</h4>
                <p className="text-xs text-neutral-400">Moving from reactive job-hunting to strategic life architecture.</p>
              </div>

              <div className="p-4 bg-[#050505] border border-white/5">
                <Compass className="w-5 h-5 text-[#7EE647] mb-2" />
                <h4 className="font-bold text-white text-sm mb-1">Divine Calling</h4>
                <p className="text-xs text-neutral-400">Synchronizing competence with God’s eternal Kingdom purpose.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative border border-white/10 p-2 bg-[#050505]">
              <div className="overflow-hidden aspect-[4/3] relative">
                <img
                  src={aboutImg}
                  alt="Ghanaian university students and mentors in discussion"
                  className="w-full h-full object-cover filter contrast-110 hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
              </div>
              <div className="p-4 bg-[#050505] flex items-center justify-between border-t border-white/5">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  UENR CAMPUS & BEYOND
                </span>
                <span className="text-xs font-mono text-[#7EE647]">
                  BUILD PURPOSE · NOV 2026
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Striking Visual Moment: Pull Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative my-8 p-8 sm:p-14 bg-[#050505] border border-[#7EE647]/30 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
            <Quote className="w-32 h-32 text-[#7EE647]/10" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <span className="inline-block text-xs font-mono text-[#7EE647] tracking-widest uppercase mb-4">
              THE CORE CONVICTION
            </span>
            <blockquote className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white leading-tight mb-6">
              “A successful career without purpose is incomplete. Purpose without God is misunderstood. And achievement without impact leaves an empty legacy.”
            </blockquote>
            <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-widest text-neutral-400 font-body">
              <span>SHIFT 1.0 GUIDING MANDATE</span>
              <span>·</span>
              <span className="text-[#7EE647]">UENR SUNYANI</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};
