/**
 * SHIFT 1.0 — Google Apps Script Attendance Webhook Sync Service
 *
 * Dispatches verified check-in events to Google Apps Script.
 * Matches exact contract of google-apps-script/attendance-webhook.gs:
 * - secret
 * - eventId
 * - ticketId
 * - attendeeName
 * - category
 * - institution
 * - checkInStatus
 * - checkInTime
 * - checkedInBy
 * - notes
 */

export interface RegistrationRecordLike {
  ticketId: string;
  fullName: string;
  email?: string;
  phone?: string;
  category?: string;
  institution?: string;
  status?: string;
  checkedIn?: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  eventId?: string;
  syncStatus?: string;
  syncAttempts?: number;
  lastSyncAttempt?: string;
  syncError?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppsScriptSyncPayload {
  secret: string;
  eventId: string;
  ticketId: string;
  attendeeName: string;
  category: string;
  institution: string;
  checkInStatus: string;
  checkInTime: string;
  checkedInBy: string;
  notes: string;
  // Legacy / fallback fields
  fullName?: string;
  status?: string;
  checkedInAt?: string;
}

export interface AppsScriptSyncResult {
  success: boolean;
  message?: string;
  error?: string;
  alreadyRecorded?: boolean;
  httpStatus?: number;
}

/**
 * Dispatch verified check-in record to Google Apps Script Webhook.
 * Never logs or leaks the secret or personal attendee details.
 */
export async function dispatchToAppsScript(
  record: RegistrationRecordLike,
  eventId: string,
  operatorId: string,
  notes?: string,
  options?: {
    webhookUrl?: string;
    sharedSecret?: string;
    timeoutMs?: number;
    fetchFn?: typeof fetch;
  }
): Promise<AppsScriptSyncResult> {
  const webhookUrl = options?.webhookUrl !== undefined ? options.webhookUrl : process.env.APPS_SCRIPT_WEBAPP_URL;
  const sharedSecret = options?.sharedSecret !== undefined ? options.sharedSecret : process.env.APPS_SCRIPT_SHARED_SECRET;
  const timeoutMs = options?.timeoutMs || 10000;
  const customFetch = options?.fetchFn || fetch;

  if (!webhookUrl || webhookUrl.trim() === '') {
    return {
      success: false,
      error: 'Google Apps Script Web App URL is not configured in server environment (APPS_SCRIPT_WEBAPP_URL).',
    };
  }

  if (!sharedSecret || sharedSecret.trim() === '') {
    return {
      success: false,
      error: 'Shared integration secret (APPS_SCRIPT_SHARED_SECRET) is not configured in server environment.',
    };
  }

  // Exact 10 fields matching google-apps-script/attendance-webhook.gs
  const payload: AppsScriptSyncPayload = {
    secret: sharedSecret.trim(),
    eventId: eventId,
    ticketId: record.ticketId,
    attendeeName: record.fullName,
    category: record.category || 'General',
    institution: record.institution || 'UENR',
    checkInStatus: 'PRESENT',
    checkInTime: record.checkedInAt || new Date().toISOString(),
    checkedInBy: operatorId || 'Secretariat Staff',
    notes: notes || 'Verified at Entrance',
    // Supplementary backwards-compatible keys
    fullName: record.fullName,
    status: 'PRESENT',
    checkedInAt: record.checkedInAt || new Date().toISOString(),
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await customFetch(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SHIFT-1.0-Attendance-Server/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timeoutId);

    const responseText = await response.text();
    let data: any = null;
    try {
      data = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        httpStatus: response.status,
        error: `HTTP ${response.status}: Received non-JSON response from Apps Script endpoint.`,
      };
    }

    if (!response.ok) {
      return {
        success: false,
        httpStatus: response.status,
        error: data?.message || data?.error || `HTTP ${response.status} from Apps Script`,
      };
    }

    // Verify webhook response against attendance-webhook.gs contract
    if (data && (data.status === 'success' || data.success === true || data.alreadyRecorded === true)) {
      return {
        success: true,
        message: data.message || 'Synced to Google Sheet',
        alreadyRecorded: !!data.alreadyRecorded,
        httpStatus: response.status,
      };
    }

    return {
      success: false,
      httpStatus: response.status,
      error: data?.message || data?.error || data?.code || 'Unknown rejection from Apps Script',
    };
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError' || err.code === 20;
    return {
      success: false,
      error: isTimeout
        ? `Apps Script request timed out (${Math.round(timeoutMs / 1000)}s)`
        : (err.message || String(err)),
    };
  }
}
