import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Calendar, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';
import { Countdown } from './Countdown';

interface CountdownSectionProps {
  onOpenRegister: () => void;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({ onOpenRegister }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="countdown"
      aria-label="Official Event Countdown"
      className="py-24 sm:py-32 bg-[#0C0D0D] border-t border-white/5 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#7EE647] uppercase">
            THE COUNTDOWN IS ON
          </span>
          <span className="w-12 h-[2px] bg-[#7EE647]" />
        </motion.div>

        {/* Section Headline & Description */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end mb-16">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-8"
          >
            <h2
              className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white leading-tight mb-4"
              style={{ textWrap: 'balance' }}
            >
              YOUR NEXT CHAPTER <br />
              <span className="text-[#7EE647]">STARTS HERE.</span>
            </h2>
            <p className="text-base sm:text-xl text-neutral-300 font-body leading-relaxed max-w-2xl">
              One day can change the way you see your future. Get ready for SHIFT 1.0.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.15 }}
            className="lg:col-span-4 flex lg:justify-end"
          >
            <button
              type="button"
              onClick={onOpenRegister}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#7EE647] hover:bg-[#90f05d] text-[#050505] font-display font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-xl shadow-[#7EE647]/10 active:scale-95 cursor-pointer whitespace-nowrap min-h-[44px] focus-visible:outline-2 focus-visible:outline-white"
            >
              <span>SECURE ADMISSION</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>

        {/* Main Countdown Canvas */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="p-6 sm:p-12 bg-[#050505] border border-white/15 relative overflow-hidden shadow-2xl mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-white/10 gap-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#7EE647] uppercase tracking-wider">
              <span>SHIFT 1.0 STARTS IN</span>
              <span className="text-neutral-500">·</span>
              <span className="text-neutral-400">TIMEZONE: AFRICA/ACCRA (GMT)</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500">
              TARGET: 28 NOVEMBER 2026 @ 09:00 AM
            </span>
          </div>

          {/* Dynamic Countdown Component (with 2x2 grid on mobile) */}
          <div className="max-w-4xl mx-auto py-2">
            <Countdown />
          </div>

          {/* Quick Details Bar */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.2 }}
            className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-body text-neutral-300"
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#7EE647] shrink-0" />
              <span>{EVENT_DETAILS.dateDisplay}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#7EE647] shrink-0" />
              <span>{EVENT_DETAILS.timeDisplay} (GMT)</span>
            </div>
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-[#7EE647] shrink-0" />
              <span className="truncate">{EVENT_DETAILS.venue}</span>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};
