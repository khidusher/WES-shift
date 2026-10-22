import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, ArrowUp, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

interface FooterProps {
  onOpenRegister: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenRegister }) => {
  const shouldReduceMotion = useReducedMotion();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Vision', href: '#vision' },
    { label: 'Pillars', href: '#pillars' },
    { label: 'Mentorship', href: '#mentorship' },
    { label: 'Speakers', href: '#speakers' },
    { label: 'Countdown', href: '#countdown' },
    { label: 'Venue & Logistics', href: '#venue' },
  ];

  return (
    <footer className="bg-[#050505] border-t border-white/10 text-white relative overflow-hidden">
      
      {/* ======================================================== */}
      {/* FINAL REGISTRATION CALL TO ACTION BANNER */}
      {/* ======================================================== */}
      <section
        aria-label="Final Call to Action"
        className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-[#050505] via-[#090b09] to-[#050505]"
      >
        <div className="absolute inset-0 cinematic-grain opacity-20 pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.span
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="inline-block text-xs font-mono text-[#7EE647] tracking-widest uppercase mb-4 font-bold"
          >
            CONVOCATION REGISTRATION
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-white leading-[0.95] mb-6"
            style={{ textWrap: 'balance' }}
          >
            DON’T JUST EARN A DEGREE. <br />
            <span className="text-[#7EE647] inline-block">BUILD A LEGACY.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.2 }}
            className="max-w-2xl mx-auto text-base sm:text-xl text-neutral-300 font-body mb-10 leading-relaxed"
          >
            Your career matters. Your purpose matters. The impact you leave behind matters.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              type="button"
              onClick={onOpenRegister}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-[#7EE647] hover:bg-[#90f05d] text-[#050505] font-display font-black text-sm uppercase tracking-wider transition-all duration-200 shadow-2xl shadow-[#7EE647]/20 active:scale-95 cursor-pointer min-h-[48px] focus-visible:outline-2 focus-visible:outline-white"
            >
              <span>REGISTER FOR SHIFT 1.0</span>
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* FOOTER NAVIGATION & INFORMATION ARCHITECTURE */}
      {/* ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Brand Wordmark & Vision Statement */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-5 flex flex-col gap-4"
          >
            <a
              href="#"
              className="flex items-center gap-2 text-3xl font-display font-black tracking-tighter text-white hover:text-[#7EE647] transition-colors w-fit"
            >
              <span>SHIFT</span>
              <span className="text-[#7EE647]">1.0</span>
            </a>
            
            <p className="text-sm text-neutral-300 font-body max-w-md leading-relaxed">
              “A Christ-centered experience building careers, discovering purpose and creating lasting impact.”
            </p>

            <div className="pt-2 flex flex-col gap-1 text-xs text-neutral-400 font-body">
              <span>Organized by <strong>Worldwide Evangelism Service (WES)</strong></span>
              <span>In collaboration with <strong>UENR SCC</strong></span>
            </div>
          </motion.div>

          {/* Quick Page Navigation */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.1 }}
            className="md:col-span-3 flex flex-col gap-3 font-body text-xs"
          >
            <span className="font-mono text-xs uppercase tracking-wider text-white font-bold mb-1">
              EXPLORE SHIFT
            </span>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-neutral-400 hover:text-[#7EE647] transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={onOpenRegister}
                  className="text-[#7EE647] hover:text-[#90f05d] font-bold uppercase tracking-wider cursor-pointer text-left"
                >
                  Register Now →
                </button>
              </li>
            </ul>
          </motion.div>

          {/* Event Brief Logistics */}
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.2 }}
            className="md:col-span-4 flex flex-col gap-3 font-body text-xs text-neutral-400"
          >
            <span className="font-mono text-xs uppercase tracking-wider text-white font-bold mb-1">
              CONVOCATION COORDINATES
            </span>
            <div className="flex items-start gap-2.5 text-neutral-300">
              <Calendar className="w-4 h-4 text-[#7EE647] shrink-0 mt-0.5" />
              <span>{EVENT_DETAILS.dateDisplay}</span>
            </div>
            <div className="flex items-start gap-2.5 text-neutral-300">
              <Clock className="w-4 h-4 text-[#7EE647] shrink-0 mt-0.5" />
              <span>{EVENT_DETAILS.timeDisplay} (Africa/Accra GMT)</span>
            </div>
            <div className="flex items-start gap-2.5 text-neutral-300">
              <MapPin className="w-4 h-4 text-[#7EE647] shrink-0 mt-0.5" />
              <span>Old Auditorium, UENR, Sunyani, Ghana</span>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-1.5 text-xs text-[#7EE647] hover:text-[#90f05d] font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#7EE647]"
              >
                <span>Back to Top</span>
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>

        </div>

        {/* Bottom Sub-footer with Dynamic Year */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-body">
          <p>© {new Date().getFullYear()} SHIFT 1.0. All rights reserved.</p>
          <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
            <span>BEYOND THE DEGREE</span>
            <span>·</span>
            <span>BUILD YOUR PURPOSE</span>
            <span>·</span>
            <span>LEAVE A LEGACY</span>
          </div>
        </div>
      </div>

    </footer>
  );
};
