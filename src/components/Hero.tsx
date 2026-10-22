import React from 'react';
import { ArrowDown, ArrowUpRight, Calendar, Clock, MapPin, QrCode } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Countdown } from './Countdown';
import heroStageImg from '../assets/images/opt/hero_shift_stage.webp';

interface HeroProps {
  onOpenRegister: () => void;
  onOpenPass?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenRegister, onOpenPass }) => {
  const shouldReduceMotion = useReducedMotion();

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: { opacity: 1, y: 0 },
  };

  const wordContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const wordItem = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section
      id="hero"
      aria-label="Event Introduction"
      className="relative min-h-[92svh] sm:min-h-screen flex flex-col justify-between pt-24 sm:pt-28 pb-6 sm:pb-12 overflow-hidden bg-[#050505]"
    >
      {/* Background imagery with priority eager loading */}
      <motion.div
        initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="absolute inset-0 z-0 pointer-events-none"
      >
        <img
          src={heroStageImg}
          alt="SHIFT 1.0 Auditorium Stage Lighting"
          width="1376"
          height="768"
          decoding="async"
          className="w-full h-full object-cover object-center opacity-30 filter brightness-70 contrast-125"
          loading="eager"
          // @ts-ignore fetchPriority
          fetchPriority="high"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/85 to-[#050505]/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]" />
        <div className="absolute inset-0 cinematic-grain opacity-40" />
      </motion.div>

      {/* Main Content Hero Canvas */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center my-auto">
        
        {/* Eyebrow text */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : 0.05 }}
          className="flex items-center gap-2 mb-3 sm:mb-5 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-[#7EE647] uppercase"
        >
          <span className="w-5 sm:w-8 h-[2px] bg-[#7EE647] shrink-0" />
          <span className="truncate">WORLDWIDE EVANGELISM SERVICE × UENR SCC PRESENT</span>
        </motion.div>

        {/* Main headline with fluid sizing to prevent overflow on 320px+ phones */}
        <motion.div
          variants={wordContainer}
          initial="hidden"
          animate="visible"
          className="mb-4 sm:mb-6"
        >
          <h1
            className="text-[2.2rem] xs:text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-display font-black tracking-tighter text-white leading-[0.94] max-w-6xl break-words"
            style={{ textWrap: 'balance' }}
          >
            <motion.span variants={wordItem} className="inline-block mr-2 sm:mr-6">
              BEYOND
            </motion.span>
            <br className="inline" />
            <motion.span
              variants={wordItem}
              className="inline-block text-[#7EE647] hover:brightness-110 transition-all"
            >
              THE DEGREE.
            </motion.span>
          </h1>
        </motion.div>

        {/* Supporting headline & description */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.2 }}
          className="max-w-3xl mb-6 sm:mb-8"
        >
          <h2 className="text-base sm:text-2xl md:text-3xl font-display font-bold text-white tracking-tight uppercase mb-2 sm:mb-3 text-[#FFFFFF]">
            BUILDING YOUR CAREER, PURPOSE & LEGACY.
          </h2>
          <p className="text-sm sm:text-lg text-neutral-300 font-body leading-relaxed font-normal">
            A Christ-centered experience helping students discover direction, learn from experienced professionals and prepare for a life of meaningful impact.
          </p>
        </motion.div>

        {/* CTAs: Stacked vertically on phones for easy 1-handed tapping */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.3 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-10 w-full sm:w-auto"
        >
          <button
            type="button"
            onClick={onOpenRegister}
            className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-[#7EE647] hover:bg-[#90f05d] text-[#050505] font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-xl shadow-[#7EE647]/20 active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
          >
            <span>REGISTER NOW</span>
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {onOpenPass && (
            <button
              type="button"
              onClick={onOpenPass}
              className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-[#090a09] hover:bg-white/10 text-white border border-[#7EE647]/40 hover:border-[#7EE647] text-xs sm:text-sm font-semibold tracking-wider transition-all duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#7EE647]"
            >
              <QrCode className="w-4 h-4 text-[#7EE647]" />
              <span>DIGITAL DELEGATE PASS</span>
            </button>
          )}

          <a
            href="#vision"
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3.5 sm:py-4 bg-transparent hover:bg-white/5 text-neutral-300 hover:text-white border border-white/20 hover:border-white/50 text-xs sm:text-sm font-semibold tracking-wider transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#7EE647]"
          >
            <span>EXPLORE</span>
            <ArrowDown className="w-4 h-4" />
          </a>
        </motion.div>

        {/* Live Countdown in Hero */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.4 }}
          className="max-w-xl mb-3 sm:mb-4"
        >
          <div className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-2 flex items-center gap-2">
            <span>OFFICIAL CONVOCATION COUNTDOWN</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7EE647]" />
            <span className="text-neutral-500 font-mono text-[10px]">SUNYANI GMT</span>
          </div>
          <Countdown />
        </motion.div>

      </div>

      {/* Date & Venue Details Strip */}
      <motion.div
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.5 }}
        className="relative z-10 w-full border-t border-white/10 bg-[#050505]/95 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-6 text-xs text-neutral-300">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-[#7EE647] shrink-0" />
              <div>
                <span className="text-neutral-500 font-mono text-[10px] block">DATE</span>
                <span className="font-semibold text-white tracking-wide">SATURDAY, 28 NOVEMBER 2026</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-[#7EE647] shrink-0" />
              <div>
                <span className="text-neutral-500 font-mono text-[10px] block">TIME</span>
                <span className="font-semibold text-white tracking-wide">9:00 AM – 2:00 PM (GMT)</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#7EE647] shrink-0" />
              <div className="truncate">
                <span className="text-neutral-500 font-mono text-[10px] block">VENUE</span>
                <span className="font-semibold text-white tracking-wide truncate block">
                  OLD AUDITORIUM, UENR, SUNYANI
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Desktop subtle scroll indicator (CSS hardware accelerated) */}
      <div className="hidden lg:flex absolute bottom-16 right-8 z-20 flex-col items-center gap-2 pointer-events-none opacity-60">
        <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-400 rotate-90 origin-right translate-y-3">
          SCROLL
        </span>
        <div className="w-4 h-7 border border-white/20 rounded-full flex items-start justify-center p-1">
          <div className="w-1 h-1.5 bg-[#7EE647] rounded-full animate-bounce" />
        </div>
      </div>

    </section>
  );
};
