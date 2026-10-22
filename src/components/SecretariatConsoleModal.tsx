import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeCameraScanConfig } from 'html5-qrcode';
import {
  X,
  Camera,
  CameraOff,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  Users,
  ShieldCheck,
  KeyRound,
  Download,
  ExternalLink,
  ChevronRight,
  Activity,
  FileSpreadsheet,
  Lock,
  LogOut,
  Sparkles,
  Info
} from 'lucide-react';

interface AttendanceStats {
  totalRegistrations: number;
  checkedInCount: number;
  remainingCount: number;
  checkInPercentage: number;
  syncedCount: number;
  pendingCount: number;
  failedCount: number;
}

interface RegistrationItem {
  ticketId: string;
  fullName: string;
  email: string;
  category: string;
  institution: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  syncStatus: 'synced' | 'pending' | 'failed' | 'not_synced';
  syncError?: string;
}

interface AuditLogItem {
  id: string;
  ticketId: string;
  attendeeName: string;
  scannedAt: string;
  scannedBy: string;
  status: 'first_checkin' | 'duplicate_attempt' | 'invalid_ticket' | 'cancelled_ticket';
  syncStatus: string;
  notes?: string;
}

interface SecretariatConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecretariatConsoleModal: React.FC<SecretariatConsoleModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Authentication State
  const [accessKey, setAccessKey] = useState<string>('Admin@shift1.0');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [operatorName, setOperatorName] = useState<string>('Secretariat Desk 1');

  // Navigation State
  const [activeTab, setActiveTab] = useState<'scanner' | 'dashboard' | 'webhook'>('scanner');

  // Scanner State
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isStartingCamera, setIsStartingCamera] = useState<boolean>(false);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraPermissionState, setCameraPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualTicketInput, setManualTicketInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [lastCheckinResult, setLastCheckinResult] = useState<{
    type: 'success' | 'warning' | 'error' | 'sync_pending';
    message: string;
    ticketId: string;
    attendee?: {
      fullName: string;
      category: string;
      institution: string;
      checkedInAt?: string;
      checkedInBy?: string;
      syncStatus?: string;
    };
  } | null>(null);

  // Dashboard & Sync State
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'all' | 'checked_in' | 'pending_checkin' | 'sync_pending'>('all');
  const [isRetryingSync, setIsRetryingSync] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Config Status
  const [configStatus, setConfigStatus] = useState<{
    isConfigured: boolean;
    webhookConfigured: boolean;
    secretConfigured: boolean;
    maskedUrl: string;
  } | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isProcessingFrame = useRef<boolean>(false);
  const lastScannedTicketRef = useRef<string>('');
  const lastScanTimestampRef = useRef<number>(0);

  // Load config & verify auth
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessKey: accessKey.trim() }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem('shift_secretariat_key', accessKey.trim());
        refreshDashboardData();
        fetchConfigStatus();
      } else {
        setAuthError('Invalid Access Key. Please contact the Secretariat lead.');
      }
    } catch {
      setAuthError('Could not connect to server.');
    }
  };

  // Check saved session on open
  useEffect(() => {
    if (isOpen) {
      const saved = sessionStorage.getItem('shift_secretariat_key');
      if (saved) {
        setAccessKey(saved);
        setIsAuthenticated(true);
        refreshDashboardData();
        fetchConfigStatus();
      }
      document.body.style.overflow = 'hidden';
    } else {
      stopScanner();
      document.body.style.overflow = '';
    }
    return () => {
      stopScanner();
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const fetchConfigStatus = async () => {
    try {
      const res = await fetch('/api/config-status');
      if (res.ok) {
        const data = await res.json();
        setConfigStatus(data);
      }
    } catch {
      // ignore
    }
  };

  const refreshDashboardData = async () => {
    const key = accessKey || sessionStorage.getItem('shift_secretariat_key') || '';
    try {
      // Fetch stats
      const statsRes = await fetch('/api/stats', {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
        if (data.recentActivity) {
          setRecentLogs(data.recentActivity);
        }
      }

      // Fetch registrations
      const regRes = await fetch(`/api/registrations?query=${encodeURIComponent(searchQuery)}&filter=${filterMode}`, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (regRes.ok) {
        const regData = await regRes.json();
        setRegistrations(regData.registrations || []);
      }
    } catch (err) {
      console.warn('Dashboard refresh deferred:', err);
    }
  };

  // When filters or search change, refresh attendee list
  useEffect(() => {
    if (isAuthenticated) {
      refreshDashboardData();
    }
  }, [searchQuery, filterMode, isAuthenticated]);

  // Audio tone feedback for scanners
  const playBeep = (type: 'success' | 'warning' | 'error') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 tone
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'warning') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // AudioContext not allowed or not supported; fail silently
    }
  };

  // =========================================================================
  // CAMERA SCANNER CONTROLS (html5-qrcode)
  // =========================================================================
  // Safely enumerate cameras without crashing if permission is not yet granted
  const enumerateCamerasSafely = async (): Promise<Array<{ id: string; label: string }>> => {
    try {
      const devices = await Html5Qrcode.getCameras();
      if (devices && devices.length > 0) {
        const list = devices.map((d, index) => ({
          id: d.id,
          label: d.label || `Camera ${index + 1} (${d.id.substring(0, 6)})`,
        }));
        setCameras(list);
        return list;
      }
    } catch (e) {
      console.warn('Camera enumeration info:', e);
    }
    return [];
  };

  const startScanner = async () => {
    await startScannerWithCamera(selectedCameraId);
  };

  const startScannerWithCamera = async (targetCamId?: string) => {
    setCameraError(null);
    setIsStartingCamera(true);

    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Camera access is not supported by your browser or environment. Please use Manual Ticket Entry below.'
      );
      setIsStartingCamera(false);
      return;
    }

    try {
      // 1. Ensure any previous instance is stopped and cleared
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
          html5QrCodeRef.current.clear();
        } catch (stopErr) {
          console.warn('Pre-scan stop error:', stopErr);
        }
      }

      // 2. Ensure container element exists
      const container = document.getElementById('qr-reader-viewport');
      if (!container) {
        throw new Error('QR reader viewfinder was not found in the DOM.');
      }

      // 3. Prompt user for camera permission via getUserMedia if no cameras listed yet
      if (cameras.length === 0) {
        try {
          const testStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: 'environment' } },
          });
          // Immediately stop test stream tracks so camera is released for Html5Qrcode
          testStream.getTracks().forEach((track) => track.stop());
          const discovered = await enumerateCamerasSafely();
          if (discovered.length > 0 && !targetCamId && !selectedCameraId) {
            const backCam = discovered.find((d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
            );
            if (backCam) {
              setSelectedCameraId(backCam.id);
              targetCamId = backCam.id;
            }
          }
        } catch (permErr: any) {
          console.warn('Camera permission check result:', permErr);
          if (permErr.name === 'NotAllowedError' || permErr.name === 'PermissionDeniedError') {
            throw permErr;
          }
        }
      }

      // 4. Initialize Html5Qrcode instance
      const qrScanner = new Html5Qrcode('qr-reader-viewport', {
        verbose: false,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true,
        },
      });
      html5QrCodeRef.current = qrScanner;

      // 5. Dynamic responsive qrbox calculation that never overflows on small mobile screens
      const qrboxConfig = (viewfinderWidth: number, viewfinderHeight: number) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        const edge = Math.floor(minEdge * 0.72);
        const dimension = Math.max(160, Math.min(edge, 280));
        return { width: dimension, height: dimension };
      };

      const cameraConfig: Html5QrcodeCameraScanConfig = {
        fps: 15,
        qrbox: qrboxConfig,
        aspectRatio: 1.0,
      };

      const chosenCameraId = targetCamId || selectedCameraId;

      // 6. Start scanner with target camera ID or fallback facingModes
      if (chosenCameraId) {
        try {
          await qrScanner.start(
            chosenCameraId,
            cameraConfig,
            (decodedText) => handleScanSuccess(decodedText),
            () => {}
          );
        } catch (camErr) {
          console.warn('Specific camera ID failed, trying environment facingMode:', camErr);
          await qrScanner.start(
            { facingMode: 'environment' },
            cameraConfig,
            (decodedText) => handleScanSuccess(decodedText),
            () => {}
          );
        }
      } else {
        try {
          // Attempt mobile rear camera first
          await qrScanner.start(
            { facingMode: 'environment' },
            cameraConfig,
            (decodedText) => handleScanSuccess(decodedText),
            () => {}
          );
        } catch (rearErr) {
          console.warn('Rear camera unavailable, falling back to front/user camera:', rearErr);
          // Fallback to front/user camera (e.g. desktop webcams)
          await qrScanner.start(
            { facingMode: 'user' },
            cameraConfig,
            (decodedText) => handleScanSuccess(decodedText),
            () => {}
          );
        }
      }

      setIsScanning(true);
      setCameraPermissionState('granted');
      // Update camera enumeration now that stream is active
      enumerateCamerasSafely();
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      let message = err.message || 'Could not start camera feed.';
      if (err.name === 'NotAllowedError' || message.includes('Permission denied')) {
        message = 'Camera permission was denied. Tap the lock icon in your browser address bar to allow camera access, or use Manual Ticket Entry below.';
      } else if (err.name === 'NotFoundError' || message.includes('Requested device not found')) {
        message = 'No video camera detected on this device. Please use Manual Ticket Entry below.';
      } else if (err.name === 'NotReadableError' || message.includes('Source error')) {
        message = 'Camera is currently in use by another tab or app. Please close other camera apps and retry.';
      }
      setCameraError(message);
      setIsScanning(false);
      setCameraPermissionState('denied');
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Scanner stop warning:', err);
      }
    }
    setIsScanning(false);
  };

  const handleCameraChange = async (newCamId: string) => {
    setSelectedCameraId(newCamId);
    if (isScanning) {
      await stopScanner();
      setTimeout(() => {
        startScannerWithCamera(newCamId);
      }, 250);
    }
  };

  const handleFlipCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCam = cameras[nextIndex];
    if (nextCam) {
      await handleCameraChange(nextCam.id);
    }
  };

  // Process Scanned Ticket ID
  const handleScanSuccess = (rawText: string) => {
    if (!rawText || isProcessingFrame.current) return;

    const trimmed = rawText.trim().toUpperCase();

    // Debounce duplicate reads of the exact same code within 3 seconds
    const now = Date.now();
    if (trimmed === lastScannedTicketRef.current && now - lastScanTimestampRef.current < 3000) {
      return;
    }

    lastScannedTicketRef.current = trimmed;
    lastScanTimestampRef.current = now;

    // Trigger verification
    verifyTicket(trimmed);
  };

  // Perform server-authoritative check-in
  const verifyTicket = async (ticketId: string) => {
    if (isProcessingFrame.current) return;
    isProcessingFrame.current = true;
    setIsVerifying(true);

    const key = accessKey || sessionStorage.getItem('shift_secretariat_key') || '';

    try {
      const response = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          ticketId: ticketId.trim(),
          operatorId: operatorName,
          notes: 'Scanned via Secretariat Console',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Valid first-time check-in
        playBeep('success');
        const isPendingSync = data.syncStatus === 'pending' || data.syncStatus === 'failed';
        setLastCheckinResult({
          type: isPendingSync ? 'sync_pending' : 'success',
          message: data.message || `Delegate ${data.registration.fullName} successfully checked in!`,
          ticketId: data.registration.ticketId,
          attendee: data.registration,
        });
      } else if (data.code === 'ALREADY_CHECKED_IN') {
        // Duplicate check-in attempt
        playBeep('warning');
        setLastCheckinResult({
          type: 'warning',
          message: data.message || `Attendee was ALREADY checked in!`,
          ticketId: ticketId,
          attendee: data.registration,
        });
      } else {
        // Invalid, cancelled, or not found
        playBeep('error');
        setLastCheckinResult({
          type: 'error',
          message: data.error || 'Invalid or unregistered ticket ID.',
          ticketId: ticketId,
          attendee: data.registration,
        });
      }

      // Refresh numbers
      refreshDashboardData();
    } catch (err: any) {
      playBeep('error');
      setLastCheckinResult({
        type: 'error',
        message: 'Network error communicating with check-in verification server.',
        ticketId: ticketId,
      });
    } finally {
      setIsVerifying(false);
      // Small delay before unlocking camera frames
      setTimeout(() => {
        isProcessingFrame.current = false;
      }, 1000);
    }
  };

  // Manual input submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTicketInput.trim()) return;
    verifyTicket(manualTicketInput.trim());
    setManualTicketInput('');
  };

  // Retry failed or pending Google Apps Script syncs
  const handleRetrySync = async (targetTicketId?: string) => {
    setIsRetryingSync(true);
    setSyncFeedback(null);
    const key = accessKey || sessionStorage.getItem('shift_secretariat_key') || '';

    try {
      const res = await fetch('/api/sync/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({ ticketId: targetTicketId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSyncFeedback(data.message || `Synchronized ${data.syncedCount} records with Apps Script.`);
      } else {
        setSyncFeedback(data.message || data.error || 'Retry completed with some pending items.');
      }
      refreshDashboardData();
    } catch {
      setSyncFeedback('Unable to reach server to retry synchronization.');
    } finally {
      setIsRetryingSync(false);
    }
  };

  // Export Attendance CSV
  const handleExportCSV = () => {
    if (!registrations || registrations.length === 0) return;

    const headers = ['Ticket ID', 'Full Name', 'Category', 'Institution', 'Status', 'Checked In', 'Check-In Timestamp', 'Staff Operator', 'Sync Status'];
    const rows = registrations.map((r) => [
      `"${r.ticketId}"`,
      `"${r.fullName}"`,
      `"${r.category}"`,
      `"${r.institution.replace(/"/g, '""')}"`,
      `"${r.status}"`,
      r.checkedIn ? 'YES' : 'NO',
      `"${r.checkedInAt || ''}"`,
      `"${r.checkedInBy || ''}"`,
      `"${r.syncStatus}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SHIFT_1.0_Attendance_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="secretariat-console-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-md overflow-hidden"
    >
      <div className="relative w-full max-w-5xl h-[95vh] max-h-[850px] bg-[#080908] border border-[#7EE647]/50 shadow-2xl flex flex-col overflow-hidden text-left">
        
        {/* Top App Header */}
        <div className="flex items-center justify-between p-3.5 sm:px-6 bg-[#050505] border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#7EE647]/10 border border-[#7EE647]/30 flex items-center justify-center text-[#7EE647]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="secretariat-console-title" className="text-sm sm:text-base font-display font-black text-white uppercase tracking-wider">
                  Secretariat Console
                </h2>
                <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-[#7EE647] text-[#050505] font-black">
                  SHIFT 1.0
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-body">
                Official QR Ticket Check-In & Attendance Verification
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem('shift_secretariat_key');
                  setIsAuthenticated(false);
                }}
                title="Log out operator"
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Secretariat Console"
              className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Auth Gate if not logged in */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
            <div className="max-w-md w-full bg-[#050505] border border-white/15 p-6 sm:p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 bg-[#7EE647]/10 text-[#7EE647] border border-[#7EE647]/30 mb-2">
                  <KeyRound className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-display font-bold text-white">
                  Staff Authentication Required
                </h3>
                <p className="text-xs text-neutral-400 font-body leading-relaxed">
                  Enter your assigned Secretariat Access Key to unlock ticket verification, camera scanning, and attendance records.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="staff-passkey" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Secretariat Passkey
                  </label>
                  <input
                    id="staff-passkey"
                    type="password"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="Enter Secretariat Passkey"
                    className="w-full bg-[#090a09] border border-white/20 p-3 text-sm font-mono text-white focus:outline-none focus:border-[#7EE647]"
                  />
                  <p className="mt-1.5 text-[10px] text-neutral-500 font-mono">
                    Default: <span className="text-neutral-400">Admin@shift1.0</span> (or <span className="text-neutral-400">SHIFT2026-SECRETARIAT</span>)
                  </p>
                </div>

                <div>
                  <label htmlFor="staff-operator" className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Operator / Station Name
                  </label>
                  <input
                    id="staff-operator"
                    type="text"
                    value={operatorName}
                    onChange={(e) => setOperatorName(e.target.value)}
                    placeholder="e.g. Desk 1 - Main Entrance"
                    className="w-full bg-[#090a09] border border-white/20 p-3 text-sm font-body text-white focus:outline-none focus:border-[#7EE647]"
                  />
                </div>

                {authError && (
                  <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#7EE647] hover:bg-[#90f05d] text-[#050505] font-display font-black text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Unlock Secretariat Console
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Authenticated Staff Workspace */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Navigation Tabs */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0c0d0c] px-4 sm:px-6 shrink-0 overflow-x-auto">
              <div className="flex gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('scanner');
                  }}
                  className={`py-3 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'scanner'
                      ? 'border-[#7EE647] text-[#7EE647] bg-white/5'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>QR Scanner</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopScanner();
                    setActiveTab('dashboard');
                    refreshDashboardData();
                  }}
                  className={`py-3 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'dashboard'
                      ? 'border-[#7EE647] text-[#7EE647] bg-white/5'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Attendance Register ({stats?.checkedInCount || 0})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopScanner();
                    setActiveTab('webhook');
                    fetchConfigStatus();
                  }}
                  className={`py-3 px-3 sm:px-4 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'webhook'
                      ? 'border-[#7EE647] text-[#7EE647] bg-white/5'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Google Apps Script</span>
                </button>
              </div>

              {/* Status Indicator */}
              <div className="hidden md:flex items-center gap-3 text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#7EE647] animate-pulse" />
                  <span>Server Online</span>
                </span>
                <span>·</span>
                <span>{operatorName}</span>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-6 bg-[#080908]">
              
              {/* TAB 1: SCANNER & INSTANT CHECK-IN */}
              {activeTab === 'scanner' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                  
                  {/* Left Column: Camera Viewfinder & Controls */}
                  <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="bg-[#050505] border border-white/15 p-4 sm:p-5 flex flex-col flex-1">
                      
                      {/* Camera Selector & Start/Stop */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2">
                          <label htmlFor="cam-select" className="text-[11px] font-mono uppercase text-neutral-400">
                            Camera:
                          </label>
                          <select
                            id="cam-select"
                            value={selectedCameraId}
                            onChange={(e) => handleCameraChange(e.target.value)}
                            disabled={isStartingCamera}
                            className="bg-[#0c0d0c] border border-white/20 text-xs text-white px-2.5 py-1.5 font-mono focus:outline-none focus:border-[#7EE647] max-w-[200px] truncate"
                          >
                            {cameras.length > 0 ? (
                              cameras.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.label || `Camera ${c.id.substring(0, 8)}`}
                                </option>
                              ))
                            ) : (
                              <option value="">Auto-Detect (Rear / Front)</option>
                            )}
                          </select>

                          {cameras.length > 1 && (
                            <button
                              type="button"
                              onClick={handleFlipCamera}
                              title="Flip Camera (Front/Rear)"
                              className="p-1.5 bg-[#0c0d0c] hover:bg-white/10 text-neutral-300 hover:text-[#7EE647] border border-white/20 text-xs transition-colors cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isStartingCamera ? (
                            <button
                              type="button"
                              disabled
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold uppercase tracking-wider cursor-wait"
                            >
                              <RefreshCw className="w-4 h-4 animate-spin text-[#7EE647]" />
                              <span>Starting...</span>
                            </button>
                          ) : !isScanning ? (
                            <button
                              type="button"
                              onClick={startScanner}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#7EE647] hover:bg-[#90f05d] text-[#050505] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              <Camera className="w-4 h-4" />
                              <span>Start Camera</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={stopScanner}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              <CameraOff className="w-4 h-4" />
                              <span>Stop Camera</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Camera Permission Alert */}
                      {cameraError && (
                        <div className="mb-4 p-3 bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold">{cameraError}</p>
                              <p className="text-[11px] text-amber-300 mt-1">
                                Tips: Ensure no other app is using the camera. On mobile, tap the lock/settings icon in the URL bar to allow camera access, then tap Start Camera.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Viewport Box */}
                      <div className="relative flex-1 min-h-[280px] sm:min-h-[340px] bg-black border border-white/20 flex flex-col items-center justify-center overflow-hidden">
                        
                        {/* html5-qrcode target container */}
                        <div id="qr-reader-viewport" className="w-full h-full max-w-sm" />

                        {!isScanning && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#050505]">
                            <div className="p-4 rounded-full bg-white/5 border border-white/10 text-neutral-400">
                              <Camera className="w-8 h-8" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                                Camera is Standby
                              </h4>
                              <p className="text-xs text-neutral-400 max-w-xs mt-1">
                                Click "Start Camera" to scan delegate passes or enter the ticket ID below.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Scanner Overlay Corners */}
                        {isScanning && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            <div className="relative w-56 h-56 border border-white/20">
                              {/* Glowing target corners */}
                              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-[#7EE647]" />
                              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-[#7EE647]" />
                              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-[#7EE647]" />
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-[#7EE647]" />

                              {/* Scanning animation line */}
                              <div className="absolute left-0 right-0 h-[2px] bg-[#7EE647] shadow-[0_0_8px_#7EE647] animate-pulse top-1/2" />
                            </div>
                          </div>
                        )}

                        {/* Verification Loading Overlay */}
                        {isVerifying && (
                          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-10">
                            <RefreshCw className="w-8 h-8 text-[#7EE647] animate-spin" />
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                              Verifying with Firestore...
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Manual Entry Fallback */}
                      <form onSubmit={handleManualSubmit} className="mt-4 pt-3 border-t border-white/10">
                        <label htmlFor="manual-ticket" className="block text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-1.5">
                          Manual Ticket ID Entry:
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="manual-ticket"
                            type="text"
                            value={manualTicketInput}
                            onChange={(e) => setManualTicketInput(e.target.value.toUpperCase())}
                            placeholder="e.g. SHFT-7821-UENR"
                            className="flex-1 bg-[#0c0d0c] border border-white/20 px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#7EE647]"
                          />
                          <button
                            type="submit"
                            disabled={isVerifying || !manualTicketInput.trim()}
                            className="px-5 py-2 bg-[#7EE647] hover:bg-[#90f05d] text-[#050505] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                          >
                            Check In
                          </button>
                        </div>
                      </form>

                    </div>
                  </div>

                  {/* Right Column: Scan Result & Real-Time Feedback */}
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    
                    {/* Live Check-in Result Card */}
                    <div className="bg-[#050505] border border-white/15 p-4 sm:p-5 flex flex-col">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                        <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">
                          Verification Outcome
                        </span>
                        {lastCheckinResult && (
                          <span className="text-[10px] font-mono text-neutral-500">
                            ID: {lastCheckinResult.ticketId}
                          </span>
                        )}
                      </div>

                      {lastCheckinResult ? (
                        <div className="space-y-4">
                          
                          {/* Banner */}
                          {lastCheckinResult.type === 'success' && (
                            <div className="p-4 bg-green-950/60 border-2 border-green-500 text-green-200">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-5 h-5 text-[#7EE647] shrink-0" />
                                <span className="text-sm font-display font-black uppercase tracking-wider text-white">
                                  VERIFIED & CHECKED IN
                                </span>
                              </div>
                              <p className="text-xs text-green-300 font-body">
                                {lastCheckinResult.message}
                              </p>
                            </div>
                          )}

                          {lastCheckinResult.type === 'sync_pending' && (
                            <div className="p-4 bg-cyan-950/60 border-2 border-cyan-500 text-cyan-200">
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                                <span className="text-sm font-display font-black uppercase tracking-wider text-white">
                                  CHECKED IN (APPS SCRIPT PENDING)
                                </span>
                              </div>
                              <p className="text-xs text-cyan-300 font-body">
                                Attendance safely recorded in primary system. Google Sheets sync is pending.
                              </p>
                              <button
                                type="button"
                                onClick={() => handleRetrySync(lastCheckinResult.ticketId)}
                                disabled={isRetryingSync}
                                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 text-black text-xs font-bold uppercase tracking-wider hover:bg-cyan-400 cursor-pointer"
                              >
                                <RefreshCw className={`w-3 h-3 ${isRetryingSync ? 'animate-spin' : ''}`} />
                                <span>Retry Sync Now</span>
                              </button>
                            </div>
                          )}

                          {lastCheckinResult.type === 'warning' && (
                            <div className="p-4 bg-amber-950/60 border-2 border-amber-500 text-amber-200">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                                <span className="text-sm font-display font-black uppercase tracking-wider text-white">
                                  ALREADY CHECKED IN
                                </span>
                              </div>
                              <p className="text-xs text-amber-300 font-body">
                                {lastCheckinResult.message}
                              </p>
                              {lastCheckinResult.attendee?.checkedInAt && (
                                <p className="text-[11px] font-mono text-amber-400 mt-2">
                                  Original Check-in: {new Date(lastCheckinResult.attendee.checkedInAt).toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                          )}

                          {lastCheckinResult.type === 'error' && (
                            <div className="p-4 bg-red-950/60 border-2 border-red-500 text-red-200">
                              <div className="flex items-center gap-2 mb-1">
                                <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                                <span className="text-sm font-display font-black uppercase tracking-wider text-white">
                                  VERIFICATION REJECTED
                                </span>
                              </div>
                              <p className="text-xs text-red-300 font-body">
                                {lastCheckinResult.message}
                              </p>
                            </div>
                          )}

                          {/* Attendee Details Card */}
                          {lastCheckinResult.attendee && (
                            <div className="bg-[#0c0d0c] border border-white/10 p-3.5 space-y-2 text-xs font-body">
                              <div>
                                <span className="text-[10px] font-mono uppercase text-neutral-400 block">Delegate</span>
                                <div className="text-base font-bold text-white">
                                  {lastCheckinResult.attendee.fullName}
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-neutral-300">
                                <div>
                                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">Category</span>
                                  <span>{lastCheckinResult.attendee.category}</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-mono uppercase text-neutral-400 block">Ticket ID</span>
                                  <span className="font-mono text-[#7EE647]">{lastCheckinResult.ticketId}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-[10px] font-mono uppercase text-neutral-400 block">Department / Institution</span>
                                <span className="text-neutral-300">{lastCheckinResult.attendee.institution}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="py-12 text-center text-neutral-500 font-body text-xs space-y-2">
                          <Activity className="w-8 h-8 mx-auto text-neutral-600" />
                          <p>Awaiting first ticket scan.</p>
                          <p className="text-[11px] text-neutral-600">
                            Hold attendee QR code up to the camera or use manual input.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Quick Stats Summary */}
                    {stats && (
                      <div className="bg-[#050505] border border-white/15 p-4 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-xl font-mono font-bold text-white">{stats.totalRegistrations}</div>
                          <div className="text-[10px] font-mono text-neutral-400 uppercase">Registered</div>
                        </div>
                        <div>
                          <div className="text-xl font-mono font-bold text-[#7EE647]">{stats.checkedInCount}</div>
                          <div className="text-[10px] font-mono text-neutral-400 uppercase">Checked In</div>
                        </div>
                        <div>
                          <div className="text-xl font-mono font-bold text-neutral-300">{stats.remainingCount}</div>
                          <div className="text-[10px] font-mono text-neutral-400 uppercase">Remaining</div>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              )}

              {/* TAB 2: ATTENDANCE DASHBOARD & REGISTER */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  
                  {/* Top 4 KPI Metrics */}
                  {stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-[#050505] border border-white/15 p-4">
                        <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                          Total Valid Registrations
                        </span>
                        <div className="text-3xl font-display font-black text-white">
                          {stats.totalRegistrations}
                        </div>
                        <span className="text-[10px] text-neutral-400 mt-1 block">Official attendee base</span>
                      </div>

                      <div className="bg-[#050505] border border-white/15 p-4">
                        <span className="text-[10px] font-mono uppercase text-[#7EE647] block mb-1">
                          Total Checked In
                        </span>
                        <div className="text-3xl font-display font-black text-[#7EE647]">
                          {stats.checkedInCount}
                        </div>
                        <div className="w-full bg-white/10 h-1.5 mt-2 overflow-hidden">
                          <div
                            className="bg-[#7EE647] h-full transition-all"
                            style={{ width: `${stats.checkInPercentage}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-neutral-400 mt-1 block">
                          {stats.checkInPercentage}% of delegates present
                        </span>
                      </div>

                      <div className="bg-[#050505] border border-white/15 p-4">
                        <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                          Remaining Expected
                        </span>
                        <div className="text-3xl font-display font-black text-neutral-300">
                          {stats.remainingCount}
                        </div>
                        <span className="text-[10px] text-neutral-400 mt-1 block">Pending arrival at venue</span>
                      </div>

                      <div className="bg-[#050505] border border-white/15 p-4">
                        <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                          Google Sheets Sync
                        </span>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-display font-black text-green-400">
                            {stats.syncedCount}
                          </span>
                          <span className="text-xs font-mono text-neutral-400">
                            / {stats.checkedInCount}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-2">
                          <span>Pending: {stats.pendingCount + stats.failedCount}</span>
                          {(stats.pendingCount > 0 || stats.failedCount > 0) && (
                            <button
                              type="button"
                              onClick={() => handleRetrySync()}
                              disabled={isRetryingSync}
                              className="text-[#7EE647] hover:underline font-mono font-bold"
                            >
                              Retry All
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions & Search Filter Bar */}
                  <div className="bg-[#050505] border border-white/15 p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      
                      {/* Search */}
                      <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search by ticket ID, attendee name, or dept..."
                          className="w-full bg-[#090a09] border border-white/20 pl-9 pr-3 py-2 text-xs font-body text-white placeholder-neutral-500 focus:outline-none focus:border-[#7EE647]"
                        />
                      </div>

                      {/* Filter tabs */}
                      <div className="flex items-center gap-1 overflow-x-auto text-xs">
                        <button
                          type="button"
                          onClick={() => setFilterMode('all')}
                          className={`px-3 py-1.5 font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                            filterMode === 'all'
                              ? 'bg-[#7EE647] text-[#050505]'
                              : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                          }`}
                        >
                          All ({registrations.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterMode('checked_in')}
                          className={`px-3 py-1.5 font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                            filterMode === 'checked_in'
                              ? 'bg-[#7EE647] text-[#050505]'
                              : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                          }`}
                        >
                          Checked In
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterMode('pending_checkin')}
                          className={`px-3 py-1.5 font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                            filterMode === 'pending_checkin'
                              ? 'bg-[#7EE647] text-[#050505]'
                              : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                          }`}
                        >
                          Pending Arrival
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterMode('sync_pending')}
                          className={`px-3 py-1.5 font-mono text-[11px] font-bold uppercase transition-colors cursor-pointer ${
                            filterMode === 'sync_pending'
                              ? 'bg-amber-400 text-black'
                              : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                          }`}
                        >
                          Sync Issues
                        </button>
                      </div>

                      {/* Export & Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleExportCSV}
                          className="inline-flex items-center gap-1.5 px-3 py-2 border border-white/20 hover:border-white text-xs font-semibold uppercase text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Export CSV</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => refreshDashboardData()}
                          className="p-2 border border-white/20 hover:border-white text-neutral-300 hover:text-white transition-colors cursor-pointer"
                          title="Refresh data"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                    {syncFeedback && (
                      <div className="p-2.5 bg-neutral-900 border border-neutral-700 text-xs text-neutral-300 flex items-center justify-between">
                        <span>{syncFeedback}</span>
                        <button
                          type="button"
                          onClick={() => setSyncFeedback(null)}
                          className="text-neutral-400 hover:text-white ml-2 text-xs"
                        >
                          Dismiss
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Attendee Register Table */}
                  <div className="bg-[#050505] border border-white/15 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#0c0d0c] border-b border-white/10 font-mono text-[11px] text-neutral-400 uppercase">
                        <tr>
                          <th className="py-3 px-4">Ticket ID</th>
                          <th className="py-3 px-4">Delegate Name</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Department / Affiliation</th>
                          <th className="py-3 px-4">Attendance</th>
                          <th className="py-3 px-4">Google Sheet Sync</th>
                          <th className="py-3 px-4 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-body">
                        {registrations.length > 0 ? (
                          registrations.map((reg) => (
                            <tr key={reg.ticketId} className="hover:bg-white/[0.02]">
                              <td className="py-3 px-4 font-mono font-bold text-[#7EE647] whitespace-nowrap">
                                {reg.ticketId}
                              </td>
                              <td className="py-3 px-4 text-white font-medium whitespace-nowrap">
                                {reg.fullName}
                              </td>
                              <td className="py-3 px-4 text-neutral-300 whitespace-nowrap">
                                {reg.category}
                              </td>
                              <td className="py-3 px-4 text-neutral-400 max-w-xs truncate">
                                {reg.institution}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                {reg.checkedIn ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-950 text-green-300 border border-green-700/50 text-[10px] font-mono">
                                    <CheckCircle2 className="w-3 h-3 text-[#7EE647]" />
                                    <span>PRESENT</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white/5 text-neutral-400 border border-white/10 text-[10px] font-mono">
                                    <span>PENDING</span>
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 whitespace-nowrap">
                                {reg.checkedIn ? (
                                  reg.syncStatus === 'synced' ? (
                                    <span className="text-[10px] font-mono text-green-400 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" />
                                      <span>SYNCED</span>
                                    </span>
                                  ) : reg.syncStatus === 'failed' ? (
                                    <button
                                      type="button"
                                      onClick={() => handleRetrySync(reg.ticketId)}
                                      title={reg.syncError || 'Sync failed, click to retry'}
                                      className="text-[10px] font-mono text-red-400 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      <span>FAILED (RETRY)</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleRetrySync(reg.ticketId)}
                                      className="text-[10px] font-mono text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                                    >
                                      <RefreshCw className="w-3 h-3" />
                                      <span>PENDING</span>
                                    </button>
                                  )
                                ) : (
                                  <span className="text-[10px] font-mono text-neutral-600">—</span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right whitespace-nowrap">
                                {!reg.checkedIn && reg.status !== 'cancelled' ? (
                                  <button
                                    type="button"
                                    onClick={() => verifyTicket(reg.ticketId)}
                                    className="px-2.5 py-1 bg-[#7EE647]/10 hover:bg-[#7EE647] text-[#7EE647] hover:text-black border border-[#7EE647]/30 text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer"
                                  >
                                    Check In
                                  </button>
                                ) : reg.checkedIn ? (
                                  <span className="text-[10px] font-mono text-neutral-500">
                                    {reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleTimeString() : 'Verified'}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono text-red-500">Cancelled</span>
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-neutral-500 font-body">
                              No registrations found matching criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Recent Activity Audit Stream */}
                  <div className="bg-[#050505] border border-white/15 p-4">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold mb-3 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[#7EE647]" />
                      <span>Live Secretariat Scan Audit Stream</span>
                    </h4>
                    <div className="divide-y divide-white/5 max-h-48 overflow-y-auto">
                      {recentLogs.length > 0 ? (
                        recentLogs.map((log) => (
                          <div key={log.id} className="py-2 flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2">
                              {log.status === 'first_checkin' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#7EE647]" />
                              ) : log.status === 'duplicate_attempt' ? (
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                              ) : (
                                <XCircle className="w-3.5 h-3.5 text-red-400" />
                              )}
                              <span className="text-white font-bold">{log.ticketId}</span>
                              <span className="text-neutral-400">({log.attendeeName})</span>
                            </div>
                            <div className="flex items-center gap-3 text-neutral-500 text-[11px]">
                              <span>{log.scannedBy}</span>
                              <span>{new Date(log.scannedAt).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-neutral-500 py-3">No scan events logged yet.</p>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: GOOGLE APPS SCRIPT WEBHOOK CONFIGURATION */}
              {activeTab === 'webhook' && (
                <div className="max-w-3xl mx-auto space-y-6">
                  
                  {/* Status Banner */}
                  <div className="bg-[#050505] border border-white/15 p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-[#7EE647]" />
                        <h3 className="text-sm font-display font-black uppercase tracking-wider text-white">
                          Google Apps Script Integration Status
                        </h3>
                      </div>
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                        configStatus?.isConfigured
                          ? 'bg-green-950 text-green-300 border border-green-500'
                          : 'bg-amber-950 text-amber-300 border border-amber-500'
                      }`}>
                        {configStatus?.isConfigured ? 'WEBHOOK CONFIGURED' : 'PENDING SETUP'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
                      <div>
                        <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                          Web App URL
                        </span>
                        <div className="font-mono text-neutral-300 bg-[#090a09] p-2.5 border border-white/10 truncate">
                          {configStatus?.maskedUrl || 'Not Configured'}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1">
                          Shared Secret Status
                        </span>
                        <div className="font-mono text-neutral-300 bg-[#090a09] p-2.5 border border-white/10 flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-[#7EE647]" />
                          <span>{configStatus?.secretConfigured ? 'Secured in Server Environment' : 'Missing (Set APPS_SCRIPT_SHARED_SECRET)'}</span>
                        </div>
                      </div>
                    </div>

                    {!configStatus?.isConfigured && (
                      <div className="p-3 bg-amber-950/40 border border-amber-500/40 text-amber-300 text-xs flex items-start gap-2">
                        <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                        <div>
                          <p className="font-bold">Google Sheets synchronization is currently pending deployment.</p>
                          <p className="text-[11px] text-amber-400 mt-0.5">
                            Check-in verification is 100% active and safely recorded in the primary database. Attendance records will queue with a "pending" status and can be synchronized once the webhook is deployed.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Deployment Walkthrough */}
                  <div className="bg-[#050505] border border-white/15 p-5 space-y-4">
                    <h4 className="text-xs font-mono uppercase tracking-wider text-[#7EE647] font-bold">
                      Deploying Your Apps Script Webhook (3-Minute Setup):
                    </h4>

                    <ol className="list-decimal list-inside space-y-3 text-xs text-neutral-300 font-body leading-relaxed">
                      <li>
                        <strong>Create a Google Sheet:</strong> Open <a href="https://sheets.google.com" target="_blank" rel="noreferrer" className="text-[#7EE647] underline">sheets.google.com</a> and name a new sheet <em>"SHIFT 1.0 — Attendance Register"</em>.
                      </li>
                      <li>
                        <strong>Open Script Editor:</strong> Click <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.
                      </li>
                      <li>
                        <strong>Paste Code:</strong> Copy the code from <code className="text-[#7EE647] font-mono">google-apps-script/attendance-webhook.gs</code> in this repository into your Apps Script editor.
                      </li>
                      <li>
                        <strong>Add Script Property:</strong> Go to <strong>Project Settings (gear icon ⚙️)</strong> &gt; <strong>Script Properties</strong> &gt; Add:
                        <div className="mt-1 p-2 bg-[#090a09] border border-white/10 font-mono text-[11px] text-[#7EE647]">
                          Property: SHIFT_SHARED_SECRET<br />
                          Value: [Choose your strong secret password]
                        </div>
                      </li>
                      <li>
                        <strong>Deploy Web App:</strong> Click <strong>Deploy</strong> &gt; <strong>New deployment</strong> &gt; Select type: <strong>Web app</strong>. Execute as: <em>Me</em>, Who has access: <em>Anyone</em>. Click <strong>Deploy</strong>.
                      </li>
                      <li>
                        <strong>Set Server Environment:</strong> Set <code className="text-[#7EE647] font-mono">APPS_SCRIPT_WEBAPP_URL</code> and <code className="text-[#7EE647] font-mono">APPS_SCRIPT_SHARED_SECRET</code> in your SHIFT 1.0 server configuration.
                      </li>
                    </ol>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleRetrySync()}
                        disabled={isRetryingSync}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#7EE647] hover:bg-[#90f05d] text-[#050505] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRetryingSync ? 'animate-spin' : ''}`} />
                        <span>Test Sync / Flush Pending Queue</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
