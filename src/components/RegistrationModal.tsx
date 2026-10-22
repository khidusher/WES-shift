import React, { useEffect, useRef } from 'react';
import { X, CheckCircle2, Calendar, MapPin, ExternalLink } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerElementRef?: HTMLElement | null;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  triggerElementRef,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = triggerElementRef || (document.activeElement as HTMLElement);

    const timeout = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
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
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [isOpen, onClose, triggerElementRef]);

  if (!isOpen) return null;

  const handleProceedToForm = () => {
    window.open(EVENT_DETAILS.registrationUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#090a09] border border-[#7EE647]/40 p-6 sm:p-8 shadow-2xl text-left"
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={onClose}
          type="button"
          aria-label="Close registration dialog"
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#7EE647]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Tag */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#7EE647] font-bold">
            DELEGATE REGISTRATION
          </span>
          <span className="text-neutral-600">·</span>
          <span className="text-[11px] font-mono text-neutral-400">OFFICIAL PORTAL</span>
        </div>

        <h3
          id="registration-modal-title"
          className="text-2xl sm:text-3xl font-display font-black text-white mb-3 leading-tight"
        >
          Secure Your Seat for SHIFT 1.0
        </h3>

        <p className="text-sm text-neutral-300 font-body mb-6 leading-relaxed">
          You are about to proceed to the official SHIFT 1.0 delegate registration portal. Please ensure you provide accurate details so the secretariat can prepare your materials.
        </p>

        {/* Key Event Summary Pill-Free */}
        <div className="p-4 bg-[#050505] border border-white/10 space-y-2 mb-6 font-body text-xs text-neutral-300">
          <div className="flex items-center gap-2 text-white font-medium">
            <Calendar className="w-4 h-4 text-[#7EE647] shrink-0" />
            <span>{EVENT_DETAILS.dateDisplay} · {EVENT_DETAILS.timeDisplay} (GMT)</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <MapPin className="w-4 h-4 text-[#7EE647] shrink-0" />
            <span>{EVENT_DETAILS.venue}, Sunyani</span>
          </div>
        </div>

        {/* Delegate Checklist */}
        <div className="space-y-2.5 mb-8 text-xs text-neutral-300 font-body">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#7EE647] shrink-0 mt-0.5" />
            <span>Direct access to executive speakers, mentorship panels, and keynote address.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#7EE647] shrink-0 mt-0.5" />
            <span>Spiritual alignment session for career and divine purpose.</span>
          </div>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#7EE647] shrink-0 mt-0.5" />
            <span>Free admission hosted by WES in collaboration with UENR SCC.</span>
          </div>
        </div>

        {/* Proceed Action Button */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-neutral-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors focus-visible:outline-2 focus-visible:outline-[#7EE647]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleProceedToForm}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-display font-black uppercase tracking-wider text-[#050505] bg-[#7EE647] hover:bg-[#90f05d] transition-all shadow-lg shadow-[#7EE647]/20 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
          >
            <span>PROCEED TO OFFICIAL FORM</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
