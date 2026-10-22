import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowUpRight, Building2 } from 'lucide-react';
import {
  MAIN_SPEAKERS,
  MODERATOR_HOST_PROFILE,
  WES_PRESIDENT_PROFILE,
  SHARED_BENJAMIN_DARKO,
  Speaker,
} from '../data/eventData';

const SpeakerModal = React.lazy(() =>
  import('./SpeakerModal').then((m) => ({ default: m.SpeakerModal }))
);

interface SpeakersSectionProps {
  onOpenRegister: () => void;
}

export const SpeakersSection: React.FC<SpeakersSectionProps> = ({ onOpenRegister }) => {
  const [activeSpeaker, setActiveSpeaker] = useState<Speaker | null>(null);
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const shouldReduceMotion = useReducedMotion();

  const handleOpenSpeaker = (speaker: Speaker, e: React.MouseEvent | React.KeyboardEvent) => {
    setTriggerEl(e.currentTarget as HTMLElement);
    setActiveSpeaker(speaker);
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section
      id="speakers"
      aria-label="Speakers and Event Leadership Directory"
      className="py-24 sm:py-32 bg-[#050505] border-t border-white/5 relative"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Identifier */}
        <motion.div
          initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-6"
        >
          <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#7EE647]">
            04 / THE PEOPLE BEHIND THE PERSPECTIVE
          </span>
          <span className="w-12 h-[2px] bg-[#7EE647]" />
        </motion.div>

        {/* Section Title & Supporting Copy */}
        <div className="max-w-4xl mb-16">
          <motion.h2
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white leading-tight mb-6"
            style={{ textWrap: 'balance' }}
          >
            MEET THE MINDS. <br />
            HEAR THE STORIES. <br />
            <span className="text-[#7EE647]">MOVE WITH PURPOSE.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.1 }}
            className="text-base sm:text-xl text-neutral-300 font-body leading-relaxed max-w-3xl"
          >
            “Learn from experienced leaders and professionals whose journeys span ministry, engineering, business, human resources, law, public service and organizational leadership.”
          </motion.p>
        </div>

        {/* ======================================================== */}
        {/* PART 1: EVENT LEADERSHIP SPOTLIGHTS (HOST & MODERATOR, WES PRESIDENT) */}
        {/* ======================================================== */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-3 border-b border-white/10 gap-2"
          >
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#7EE647]">
              EVENT LEADERSHIP & FACILITATION SPOTLIGHT
            </span>
            <span className="text-xs font-mono text-neutral-400">
              HOST & MODERATOR · WES PRESIDENT
            </span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl">
            
            {/* 1. HOST & MODERATOR SPOTLIGHT (MERGED) */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
              tabIndex={0}
              role="button"
              aria-haspopup="dialog"
              aria-label={`View Leadership Profile for ${MODERATOR_HOST_PROFILE.name}`}
              onClick={(e) => handleOpenSpeaker(MODERATOR_HOST_PROFILE, e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenSpeaker(MODERATOR_HOST_PROFILE, e);
                }
              }}
              className="group relative bg-[#090a09] border border-white/15 hover:border-[#7EE647] p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[#7EE647]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono font-black text-[#7EE647] tracking-widest uppercase px-2.5 py-1 bg-[#050505] border border-white/20">
                    HOST & MODERATOR
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    UENR & SHIFT 1.0
                  </span>
                </div>

                {/* Portrait */}
                <div className="relative aspect-[4/5] bg-[#050505] overflow-hidden border border-white/10 group-hover:border-[#7EE647] mb-5">
                  {!imageErrors['host-mod-darko'] ? (
                    <img
                      src={SHARED_BENJAMIN_DARKO.imageUrl}
                      alt={MODERATOR_HOST_PROFILE.name}
                      width="400"
                      height="500"
                      decoding="async"
                      className="w-full h-full object-cover object-top filter grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() => handleImageError('host-mod-darko')}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#0d0f0d]">
                      <span className="text-3xl font-display font-black text-white">{SHARED_BENJAMIN_DARKO.initials}</span>
                      <span className="text-[9px] font-mono text-[#7EE647] uppercase mt-2">HOST & MODERATOR</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090a09] via-transparent to-transparent opacity-80 pointer-events-none" />
                  <div className="absolute bottom-3 right-3 z-10 flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] min-w-[44px] bg-[#050505]/90 border border-white/20 text-white group-hover:text-[#050505] group-hover:bg-[#7EE647] text-[10px] sm:text-[11px] font-mono font-bold transition-all shadow-md">
                    <span>VIEW PROFILE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-display font-black text-white group-hover:text-[#7EE647] transition-colors leading-tight mb-1">
                  {MODERATOR_HOST_PROFILE.name}
                </h3>
                <p className="text-xs font-semibold text-[#7EE647] leading-snug mb-2 font-body">
                  {MODERATOR_HOST_PROFILE.role}
                </p>
                <p className="text-xs text-neutral-300 font-body mb-3">
                  {MODERATOR_HOST_PROFILE.organization}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 text-[11px] text-neutral-400 font-body">
                <span>Serving as University Chaplain, Campus Host & Summit Moderator guiding the convocation.</span>
              </div>
            </motion.div>

            {/* 2. WES PRESIDENT SPOTLIGHT */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: shouldReduceMotion ? 0 : 0.1 }}
              tabIndex={0}
              role="button"
              aria-haspopup="dialog"
              aria-label={`View President Profile for ${WES_PRESIDENT_PROFILE.name}`}
              onClick={(e) => handleOpenSpeaker(WES_PRESIDENT_PROFILE, e)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleOpenSpeaker(WES_PRESIDENT_PROFILE, e);
                }
              }}
              className="group relative bg-[#090a09] border border-white/15 hover:border-[#7EE647] p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-all duration-300 focus-visible:outline-2 focus-visible:outline-[#7EE647]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-mono font-black text-[#7EE647] tracking-widest uppercase px-2.5 py-1 bg-[#050505] border border-white/20">
                    WES PRESIDENT
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 uppercase">
                    ORGANIZATION
                  </span>
                </div>

                {/* Portrait */}
                <div className="relative aspect-[4/5] bg-[#050505] overflow-hidden border border-white/10 group-hover:border-[#7EE647] mb-5">
                  {!imageErrors['wes-sackitey'] ? (
                    <img
                      src={WES_PRESIDENT_PROFILE.imageUrl}
                      alt={WES_PRESIDENT_PROFILE.name}
                      width="400"
                      height="500"
                      decoding="async"
                      className="w-full h-full object-cover object-top filter grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      onError={() => handleImageError('wes-sackitey')}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-[#0d0f0d]">
                      <span className="text-3xl font-display font-black text-white">{WES_PRESIDENT_PROFILE.initials}</span>
                      <span className="text-[9px] font-mono text-[#7EE647] uppercase mt-2">PRESIDENT</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090a09] via-transparent to-transparent opacity-80 pointer-events-none" />
                  <div className="absolute bottom-3 right-3 z-10 flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] min-w-[44px] bg-[#050505]/90 border border-white/20 text-white group-hover:text-[#050505] group-hover:bg-[#7EE647] text-[10px] sm:text-[11px] font-mono font-bold transition-all shadow-md">
                    <span>VIEW PROFILE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-display font-black text-white group-hover:text-[#7EE647] transition-colors leading-tight mb-1">
                  {WES_PRESIDENT_PROFILE.name}
                </h3>
                <p className="text-xs font-semibold text-[#7EE647] leading-snug mb-2 font-body">
                  {WES_PRESIDENT_PROFILE.role}
                </p>
                <p className="text-xs text-neutral-300 font-body mb-3">
                  {WES_PRESIDENT_PROFILE.organization}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 text-[11px] text-neutral-400 font-body">
                <span>Executive Superintendent at Eni Ghana & President of WES.</span>
              </div>
            </motion.div>

          </div>
        </div>

        {/* ======================================================== */}
        {/* PART 2: THE EIGHT MAIN SPEAKERS DIRECTORY */}
        {/* ======================================================== */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-3 border-b border-white/10 gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#7EE647]">
              KEYNOTE & INDUSTRY SPEAKERS (8 PROFILES)
            </span>
            <span className="text-xs font-mono text-neutral-400">
              MINISTRY · ENGINEERING · HR · LAW · DEFENSE · MINING
            </span>
          </div>

          {/* Responsive Editorial Grid: 1-col on mobile (<430px), 2-col on tablet/compact, 4-col on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {MAIN_SPEAKERS.map((speaker, index) => {
              const hasImgError = imageErrors[speaker.id] ?? false;

              return (
                <motion.div
                  key={speaker.id}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : index * 0.05 }}
                  tabIndex={0}
                  role="button"
                  aria-haspopup="dialog"
                  aria-label={`View profile for ${speaker.name}, ${speaker.role} at ${speaker.organization}`}
                  onClick={(e) => handleOpenSpeaker(speaker, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleOpenSpeaker(speaker, e);
                    }
                  }}
                  className="group relative bg-[#090a09] border border-white/10 hover:border-[#7EE647] transition-all duration-300 flex flex-col justify-between cursor-pointer focus-visible:outline-2 focus-visible:outline-[#7EE647] overflow-hidden"
                >
                  {/* Portrait Area with Hover Treatment */}
                  <div className="relative aspect-[4/5] bg-[#050505] overflow-hidden border-b border-white/10">
                    {!hasImgError ? (
                      <img
                        src={speaker.imageUrl}
                        alt={`Portrait of ${speaker.name}`}
                        width="400"
                        height="500"
                        decoding="async"
                        className="w-full h-full object-cover object-top filter grayscale contrast-110 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => handleImageError(speaker.id)}
                      />
                    ) : (
                      /* Branded Fallback Placeholder with Initials and Name */
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#0d0f0d]">
                        <span className="text-3xl font-display font-black text-white group-hover:text-[#7EE647] transition-colors">
                          {speaker.initials}
                        </span>
                        <span className="text-xs font-mono text-neutral-400 uppercase mt-2">
                          {speaker.name}
                        </span>
                      </div>
                    )}

                    {/* Dark gradient scrim at the bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090a09] via-transparent to-transparent opacity-80 pointer-events-none" />

                    {/* Speaker number tag */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 bg-[#050505]/90 border border-white/20 text-[#7EE647] font-bold">
                        {speaker.roleLabel}
                      </span>
                    </div>

                    {/* Hover / mobile tap "VIEW PROFILE" affordance */}
                    <div className="absolute bottom-3 right-3 z-10 flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[44px] min-w-[44px] bg-[#050505]/90 border border-white/20 group-hover:border-[#7EE647] group-hover:bg-[#7EE647] text-white group-hover:text-[#050505] transition-all duration-200 shadow-md">
                      <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                        VIEW PROFILE
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </div>

                  {/* Card Information */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-[#090a09]">
                    <div>
                      <h3 className="text-lg font-display font-black text-white group-hover:text-[#7EE647] transition-colors leading-tight mb-2">
                        {speaker.name}
                      </h3>
                      <p className="text-xs font-semibold text-[#7EE647] leading-snug mb-3 font-body">
                        {speaker.role}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs text-neutral-400 font-body">
                      <Building2 className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                      <span className="truncate">{speaker.organization}</span>
                    </div>
                  </div>

                  {/* Bottom animated neon accent border on hover */}
                  <div className="h-[2px] w-full bg-white/5 group-hover:bg-[#7EE647] transition-colors duration-300" />
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* PART 3: POST-SPEAKER CALL TO ACTION */}
        {/* ======================================================== */}
        <div className="mt-20 p-8 sm:p-12 bg-[#090a09] border border-white/15 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#7EE647] block mb-2">
              RESERVE YOUR PLACE AT UENR SUNYANI
            </span>
            <h3 className="text-2xl sm:text-4xl font-display font-black text-white tracking-tight">
              READY TO MAKE YOUR SHIFT?
            </h3>
            <p className="mt-2 text-sm text-neutral-300 font-body leading-relaxed">
              Join university scholars and young leaders for direct engagement with these executives and ministers on Saturday, 28 November 2026.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenRegister}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 min-h-[48px] bg-[#7EE647] hover:bg-[#90f05d] text-[#050505] font-display font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-xl shadow-[#7EE647]/10 active:scale-95 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-white"
          >
            <span>REGISTER NOW</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Accessible Profile Dialog (Lazy Loaded on Demand) */}
      {activeSpeaker && (
        <React.Suspense fallback={null}>
          <SpeakerModal
            speaker={activeSpeaker}
            onClose={() => setActiveSpeaker(null)}
            onOpenRegister={onOpenRegister}
            triggerElementRef={triggerEl}
          />
        </React.Suspense>
      )}
    </section>
  );
};
