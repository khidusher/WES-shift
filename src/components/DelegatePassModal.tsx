import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  X,
  QrCode,
  Download,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Sparkles,
  Printer,
  Copy,
  Check
} from 'lucide-react';
import { EVENT_DETAILS } from '../data/eventData';

export interface DelegatePassData {
  ticketId: string;
  fullName: string;
  category: string;
  institution: string;
  status: string;
  checkedIn: boolean;
  checkedInAt?: string;
  venue?: string;
  dateDisplay?: string;
  timeDisplay?: string;
}

interface DelegatePassModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTicketId?: string;
}

export const DelegatePassModal: React.FC<DelegatePassModalProps> = ({
  isOpen,
  onClose,
  initialTicketId,
}) => {
  const [ticketQuery, setTicketQuery] = useState(initialTicketId || 'SHFT-7821-UENR');
  const [passData, setPassData] = useState<DelegatePassData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const passCardRef = useRef<HTMLDivElement>(null);

  // Fetch or generate pass data
  const fetchPass = async (idOrQuery: string) => {
    setIsLoading(true);
    setErrorMsg(null);

    const clean = idOrQuery.trim();
    if (!clean) {
      setIsLoading(false);
      return;
    }

    try {
      // First try direct ticket ID route
      let res = await fetch(`/api/pass/${encodeURIComponent(clean)}`);
      if (!res.ok) {
        // Try query lookup (by email or partial)
        res = await fetch('/api/delegate/lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: clean }),
        });
      }

      if (res.ok) {
        const data = await res.json();
        if (data.pass) {
          setPassData(data.pass);
          generateQr(data.pass.ticketId);
          setIsLoading(false);
          return;
        }
      }

      // If network or not found
      setErrorMsg('No registration found for that Ticket ID or Email. Please check spelling or verify registration.');
    } catch {
      setErrorMsg('Unable to connect to verification server. Please retry.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate QR Code data URL
  const generateQr = async (text: string) => {
    try {
      // Pure ticket identifier encoded without sensitive personal info or secrets
      const url = await QRCode.toDataURL(text, {
        width: 320,
        margin: 1.5,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
      setQrDataUrl(url);
    } catch (err) {
      console.error('Failed to generate QR Code:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPass(initialTicketId || 'SHFT-7821-UENR');
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    }
  }, [isOpen, initialTicketId]);

  if (!isOpen) return null;

  const handleCopyTicket = () => {
    if (passData) {
      navigator.clipboard.writeText(passData.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pass-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#090a09] border border-[#7EE647]/50 shadow-2xl my-auto text-left overflow-hidden flex flex-col"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/10 bg-[#050505]">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#7EE647]" />
            <h3 id="pass-modal-title" className="text-sm sm:text-base font-display font-black uppercase tracking-wider text-white">
              Official Digital Delegate Pass
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close pass dialog"
            className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Lookup Bar */}
        <div className="p-4 sm:px-6 bg-[#0c0d0c] border-b border-white/5">
          <label htmlFor="ticket-search" className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-2">
            Lookup Pass by Ticket ID or Email:
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="ticket-search"
                type="text"
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPass(ticketQuery)}
                placeholder="e.g. SHFT-7821-UENR or your@uenr.edu.gh"
                className="w-full bg-[#050505] border border-white/15 px-3 py-2 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-[#7EE647]"
              />
            </div>
            <button
              type="button"
              onClick={() => fetchPass(ticketQuery)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7EE647] hover:bg-[#90f05d] text-[#050505] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isLoading ? '...' : 'Find'}</span>
            </button>
          </div>

          {/* Quick Demo Tickets */}
          <div className="mt-2.5 flex items-center gap-2 overflow-x-auto text-[10px] text-neutral-400">
            <span className="font-mono text-neutral-500 shrink-0">Sample Passes:</span>
            <button
              type="button"
              onClick={() => {
                setTicketQuery('SHFT-7821-UENR');
                fetchPass('SHFT-7821-UENR');
              }}
              className="hover:text-[#7EE647] underline underline-offset-2 shrink-0 cursor-pointer"
            >
              SHFT-7821-UENR
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setTicketQuery('SHFT-3104-UENR');
                fetchPass('SHFT-3104-UENR');
              }}
              className="hover:text-[#7EE647] underline underline-offset-2 shrink-0 cursor-pointer"
            >
              SHFT-3104-UENR
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => {
                setTicketQuery('SHFT-5519-UENR');
                fetchPass('SHFT-5519-UENR');
              }}
              className="hover:text-[#7EE647] underline underline-offset-2 shrink-0 cursor-pointer"
            >
              SHFT-5519-UENR (Faculty)
            </button>
          </div>

          {errorMsg && (
            <div className="mt-3 p-2.5 bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* The Digital Pass Card (Printable & Screen-Scannable) */}
        {passData && (
          <div className="p-4 sm:p-6 overflow-y-auto">
            <div
              ref={passCardRef}
              className="bg-[#050505] border-2 border-[#7EE647] p-5 sm:p-6 relative shadow-2xl space-y-5"
            >
              {/* Pass Top Branding */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-display font-black tracking-tight text-white">
                      SHIFT <span className="text-[#7EE647]">1.0</span>
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#7EE647]/10 text-[#7EE647] border border-[#7EE647]/30">
                      OFFICIAL DELEGATE
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 font-body">
                    {EVENT_DETAILS.theme} · Beyond the Degree
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-neutral-400 uppercase">Status</div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#7EE647]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="uppercase">{passData.status}</span>
                  </div>
                </div>
              </div>

              {/* Attendee Info & QR Code Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                
                {/* QR Code Container (High-contrast for scanning from screen or paper) */}
                <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-white border-2 border-white text-center">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`Scannable QR code for ticket ${passData.ticketId}`}
                      className="w-44 h-44 object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-xs text-black font-mono">
                      Generating QR...
                    </div>
                  )}
                  <div className="mt-1 text-[11px] font-mono font-black text-black tracking-widest uppercase">
                    {passData.ticketId}
                  </div>
                </div>

                {/* Delegate Details */}
                <div className="sm:col-span-7 space-y-3 font-body text-xs">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-0.5">
                      Attendee Name
                    </span>
                    <div className="text-lg font-display font-black text-white leading-tight">
                      {passData.fullName}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-0.5">
                        Category
                      </span>
                      <span className="text-white font-semibold">{passData.category}</span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-0.5">
                        Ticket ID
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-[#7EE647] font-bold">
                          {passData.ticketId}
                        </span>
                        <button
                          type="button"
                          onClick={handleCopyTicket}
                          title="Copy Ticket ID"
                          className="text-neutral-400 hover:text-white"
                        >
                          {copied ? <Check className="w-3.5 h-3.5 text-[#7EE647]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block mb-0.5">
                      Institution / Department
                    </span>
                    <span className="text-neutral-300 font-medium block">
                      {passData.institution}
                    </span>
                  </div>

                  {/* Check-In Status Pill */}
                  <div className="pt-1">
                    {passData.checkedIn ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-500/10 border border-green-500/40 text-green-400 text-[11px] font-mono">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>CHECKED IN AT VENUE</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#7EE647]/10 border border-[#7EE647]/30 text-[#7EE647] text-[11px] font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>READY FOR ENTRANCE SCAN</span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Event Logistics Badge */}
              <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-neutral-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-[#7EE647] shrink-0" />
                  <span>{EVENT_DETAILS.dateDisplay}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#7EE647] shrink-0" />
                  <span>{EVENT_DETAILS.timeDisplay} (GMT)</span>
                </div>
                <div className="flex items-center gap-2 sm:col-span-2 text-neutral-400">
                  <MapPin className="w-3.5 h-3.5 text-[#7EE647] shrink-0" />
                  <span>Old Auditorium, UENR Campus, Sunyani, Ghana</span>
                </div>
              </div>

              {/* Entrance Notice */}
              <div className="bg-[#0c0d0c] p-2.5 border border-white/10 text-[10px] text-neutral-400 font-body">
                <span className="text-[#7EE647] font-bold font-mono">INSPECTION NOTICE:</span> Present this QR code on your phone screen or bring a printed copy to the Secretariat Check-In Desk at the entrance of Old Auditorium.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-neutral-400 font-body">
                Keep this pass accessible on event morning.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/20 hover:border-white text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Pass</span>
                </button>
                {qrDataUrl && (
                  <a
                    href={qrDataUrl}
                    download={`SHIFT_1.0_Pass_${passData.ticketId}.png`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7EE647] hover:bg-[#90f05d] text-[#050505] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download QR</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
