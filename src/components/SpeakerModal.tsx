import React, { useEffect, useRef, useState } from 'react';
import { X, Building2, Calendar, MapPin, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { Speaker, EVENT_DETAILS } from '../data/eventData';

interface SpeakerModalProps {
  speaker: Speaker | null;
  onClose: () => void;
  onOpenRegister: () => void;
  triggerElementRef?: HTMLElement | null;
}

export const SpeakerModal: React.FC<SpeakerModalProps> = ({
  speaker,
  onClose,
  onOpenRegister,
  triggerElementRef,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [imageError, setImageError] = useState(false);

  // Focus trap, Escape key handling, and return-of-focus
  useEffect(() => {
    if (!speaker) {
      setImageError(false);
      return;
    }

    const previouslyFocused = triggerElementRef || (document.activeElement as HTMLElement);

    // Focus close button on open
    const timeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && dialogRef.current) {
        const focusableElements = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      // Return focus to triggering card
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [speaker, onClose, triggerElementRef]);

  if (!speaker) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="speaker-modal-title"
      aria-describedby="speaker-modal-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#090a09] border border-white/20 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-left"
      >
        {/* Close Button with >=44x44px touch target */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          type="button"
          aria-label="Close speaker profile dialog"
          className="absolute top-4 right-4 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer z-10 focus-visible:outline-2 focus-visible:outline-[#7EE647]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Category Header Label */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#7EE647] font-bold">
            {speaker.roleLabel}
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-[11px] font-mono text-neutral-400">SHIFT 1.0 FACULTY</span>
        </div>

        {/* Header Grid: Verified Portrait & Official Credentials */}
        <div className="flex flex-col sm:flex-row gap-6 items-start mb-6">
          <div className="w-28 h-36 sm:w-36 sm:h-44 shrink-0 bg-[#050505] border border-[#7EE647] overflow-hidden relative shadow-lg">
            {!imageError ? (
              <img
                src={speaker.imageUrl}
                alt={`Official portrait of ${speaker.name}`}
                className="w-full h-full object-cover object-top"
                loading="eager"
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#0d0f0d]">
                <span className="text-2xl font-display font-black text-white">{speaker.initials}</span>
                <span className="text-[9px] font-mono text-[#7EE647] uppercase mt-1">FACULTY</span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3
              id="speaker-modal-title"
              className="text-2xl sm:text-3xl font-display font-black text-white mb-2 leading-tight"
            >
              {speaker.name}
            </h3>
            <p className="text-base font-semibold text-[#7EE647] leading-snug mb-2 font-body">
              {speaker.role}
            </p>
            <p className="text-sm text-neutral-300 flex items-center gap-1.5 font-body">
              <Building2 className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>{speaker.organization}</span>
            </p>
          </div>
        </div>

        {/* Official Role Context (Strictly from verified credentials) */}
        <div className="pt-6 border-t border-white/10 space-y-4 font-body">
          <div className="p-4 bg-[#050505] border border-white/5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#7EE647]" />
              <span>Verified Role Details</span>
            </h4>
            <p id="speaker-modal-desc" className="text-sm text-neutral-200 leading-relaxed">
              {speaker.name} serves as {speaker.roleLabel} at SHIFT 1.0, holding the position of{' '}
              {speaker.role} at {speaker.organization}.
              {speaker.bioNote ? ` ${speaker.bioNote}` : ''}
            </p>
          </div>

          <div className="p-4 bg-[#050505] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="text-neutral-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#7EE647]" />
              <span>{EVENT_DETAILS.dateDisplay} ({EVENT_DETAILS.timeDisplay})</span>
            </div>
            <div className="text-neutral-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#7EE647]" />
              <span>{EVENT_DETAILS.venue}</span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons with >=44px touch targets */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-3 min-h-[44px] inline-flex items-center justify-center text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-[#7EE647] cursor-pointer active:scale-95"
          >
            Close Profile
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenRegister();
            }}
            type="button"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[44px] text-xs font-bold uppercase tracking-wider text-[#050505] bg-[#7EE647] hover:bg-[#90f05d] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-white active:scale-95"
          >
            <span>Register to Attend</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
