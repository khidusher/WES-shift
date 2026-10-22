import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  GraduationCap,
  Briefcase,
  Compass,
  Users,
  TrendingUp,
  Sparkles,
  Anchor,
  Crown,
  ChevronDown,
} from 'lucide-react';
import { PILLARS, Pillar } from '../data/eventData';

export const PillarsSection: React.FC = () => {
  const [activePillarId, setActivePillarId] = useState<string>('education');
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({
    education: true,
  });
  const shouldReduceMotion = useReducedMotion();

  const getPillarIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className={className} />;
      case 'Briefcase':
        return <Briefcase className={className} />;
      case 'Compass':
        return <Compass className={className} />;
      case 'Users':
        return <Users className={className} />;
      case 'TrendingUp':
        return <TrendingUp className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Anchor':
        return <Anchor className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      default:
        return <Sparkles className={className} />;
    }
  };

  const toggleMobilePillar = (id: string) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <section
      id="pillars"
      aria-label="Eight Pillars of SHIFT"
      className="py-24 sm:py-32 bg-[#050505] relative border-t border-white/5"
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
            02 / WHAT MOVES YOU FORWARD
          </span>
          <span className="w-12 h-[2px] bg-[#7EE647]" />
        </motion.div>

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6"
        >
          <div className="max-w-3xl">
            <h2
              className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white leading-tight"
              style={{ textWrap: 'balance' }}
            >
              EIGHT PILLARS. <br />
              <span className="text-[#7EE647]">ONE INTENTIONAL FUTURE.</span>
            </h2>
          </div>
          <p className="text-sm sm:text-base text-neutral-300 max-w-md font-body leading-relaxed">
            Discover the foundations that connect your education, professional journey, faith and lasting impact.
          </p>
        </motion.div>

        {/* Desktop Interactive Grid (2/3/4-columns based on viewport) */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PILLARS.map((pillar, idx) => {
            const isActive = activePillarId === pillar.id;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : idx * 0.05 }}
                onMouseEnter={() => setActivePillarId(pillar.id)}
                onClick={() => setActivePillarId(pillar.id)}
                tabIndex={0}
                role="button"
                aria-pressed={isActive}
                aria-label={`Pillar ${pillar.number}: ${pillar.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActivePillarId(pillar.id);
                  }
                }}
                className={`group relative p-6 cursor-pointer text-left transition-all duration-300 border flex flex-col justify-between min-h-[290px] focus-visible:outline-2 focus-visible:outline-[#7EE647] ${
                  isActive
                    ? 'bg-[#111311] border-[#7EE647] shadow-xl shadow-[#7EE647]/5'
                    : 'bg-[#090a09] border-white/10 hover:border-white/30'
                }`}
              >
                {/* Header: Number and Icon */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span
                      className={`font-mono text-sm font-bold transition-colors ${
                        isActive ? 'text-[#7EE647]' : 'text-neutral-500 group-hover:text-neutral-300'
                      }`}
                    >
                      {pillar.number}
                    </span>
                    <div
                      className={`p-2.5 transition-colors ${
                        isActive
                          ? 'bg-[#7EE647] text-[#050505]'
                          : 'bg-white/5 text-neutral-400 group-hover:text-white'
                      }`}
                    >
                      {getPillarIcon(pillar.iconName, 'w-5 h-5')}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-display font-black text-white mb-3 tracking-tight">
                    {pillar.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed font-body transition-colors ${
                      isActive ? 'text-neutral-200' : 'text-neutral-400 group-hover:text-neutral-300'
                    }`}
                  >
                    {pillar.description}
                  </p>
                </div>

                {/* Animated Neon Green Base Marker */}
                <div className="pt-6 mt-4">
                  <div
                    className={`h-[2px] w-full transition-all duration-300 ${
                      isActive ? 'bg-[#7EE647]' : 'bg-white/10 group-hover:bg-white/20'
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Mobile Touch-Friendly Expandable Cards */}
        <div className="md:hidden flex flex-col gap-3">
          {PILLARS.map((pillar, idx) => {
            const isExpanded = mobileExpanded[pillar.id] ?? false;
            return (
              <motion.div
                key={pillar.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : idx * 0.04 }}
                className={`border transition-colors duration-200 ${
                  isExpanded ? 'bg-[#111311] border-[#7EE647]' : 'bg-[#090a09] border-white/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleMobilePillar(pillar.id)}
                  aria-expanded={isExpanded}
                  className="w-full p-4 flex items-center justify-between gap-4 text-left focus-visible:outline-2 focus-visible:outline-[#7EE647]"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#7EE647]">
                      {pillar.number}
                    </span>
                    <div className="p-1.5 bg-white/5 text-[#7EE647]">
                      {getPillarIcon(pillar.iconName, 'w-4 h-4')}
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white text-base tracking-tight">
                        {pillar.title}
                      </h3>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7EE647] shrink-0 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-4 pb-4 border-t border-white/5 pt-3"
                    >
                      <p className="text-sm text-neutral-200 leading-relaxed font-body">
                        {pillar.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
