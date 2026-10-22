import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, Share2, ArrowUpRight, QrCode, ShieldCheck } from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

interface NavbarProps {
  onOpenRegister: () => void;
  onOpenShare: () => void;
  onOpenPass?: () => void;
  onOpenSecretariat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenRegister,
  onOpenShare,
  onOpenPass,
  onOpenSecretariat,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on Escape key & lock scroll when open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Vision', href: '#vision' },
    { label: 'Pillars', href: '#pillars' },
    { label: 'Mentorship', href: '#mentorship' },
    { label: 'Speakers', href: '#speakers' },
    { label: 'Countdown', href: '#countdown' },
    { label: 'Venue', href: '#venue' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#050505]/95 backdrop-blur-md border-b border-white/10 shadow-2xl py-2.5 sm:py-3'
            : 'bg-gradient-to-b from-[#050505]/90 to-transparent py-3.5 sm:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 sm:gap-8">
            {/* Zone 1: Single element wordmark */}
            <a
              href="#"
              className="inline-flex items-center gap-1.5 sm:gap-2 min-h-[44px] min-w-[44px] text-xl sm:text-2xl font-display font-black tracking-tighter text-white whitespace-nowrap shrink-0 hover:text-[#7EE647] transition-colors focus-visible:outline-2 focus-visible:outline-[#7EE647]"
            >
              <span>SHIFT</span>
              <span className="text-[#7EE647]">1.0</span>
            </a>

            {/* Zone 2: Single-line clean text links (Desktop) */}
            <nav
              aria-label="Primary Navigation"
              className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-neutral-300"
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="whitespace-nowrap shrink-0 hover:text-[#7EE647] transition-colors relative py-2.5 px-1 min-h-[44px] inline-flex items-center focus-visible:outline-2 focus-visible:outline-[#7EE647] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#7EE647] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Zone 3: Actions + Pass + Secretariat + Share + Hamburger */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Delegate QR Pass Button */}
              {onOpenPass && (
                <button
                  type="button"
                  onClick={onOpenPass}
                  title="View Delegate Pass & QR Code"
                  aria-label="View Delegate Pass"
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] text-xs font-semibold uppercase tracking-wider text-white hover:text-[#7EE647] border border-white/10 hover:border-[#7EE647]/50 bg-white/5 transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-[#7EE647]" />
                  <span>My Pass</span>
                </button>
              )}

              {/* Secretariat Console Button */}
              {onOpenSecretariat && (
                <button
                  type="button"
                  onClick={onOpenSecretariat}
                  title="Secretariat Check-In Console"
                  aria-label="Secretariat Check-In Console"
                  className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-400 hover:text-[#7EE647] hover:bg-white/5 border border-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#7EE647] cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={onOpenShare}
                title="Share SHIFT 1.0"
                aria-label="Share Event Link"
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-[#7EE647] cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onOpenRegister}
                className="hidden sm:inline-flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 min-h-[44px] text-xs font-bold uppercase tracking-wider text-[#050505] bg-[#7EE647] hover:bg-[#90f05d] active:scale-95 transition-all shadow-lg shadow-[#7EE647]/10 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-white"
              >
                <span>REGISTER NOW</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>

              {/* Mobile menu trigger button with 44x44px touch target */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className="lg:hidden p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-300 hover:text-white border border-white/10 cursor-pointer focus-visible:outline-2 focus-visible:outline-[#7EE647]"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="lg:hidden fixed inset-x-0 top-[57px] bg-[#050505] border-b border-white/15 p-6 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200 max-h-[calc(100dvh-60px)] overflow-y-auto pb-safe"
          >
            <nav aria-label="Mobile Navigation" className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-semibold text-neutral-200 hover:text-[#7EE647] py-3 px-2 border-b border-white/5 flex items-center justify-between min-h-[44px] w-full focus-visible:outline-2 focus-visible:outline-[#7EE647]"
                >
                  <span>{link.label}</span>
                  <span className="text-[#7EE647] font-mono text-xs">→</span>
                </a>
              ))}
            </nav>
            <div className="pt-2 flex flex-col gap-3">
              {onOpenPass && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenPass();
                  }}
                  className="w-full py-3.5 text-center font-mono font-bold text-xs uppercase tracking-wider text-white border border-[#7EE647]/50 hover:bg-[#7EE647]/10 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
                >
                  <QrCode className="w-4 h-4 text-[#7EE647]" />
                  <span>View Delegate QR Pass</span>
                </button>
              )}

              {onOpenSecretariat && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSecretariat();
                  }}
                  className="w-full py-3 text-center font-mono font-semibold text-xs uppercase tracking-wider text-neutral-300 border border-white/10 hover:bg-white/5 transition-colors cursor-pointer min-h-[44px] flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-[#7EE647]" />
                  <span>Secretariat Check-In Console</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenRegister();
                }}
                className="w-full py-4 text-center font-display font-black text-xs uppercase tracking-wider text-[#050505] bg-[#7EE647] hover:bg-[#90f05d] transition-colors cursor-pointer min-h-[48px] shadow-lg shadow-[#7EE647]/10"
              >
                REGISTER FOR SHIFT 1.0
              </button>
              <p className="text-center text-xs text-neutral-400 font-body">
                {EVENT_DETAILS.dateDisplay} · {EVENT_DETAILS.city}
              </p>
            </div>
          </div>
        )}
      </header>

      {/* Backdrop overlay for mobile menu */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
          className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
        />
      )}
    </>
  );
};
