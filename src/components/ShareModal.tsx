import React, { useState, useEffect, useRef } from 'react';
import { X, Copy, Check, MessageCircle, Twitter } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerElementRef?: HTMLElement | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  triggerElementRef,
}) => {
  const [copied, setCopied] = useState(false);
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

  const pageUrl = typeof window !== 'undefined' ? window.location.href : 'https://shift1point0.com';
  const shareText = `Join me at SHIFT 1.0 — Beyond the Degree! Building Your Career, Purpose & Legacy on Saturday, 28 Nov 2026 at UENR Old Auditorium, Sunyani. Register here: ${EVENT_DETAILS.registrationUrl}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      'Beyond The Degree: Build Your Purpose, Leave a Legacy at SHIFT 1.0! #SHIFT1point0 #UENR'
    )}&url=${encodeURIComponent(pageUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#090a09] border border-white/15 p-6 sm:p-8 shadow-2xl text-left"
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          type="button"
          aria-label="Close share dialog"
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#7EE647]"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-[11px] font-mono uppercase tracking-widest text-[#7EE647] font-bold block mb-2">
          SPREAD THE WORD
        </span>

        <h3
          id="share-modal-title"
          className="text-2xl font-display font-black text-white mb-2"
        >
          Share SHIFT 1.0
        </h3>

        <p className="text-xs text-neutral-300 font-body mb-6">
          Invite colleagues, campus fellowships, students and mentors to experience SHIFT 1.0 at UENR Sunyani.
        </p>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={shareWhatsApp}
            className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#7EE647]"
          >
            <MessageCircle className="w-4 h-4 text-[#7EE647]" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={shareTwitter}
            className="flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#7EE647]"
          >
            <Twitter className="w-4 h-4 text-[#7EE647]" />
            <span>Twitter / X</span>
          </button>
        </div>

        {/* Copy Link input */}
        <div className="flex items-center gap-2 p-2 bg-[#050505] border border-white/15">
          <input
            type="text"
            readOnly
            value={pageUrl}
            aria-label="Event URL to copy"
            className="bg-transparent border-none text-xs text-neutral-300 w-full focus:outline-none px-2 font-mono"
          />
          <button
            type="button"
            onClick={copyToClipboard}
            className="p-2 bg-[#7EE647] text-[#050505] hover:bg-[#90f05d] transition-colors shrink-0 font-bold text-xs flex items-center gap-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
