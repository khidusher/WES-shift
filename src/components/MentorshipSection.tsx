import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Lightbulb, Compass, Zap, ArrowUpRight } from 'lucide-react';

interface MentorshipSectionProps {
  onOpenRegister: () => void;
}

export const MentorshipSection: React.FC<MentorshipSectionProps> = ({ onOpenRegister }) => {
  const [activePanel, setActivePanel] = useState<number>(0);
  const shouldReduceMotion = useReducedMotion();

  const principles = [
    {
      index: '01',
      statement: 'Here is what I know.',
      context: 'The proven foundations, workplace principles and ethical standards learned through years of real responsibility.',
      icon: Lightbulb,
    },
    {
      index: '02',
      statement: 'Here is what I wish I knew.',
      context: 'The costly blind spots, unspoken corporate realities and early career lessons that textbooks and lectures never teach.',
      icon: Compass,
    },
    {
      index: '03',
      statement: 'Here is how you can get there faster.',
      context: 'Actionable mentorship and strategic guidance to help you advance with integrity, wisdom and accelerated focus.',
      icon: Zap,
    },
  ];

  return (
    <section
      id="mentorship"
      aria-label="Mentorship Storytelling"
      className="py-24 sm:py-32 bg-[#0C0D0D] border-t border-white/5 relative overflow-hidden"
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
            03 / WISDOM THAT MOVES YOU
          </span>
          <span className="w-12 h-[2px] bg-[#7EE647]" />
        </motion.div>

        {/* Section Headline & Intro */}
        <div className="max-w-4xl mb-16">
          <h2
            className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight text-white leading-tight mb-6"
            style={{ textWrap: 'balance' }}
          >
            LEARN FROM PEOPLE WHO HAVE{' '}
            <span className="text-[#7EE647]">WALKED THE PATH.</span>
          </h2>
          <p className="text-base sm:text-xl text-neutral-300 font-body leading-relaxed max-w-3xl">
            The journey beyond university becomes clearer when you learn from people who have navigated the challenges, made the decisions and gained the experience you are preparing for.
          </p>
        </div>

        {/* Three Connected Principles: Editorial Sequence */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
          {principles.map((item, idx) => {
            const Icon = item.icon;
            const isSelected = activePanel === idx;

            return (
              <motion.div
                key={item.index}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.6, delay: shouldReduceMotion ? 0 : idx * 0.15 }}
                onClick={() => setActivePanel(idx)}
                onMouseEnter={() => setActivePanel(idx)}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
                aria-label={`Principle ${item.index}: ${item.statement}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActivePanel(idx);
                  }
                }}
                className={`relative p-8 sm:p-10 border transition-all duration-300 flex flex-col justify-between cursor-pointer focus-visible:outline-2 focus-visible:outline-[#7EE647] ${
                  isSelected
                    ? 'bg-[#050505] border-[#7EE647] shadow-2xl shadow-[#7EE647]/10'
                    : 'bg-[#050505]/60 border-white/10 hover:border-white/30'
                }`}
              >
                <div>
                  {/* Top: Indicator Index & Icon */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-mono text-xs font-bold text-[#7EE647] tracking-widest uppercase">
                      PRINCIPLE {item.index}
                    </span>
                    <div
                      className={`p-2.5 transition-colors ${
                        isSelected
                          ? 'bg-[#7EE647] text-[#050505]'
                          : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Prominent Typographic Statement */}
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white tracking-tight leading-tight mb-4">
                    “{item.statement}”
                  </h3>

                  {/* Contextual Narrative */}
                  <p className="text-sm sm:text-base text-neutral-300 font-body leading-relaxed">
                    {item.context}
                  </p>
                </div>

                {/* Animated Bottom Marker */}
                <div className="pt-8 mt-6 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                    DIRECT MENTORSHIP
                  </span>
                  <div
                    className={`h-1.5 transition-all duration-300 ${
                      isSelected ? 'w-12 bg-[#7EE647]' : 'w-4 bg-white/20'
                    }`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Narrative Callout Block */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="p-8 sm:p-12 bg-[#050505] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-8"
        >
          <div className="max-w-2xl">
            <h4 className="text-xl sm:text-2xl font-display font-bold text-white mb-2">
              Learn Directly From Leaders Across Industry & Ministry
            </h4>
            <p className="text-sm text-neutral-300 font-body leading-relaxed">
              Step into purposeful conversations with leaders who share practical insights, career transitions, and Kingdom purpose on Saturday, 28 November 2026.
            </p>
          </div>

          <button
            onClick={onOpenRegister}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#7EE647] hover:bg-[#90f05d] text-[#050505] font-display font-black text-xs uppercase tracking-wider whitespace-nowrap shadow-lg shadow-[#7EE647]/10 transition-all duration-200 active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#FFFFFF]"
          >
            <span>RESERVE YOUR SEAT</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </motion.div>

      </div>
    </section>
  );
};
