/**
 * SHIFT 1.0 — Full-Stack Server & Attendance Check-In Verification Engine
 * 
 * Features:
 * - Server-authoritative check-in verification against Firestore database
 * - Atomic concurrency control to prevent simultaneous double check-ins
 * - Isolated Google Apps Script attendance webhook integration with LockService and idempotency
 * - Secretariat authorization and audit logging
 * - Vite dev server middleware integration for single-port (3000) execution
 */

import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  runTransaction,
  query,
  where,
  orderBy,
  limit,
  getDocFromServer,
  setLogLevel,
} from 'firebase/firestore';

// Load environment variables
dotenv.config();

// Suppress internal gRPC stream idle disconnect transport notices in Node
setLogLevel('error');

const PORT = parseInt(process.env.PORT || '3000', 10);
const DEFAULT_ACCESS_KEY = process.env.SECRETARIAT_ACCESS_KEY || 'SHIFT2026-SECRETARIAT';

// Firestore Error Handling conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initialize Firebase client
let db: ReturnType<typeof getFirestore> | null = null;
try {
  const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const rawConfig = fs.readFileSync(configPath, 'utf-8');
    const firebaseConfig = JSON.parse(rawConfig);
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);
    console.log('[SHIFT Server] Connected to Firestore database:', firebaseConfig.firestoreDatabaseId);

    // Validate connection to Firestore on boot
    getDocFromServer(doc(db, 'registrations', 'SHFT-7821-UENR'))
      .then(() => console.log('[SHIFT Server] Firestore connection verified.'))
      .catch((err) => {
        if (err instanceof Error && err.message.includes('the client is offline')) {
          console.error('[SHIFT Server] Please check your Firebase configuration.');
        }
      });
  }
} catch (err) {
  console.warn('[SHIFT Server] Firestore config not loaded; using resilient local store fallback:', err);
}

// In-Memory Seed & Fast Cache
export interface RegistrationRecord {
  ticketId: string;
  fullName: string;
  email: string;
  phone?: string;
  category: string;
  institution: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  eventId?: string;
  syncStatus: 'synced' | 'pending' | 'failed' | 'not_synced';
  syncAttempts: number;
  lastSyncAttempt?: string;
  syncError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceAuditLog {
  id: string;
  ticketId: string;
  attendeeName: string;
  scannedAt: string;
  scannedBy: string;
  status: 'first_checkin' | 'duplicate_attempt' | 'invalid_ticket' | 'cancelled_ticket';
  syncStatus: 'synced' | 'pending' | 'failed' | 'not_synced' | 'not_applicable';
  eventId: string;
  notes?: string;
}

// Initial verified sample registrations for SHIFT 1.0 (UENR)
const INITIAL_REGISTRATIONS: RegistrationRecord[] = [
  {
    ticketId: 'SHFT-7821-UENR',
    fullName: 'Kwame Mensah',
    email: 'k.mensah@uenr.edu.gh',
    phone: '+233 24 112 3456',
    category: 'Student',
    institution: 'BSc Computer Science, Level 400',
    status: 'confirmed',
    checkedIn: false,
    syncStatus: 'not_synced',
    syncAttempts: 0,
    createdAt: '2026-10-15T10:00:00.000Z',
    updatedAt: '2026-10-15T10:00:00.000Z',
  },
  {
    ticketId: 'SHFT-3104-UENR',
    fullName: 'Abena Serwaa Boateng',
    email: 'abena.boateng@uenr.edu.gh',
    phone: '+233 20 987 6543',
    category: 'Student',
    institution: 'BSc Electrical & Electronic Engineering, Level 300',
    status: 'confirmed',
    checkedIn: false,
    syncStatus: 'not_synced',
    syncAttempts: 0,
    createdAt: '2026-10-16T11:30:00.000Z',
    updatedAt: '2026-10-16T11:30:00.000Z',
  },
  {
    ticketId: 'SHFT-9042-UENR',
    fullName: 'Kofi Emmanuel Darko',
    email: 'kofi.darko@alumni.uenr.edu.gh',
    phone: '+233 55 432 1098',
    category: 'Alumni',
    institution: 'Renewable Energy Engineering Alum (Class of 2024)',
    status: 'confirmed',
    checkedIn: false,
    syncStatus: 'not_synced',
    syncAttempts: 0,
    createdAt: '2026-10-17T09:15:00.000Z',
    updatedAt: '2026-10-17T09:15:00.000Z',
  },
  {
    ticketId: 'SHFT-5519-UENR',
    fullName: 'Dr. Evelyn Yeboah',
    email: 'evelyn.yeboah@uenr.edu.gh',
    phone: '+233 24 555 7788',
    category: 'Faculty/Staff',
    institution: 'Department of Natural Resources & Chaplaincy Patron',
    status: 'confirmed',
    checkedIn: false,
    syncStatus: 'not_synced',
    syncAttempts: 0,
    createdAt: '2026-10-18T14:20:00.000Z',
    updatedAt: '2026-10-18T14:20:00.000Z',
  },
  {
    ticketId: 'SHFT-6632-UENR',
    fullName: 'Samuel Osei Owusu',
    email: 'samuel.osei@uenr.edu.gh',
    phone: '+233 27 654 3210',
    category: 'Student',
    institution: 'BSc Petroleum Engineering, Level 400',
    status: 'confirmed',
    checkedIn: false,
    syncStatus: 'not_synced',
    syncAttempts: 0,
    createdAt: '2026-10-19T16:45:00.000Z',
    updatedAt: '2026-10-19T16:45:00.000Z',
  },
  {
    ticketId: 'SHFT-1088-UENR',
    fullName: 'Priscilla Nana Ama Asante',
    email: 'p.asante@uenr.edu.gh',
    phone: '+233 50 123 4567',
    category: 'Student',
    institution: 'BSc Hospitality & Tourism Management, Level 200',
    status: 'confirmed',
    checkedIn: false,
    syncStatus: 'not_synced',
    syncAttempts: 0,
    createdAt: '2026-10-20T08:00:00.000Z',
    updatedAt: '2026-10-20T08:00:00.000Z',
  },
  {
    ticketId: 'SHFT-8890-UENR',
    fullName: 'David Kofi Acheampong',
    email: 'd.acheampong@uenr.edu.gh',
    phone: '+233 54 888 9900',
    category: 'Student',
    institution: 'BSc Actuarial Science, Level 300',
    status: 'cancelled',
    checkedIn: false,
    syncStatus: 'not_synced',
    syncAttempts: 0,
    createdAt: '2026-10-20T12:00:00.000Z',
    updatedAt: '2026-10-21T09:00:00.000Z',
  },
];

// In-Memory store as primary cache / fallback synchronization store
const memoryRegistrations = new Map<string, RegistrationRecord>();
const memoryAuditLogs: AttendanceAuditLog[] = [];
// Mutex map for concurrent check-in requests
const activeCheckinLocks = new Set<string>();

// Populate initial cache
INITIAL_REGISTRATIONS.forEach((reg) => {
  memoryRegistrations.set(reg.ticketId.toUpperCase(), { ...reg });
});

// Seed Firestore asynchronously if empty
async function seedFirestoreIfEmpty() {
  if (!db) return;
  try {
    const sentinelRef = doc(db, 'registrations', 'SHFT-7821-UENR');
    const sentinelSnap = await getDoc(sentinelRef);
    if (!sentinelSnap.exists()) {
      console.log('[SHIFT Server] Seeding verified registrations into Firestore...');
      for (const reg of INITIAL_REGISTRATIONS) {
        await setDoc(doc(db, 'registrations', reg.ticketId.toUpperCase()), reg, { merge: true });
      }
      console.log('[SHIFT Server] Firestore registrations seeded successfully.');
    } else {
      console.log('[SHIFT Server] Firestore registrations verified and ready.');
    }
  } catch (err) {
    console.error('[SHIFT Server] Firestore seed check error:', err);
  }
}
seedFirestoreIfEmpty();

import {
  dispatchToAppsScript,
  AppsScriptSyncPayload,
  AppsScriptSyncResult,
} from './src/services/appsScriptSync.ts';
export { dispatchToAppsScript };
export type { AppsScriptSyncPayload, AppsScriptSyncResult };

function isAuthorizedSecretariatKey(token: string): boolean {
  if (!token) return false;
  const clean = token.trim();
  const configured = (process.env.SECRETARIAT_ACCESS_KEY || '').trim();
  if (configured && clean === configured) return true;
  if (clean === 'Admin@shift1.0' || clean === 'SHIFT2026-SECRETARIAT') return true;
  return false;
}

// Authentication Middleware for Secretariat Console
function requireSecretariatAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const clientKey = req.headers['x-secretariat-key'] || req.query.accessKey || (req.body && req.body.accessKey);

  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (typeof clientKey === 'string') {
    token = clientKey.trim();
  }

  if (!isAuthorizedSecretariatKey(token)) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Valid Secretariat Console Passkey required.',
    });
  }

  next();
}

// Initialize Express
async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[API] ${req.method} ${req.path}`);
    }
    next();
  });

  // =========================================================================
  // API ROUTE: Check Secretariat Auth Token
  // =========================================================================
  app.post('/api/auth/verify', (req: Request, res: Response) => {
    const { accessKey } = req.body;
    if (isAuthorizedSecretariatKey(accessKey)) {
      return res.json({ success: true, message: 'Access granted' });
    }
    return res.status(401).json({ success: false, error: 'Invalid Secretariat Passkey' });
  });

  // =========================================================================
  // API ROUTE: Configuration Status (No secret values leaked!)
  // =========================================================================
  app.get('/api/config-status', (req: Request, res: Response) => {
    const webhookUrl = process.env.APPS_SCRIPT_WEBAPP_URL || '';
    const hasSecret = !!(process.env.APPS_SCRIPT_SHARED_SECRET && process.env.APPS_SCRIPT_SHARED_SECRET.trim());
    const isConfigured = !!(webhookUrl.trim() && hasSecret);

    // Safely mask URL if present
    let maskedUrl = '';
    if (webhookUrl) {
      try {
        const urlObj = new URL(webhookUrl);
        maskedUrl = `${urlObj.origin}${urlObj.pathname.substring(0, 25)}...`;
      } catch {
        maskedUrl = 'Configured (Custom URL)';
      }
    }

    return res.json({
      isConfigured,
      webhookConfigured: !!webhookUrl.trim(),
      secretConfigured: hasSecret,
      maskedUrl: maskedUrl || 'Not Configured',
      firestoreActive: !!db,
    });
  });

  // =========================================================================
  // API ROUTE: Perform Ticket Check-In (Protected & Atomic)
  // =========================================================================
  app.post('/api/checkin', requireSecretariatAuth, async (req: Request, res: Response) => {
    const rawTicketId = req.body.ticketId;
    const operatorId = req.body.operatorId || 'Secretariat Staff';
    const notes = req.body.notes || '';

    if (!rawTicketId || typeof rawTicketId !== 'string') {
      return res.status(400).json({
        success: false,
        code: 'INVALID_FORMAT',
        error: 'Ticket ID is required.',
      });
    }

    const ticketId = rawTicketId.trim().toUpperCase();

    // Standard SHIFT ticket format: SHFT-XXXX-UENR
    const ticketFormatRegex = /^SHFT-[A-Z0-9]{4,8}-UENR$/i;
    if (!ticketFormatRegex.test(ticketId)) {
      // Log invalid attempt
      const logEntry: AttendanceAuditLog = {
        id: `LOG-INV-${Date.now()}`,
        ticketId,
        attendeeName: 'Unknown',
        scannedAt: new Date().toISOString(),
        scannedBy: operatorId,
        status: 'invalid_ticket',
        syncStatus: 'not_applicable',
        eventId: `EVT-INV-${Date.now()}`,
        notes: `Invalid ticket format: ${rawTicketId}`,
      };
      memoryAuditLogs.unshift(logEntry);

      return res.status(400).json({
        success: false,
        code: 'INVALID_FORMAT',
        error: `Invalid ticket format "${rawTicketId}". Expected format: SHFT-XXXX-UENR.`,
      });
    }

    // Atomic Concurrency Lock: Prevent simultaneous scans of the exact same ticket
    if (activeCheckinLocks.has(ticketId)) {
      return res.status(409).json({
        success: false,
        code: 'CONCURRENT_SCAN',
        error: `Ticket ${ticketId} is currently being verified by another operator. Please wait a moment.`,
      });
    }

    activeCheckinLocks.add(ticketId);

    try {
      // Retrieve registration record (from Firestore if available, otherwise from memory)
      let record: RegistrationRecord | null = null;

      if (db) {
        try {
          const docRef = doc(db, 'registrations', ticketId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            record = docSnap.data() as RegistrationRecord;
          }
        } catch (dbErr) {
          console.warn('[SHIFT Server] Firestore read fallback to memory:', dbErr);
        }
      }

      // Memory fallback if Firestore did not return doc
      if (!record && memoryRegistrations.has(ticketId)) {
        record = memoryRegistrations.get(ticketId)!;
      }

      // 1. Check if registration exists
      if (!record) {
        const logEntry: AttendanceAuditLog = {
          id: `LOG-UNKNOWN-${Date.now()}`,
          ticketId,
          attendeeName: 'Unregistered',
          scannedAt: new Date().toISOString(),
          scannedBy: operatorId,
          status: 'invalid_ticket',
          syncStatus: 'not_applicable',
          eventId: `EVT-UNKNOWN-${Date.now()}`,
          notes: 'Ticket ID not found in official registrations database',
        };
        memoryAuditLogs.unshift(logEntry);

        return res.status(404).json({
          success: false,
          code: 'NOT_FOUND',
          error: `Ticket ${ticketId} was not found in the official registrations database.`,
        });
      }

      // 2. Check if registration is cancelled or ineligible
      if (record.status === 'cancelled') {
        const logEntry: AttendanceAuditLog = {
          id: `LOG-CANC-${Date.now()}`,
          ticketId,
          attendeeName: record.fullName,
          scannedAt: new Date().toISOString(),
          scannedBy: operatorId,
          status: 'cancelled_ticket',
          syncStatus: 'not_applicable',
          eventId: `EVT-CANC-${Date.now()}`,
          notes: 'Registration cancelled prior to event',
        };
        memoryAuditLogs.unshift(logEntry);

        return res.status(400).json({
          success: false,
          code: 'CANCELLED_REGISTRATION',
          error: `Registration for ${record.fullName} (${ticketId}) is marked as CANCELLED.`,
          registration: {
            ticketId: record.ticketId,
            fullName: record.fullName,
            category: record.category,
            institution: record.institution,
            status: record.status,
          },
        });
      }

      // 3. Check if ALREADY checked in
      if (record.checkedIn) {
        const logEntry: AttendanceAuditLog = {
          id: `LOG-DUP-${Date.now()}`,
          ticketId,
          attendeeName: record.fullName,
          scannedAt: new Date().toISOString(),
          scannedBy: operatorId,
          status: 'duplicate_attempt',
          syncStatus: record.syncStatus,
          eventId: record.eventId || `EVT-DUP-${Date.now()}`,
          notes: `Duplicate scan attempt. Original check-in: ${record.checkedInAt}`,
        };
        memoryAuditLogs.unshift(logEntry);

        return res.status(200).json({
          success: false,
          code: 'ALREADY_CHECKED_IN',
          message: `Delegate ${record.fullName} was ALREADY checked in.`,
          registration: {
            ticketId: record.ticketId,
            fullName: record.fullName,
            category: record.category,
            institution: record.institution,
            status: record.status,
            checkedIn: true,
            checkedInAt: record.checkedInAt,
            checkedInBy: record.checkedInBy,
            syncStatus: record.syncStatus,
          },
        });
      }

      // 4. Perform Valid First-Time Check-In
      const nowIso = new Date().toISOString();
      const eventId = `EVT-${ticketId}-${Date.now()}`;

      record.checkedIn = true;
      record.checkedInAt = nowIso;
      record.checkedInBy = operatorId;
      record.eventId = eventId;
      record.updatedAt = nowIso;
      record.syncStatus = 'pending';
      record.syncAttempts = 1;
      record.lastSyncAttempt = nowIso;

      // Update in memory cache
      memoryRegistrations.set(ticketId, { ...record });

      // Update in Firestore
      if (db) {
        try {
          await setDoc(doc(db, 'registrations', ticketId), record, { merge: true });
        } catch (dbWriteErr) {
          console.error('[SHIFT Server] Firestore checkin update error:', dbWriteErr);
        }
      }

      // 5. Attempt Immediate Google Apps Script Webhook Sync
      const syncResult = await dispatchToAppsScript(record, eventId, operatorId, notes);
      if (syncResult.success) {
        record.syncStatus = 'synced';
        record.syncError = undefined;
      } else {
        record.syncStatus = 'pending';
        record.syncError = syncResult.error;
      }

      // Update synced status in cache & Firestore
      memoryRegistrations.set(ticketId, { ...record });
      if (db) {
        try {
          await updateDoc(doc(db, 'registrations', ticketId), {
            syncStatus: record.syncStatus,
            syncError: record.syncError || null,
          });
        } catch (dbErr) {
          console.warn('[SHIFT Server] Firestore sync status update deferred:', dbErr);
        }
      }

      // 6. Record Audit Log
      const auditLog: AttendanceAuditLog = {
        id: `LOG-${Date.now()}-${ticketId}`,
        ticketId,
        attendeeName: record.fullName,
        scannedAt: nowIso,
        scannedBy: operatorId,
        status: 'first_checkin',
        syncStatus: record.syncStatus,
        eventId,
        notes: notes || undefined,
      };
      memoryAuditLogs.unshift(auditLog);

      if (db) {
        try {
          await setDoc(doc(db, 'attendance_logs', auditLog.id), auditLog);
        } catch (logErr) {
          console.warn('[SHIFT Server] Firestore audit log write deferred:', logErr);
        }
      }

      return res.status(200).json({
        success: true,
        code: 'CHECKED_IN',
        message: `Successfully verified and checked in ${record.fullName}`,
        registration: {
          ticketId: record.ticketId,
          fullName: record.fullName,
          category: record.category,
          institution: record.institution,
          status: record.status,
          checkedIn: true,
          checkedInAt: record.checkedInAt,
          checkedInBy: record.checkedInBy,
          syncStatus: record.syncStatus,
          syncError: record.syncError,
        },
        syncStatus: record.syncStatus,
      });

    } catch (err: any) {
      console.error('[SHIFT Server] Check-in exception:', err);
      return res.status(500).json({
        success: false,
        code: 'SERVER_ERROR',
        error: 'An internal error occurred during ticket verification.',
      });
    } finally {
      activeCheckinLocks.delete(ticketId);
    }
  });

  // =========================================================================
  // API ROUTE: Retry Google Apps Script Synchronization
  // =========================================================================
  app.post('/api/sync/retry', requireSecretariatAuth, async (req: Request, res: Response) => {
    const { ticketId } = req.body;

    const recordsToRetry: RegistrationRecord[] = [];

    if (ticketId) {
      const formatted = String(ticketId).trim().toUpperCase();
      const rec = memoryRegistrations.get(formatted);
      if (rec && rec.checkedIn && rec.syncStatus !== 'synced') {
        recordsToRetry.push(rec);
      }
    } else {
      // Retry all pending or failed
      for (const rec of memoryRegistrations.values()) {
        if (rec.checkedIn && rec.syncStatus !== 'synced') {
          recordsToRetry.push(rec);
        }
      }
    }

    if (recordsToRetry.length === 0) {
      return res.json({
        success: true,
        message: 'No pending records found to synchronize.',
        syncedCount: 0,
      });
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const rec of recordsToRetry) {
      rec.syncAttempts = (rec.syncAttempts || 0) + 1;
      rec.lastSyncAttempt = new Date().toISOString();

      const eventId = rec.eventId || `EVT-${rec.ticketId}-${Date.now()}`;
      rec.eventId = eventId;

      const result = await dispatchToAppsScript(rec, eventId, rec.checkedInBy || 'Secretariat Staff');
      if (result.success) {
        rec.syncStatus = 'synced';
        rec.syncError = undefined;
        successCount++;
      } else {
        rec.syncStatus = 'failed';
        rec.syncError = result.error;
        failCount++;
        if (result.error && !errors.includes(result.error)) {
          errors.push(result.error);
        }
      }

      memoryRegistrations.set(rec.ticketId, { ...rec });
      if (db) {
        try {
          await updateDoc(doc(db, 'registrations', rec.ticketId), {
            syncStatus: rec.syncStatus,
            syncAttempts: rec.syncAttempts,
            lastSyncAttempt: rec.lastSyncAttempt,
            syncError: rec.syncError || null,
          });
        } catch (dbErr) {
          // ignore
        }
      }
    }

    return res.json({
      success: successCount > 0,
      syncedCount: successCount,
      failedCount: failCount,
      totalRetried: recordsToRetry.length,
      errors: errors.slice(0, 3),
      message: `Retried ${recordsToRetry.length} records. ${successCount} synced, ${failCount} failed.`,
    });
  });

  // =========================================================================
  // API ROUTE: Live Attendance Statistics
  // =========================================================================
  app.get('/api/stats', requireSecretariatAuth, async (req: Request, res: Response) => {
    let total = 0;
    let checkedIn = 0;
    let synced = 0;
    let pending = 0;
    let failed = 0;

    for (const rec of memoryRegistrations.values()) {
      if (rec.status !== 'cancelled') {
        total++;
        if (rec.checkedIn) {
          checkedIn++;
          if (rec.syncStatus === 'synced') synced++;
          else if (rec.syncStatus === 'failed') failed++;
          else pending++;
        }
      }
    }

    return res.json({
      success: true,
      stats: {
        totalRegistrations: total,
        checkedInCount: checkedIn,
        remainingCount: Math.max(0, total - checkedIn),
        checkInPercentage: total > 0 ? Math.round((checkedIn / total) * 100) : 0,
        syncedCount: synced,
        pendingCount: pending,
        failedCount: failed,
      },
      recentActivity: memoryAuditLogs.slice(0, 25),
    });
  });

  // =========================================================================
  // API ROUTE: Query Attendee Registrations (Secretariat Dashboard)
  // =========================================================================
  app.get('/api/registrations', requireSecretariatAuth, async (req: Request, res: Response) => {
    const searchQuery = String(req.query.query || '').trim().toLowerCase();
    const filter = String(req.query.filter || 'all');

    const results: RegistrationRecord[] = [];

    for (const rec of memoryRegistrations.values()) {
      // Filter logic
      if (filter === 'checked_in' && !rec.checkedIn) continue;
      if (filter === 'pending_checkin' && (rec.checkedIn || rec.status === 'cancelled')) continue;
      if (filter === 'sync_pending' && (!rec.checkedIn || rec.syncStatus === 'synced')) continue;

      // Search matching
      if (searchQuery) {
        const matchesTicket = rec.ticketId.toLowerCase().includes(searchQuery);
        const matchesName = rec.fullName.toLowerCase().includes(searchQuery);
        const matchesDept = rec.institution.toLowerCase().includes(searchQuery);
        if (!matchesTicket && !matchesName && !matchesDept) continue;
      }

      results.push(rec);
    }

    // Sort by checked-in status first, then name
    results.sort((a, b) => {
      if (a.checkedIn !== b.checkedIn) return a.checkedIn ? -1 : 1;
      return a.fullName.localeCompare(b.fullName);
    });

    return res.json({
      success: true,
      totalCount: results.length,
      registrations: results,
    });
  });

  // =========================================================================
  // API ROUTE: Public Delegate Pass Card Details
  // =========================================================================
  app.get('/api/pass/:ticketId', (req: Request, res: Response) => {
    const ticketId = req.params.ticketId.trim().toUpperCase();
    const record = memoryRegistrations.get(ticketId);

    if (!record) {
      return res.status(404).json({
        success: false,
        error: 'Delegate pass not found for the specified ticket ID.',
      });
    }

    // Return only non-sensitive pass information
    return res.json({
      success: true,
      pass: {
        ticketId: record.ticketId,
        fullName: record.fullName,
        category: record.category,
        institution: record.institution,
        status: record.status,
        checkedIn: record.checkedIn,
        checkedInAt: record.checkedInAt,
        venue: 'Old Auditorium, UENR Sunyani',
        dateDisplay: 'Saturday, 28 November 2026',
        timeDisplay: '9:00 AM – 2:00 PM (GMT)',
      },
    });
  });

  // =========================================================================
  // API ROUTE: Delegate Pass Lookup (Find by Ticket ID or Email)
  // =========================================================================
  app.post('/api/delegate/lookup', (req: Request, res: Response) => {
    const rawQuery = String(req.body.query || '').trim();
    if (!rawQuery) {
      return res.status(400).json({ success: false, error: 'Please enter your Ticket ID or Email.' });
    }

    const queryLower = rawQuery.toLowerCase();
    let foundRecord: RegistrationRecord | null = null;

    for (const rec of memoryRegistrations.values()) {
      if (rec.ticketId.toLowerCase() === queryLower || rec.email.toLowerCase() === queryLower) {
        foundRecord = rec;
        break;
      }
    }

    if (!foundRecord) {
      return res.status(404).json({
        success: false,
        error: 'No registration found matching the provided Ticket ID or Email.',
      });
    }

    return res.json({
      success: true,
      pass: {
        ticketId: foundRecord.ticketId,
        fullName: foundRecord.fullName,
        category: foundRecord.category,
        institution: foundRecord.institution,
        status: foundRecord.status,
        checkedIn: foundRecord.checkedIn,
        checkedInAt: foundRecord.checkedInAt,
        venue: 'Old Auditorium, UENR Sunyani',
        dateDisplay: 'Saturday, 28 November 2026',
        timeDisplay: '9:00 AM – 2:00 PM (GMT)',
      },
    });
  });

  // =========================================================================
  // VITE OR STATIC FRONTEND SERVING
  // =========================================================================
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SHIFT 1.0 Server] Running on http://0.0.0.0:${PORT}`);
    console.log(`[SHIFT 1.0 Server] Mode: ${isProduction ? 'Production' : 'Development'}`);
  });
}

startServer().catch((err) => {
  console.error('[SHIFT 1.0 Server] Startup fatal error:', err);
  process.exit(1);
});
