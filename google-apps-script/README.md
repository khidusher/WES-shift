# SHIFT 1.0 — Google Apps Script Attendance Integration Guide

This guide walks through deploying and connecting the isolated Google Apps Script attendance webhook for SHIFT 1.0.

---

## 1. Architecture & Security Flow

```text
[ Attendee QR Code / Digital Pass ]
       │
       ▼ (Scan via mobile rear camera / desktop webcam / manual entry)
[ Secretariat Scanner Console ] (Protected with Passkey)
       │
       ▼ (POST /api/checkin)
[ SHIFT 1.0 Server Engine ]
       │
       ├── 1. Validates format (SHFT-XXXX-UENR)
       ├── 2. Acquires atomic in-memory lock (prevents simultaneous duplicate scans)
       ├── 3. Verifies registration in Firestore (checks cancelled/unknown/duplicate)
       ├── 4. Records server-authoritative check-in in Firestore
       ├── 5. Generates unique Event ID (idempotency key)
       ▼
[ Server-Side Sync Dispatcher ] (dispatchToAppsScript)
       │ (Never exposes APPS_SCRIPT_SHARED_SECRET or APPS_SCRIPT_WEBAPP_URL to browser)
       ▼ (HTTP POST with 10 required fields and AbortController timeout)
[ Google Apps Script Webhook ]
       │
       ├── Validates SHIFT_SHARED_SECRET from Script Properties
       ├── Acquires LockService lock (15s timeout to prevent sheet row collisions)
       ├── Checks duplicate Event ID / Ticket ID (Idempotency)
       ▼
[ Google Spreadsheet ] (Attendance Tab)
```

### Key Security Safeguards:
1. **Server-Side Exclusivity**: Secrets (`APPS_SCRIPT_SHARED_SECRET`, `APPS_SCRIPT_WEBAPP_URL`) and personal attendee records are never sent to the client browser, never bundled into frontend assets, never printed in error logs, and never encoded in QR codes.
2. **Never Sends Unverified Check-Ins**: The server rejects invalid, unknown, or cancelled tickets immediately. Webhook dispatch is only triggered AFTER successful verification and database check-in.
3. **LockService**: Prevents simultaneous writes from corrupting the Google Sheet when multiple Secretariat staff members scan tickets at peak entrance hours.
4. **Event ID / Idempotency**: If a network glitch occurs and a sync request is retried, Apps Script detects the existing `eventId` and avoids inserting a duplicate row.
5. **Decoupled Sync Safety**: If Google Apps Script is temporarily unreachable or times out (10s), the verified check-in remains completely safe in Firestore and memory with `syncStatus: "pending"`. The Secretariat Console provides a dedicated "Retry Sync" button to resynchronize without double-counting.

---

## 2. Step-by-Step Google Apps Script Deployment

### Step A: Create or Open Your Google Sheet
1. Open Google Sheets at [sheets.google.com](https://sheets.google.com).
2. Create a new spreadsheet named **"SHIFT 1.0 — Attendance Register"**.

### Step B: Open the Apps Script Editor
1. In your Google Sheet, click **Extensions** > **Apps Script**.
2. Rename the project at top-left to **"SHIFT 1.0 Attendance Webhook"**.

### Step C: Paste the Webhook Code
1. Replace all existing contents of `Code.gs` with the entire contents of `google-apps-script/attendance-webhook.gs`.
2. Click **Save** (disk icon).

### Step D: Set Script Properties (Secrets)
1. Click the **Project Settings** (gear icon ⚙️) on the left sidebar.
2. Scroll down to **Script Properties** and click **Add script property**:
   - **Property**: `SHIFT_SHARED_SECRET`
   - **Value**: Enter a strong random secret (e.g. `shft_sec_99a38f7c12`)
3. (Optional) If you want to use a specific sheet tab name:
   - **Property**: `SHEET_NAME`
   - **Value**: `Attendance`
4. Click **Save script properties**.

### Step E: Deploy as Web App
1. At top-right, click the blue **Deploy** button > **New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Fill in:
   - **Description**: `SHIFT 1.0 Live Attendance Webhook`
   - **Execute as**: `Me (your_email@gmail.com)`
   - **Who has access**: `Anyone` *(The shared secret in the payload protects the endpoint from unauthorized callers)*.
4. Click **Deploy**.
5. Grant permissions if prompted by Google (click "Advanced" > "Go to SHIFT 1.0 Attendance Webhook (unsafe)" > "Allow").
6. Copy the **Web app URL**. It looks like:
   `https://script.google.com/macros/s/AKfycbx.../exec`

---

## 3. Environment Variables Configuration

### A. Local / Container Development (.env)
In your `.env` file:
```env
APPS_SCRIPT_WEBAPP_URL="https://script.google.com/macros/s/AKfycbx.../exec"
APPS_SCRIPT_SHARED_SECRET="shft_sec_99a38f7c12"
SECRETARIAT_ACCESS_KEY="SHIFT2026-SECRETARIAT"
```

### B. Vercel Deployment
If hosting on Vercel:
1. Go to your **Vercel Dashboard** and select your project.
2. Navigate to **Settings** > **Environment Variables**.
3. Add the following variables (for Production, Preview, and Development environments):
   - **Key**: `APPS_SCRIPT_WEBAPP_URL`
     - **Value**: `https://script.google.com/macros/s/AKfycbx.../exec` (your deployed Apps Script Web App URL)
   - **Key**: `APPS_SCRIPT_SHARED_SECRET`
     - **Value**: `shft_sec_99a38f7c12` (the exact secret configured in Script Properties)
   - **Key**: `SECRETARIAT_ACCESS_KEY`
     - **Value**: `SHIFT2026-SECRETARIAT` (or your chosen Secretariat Passkey)
4. Go to **Deployments** and click **Redeploy** (without cache) so the server picks up the new environment variables.

---

## 4. Webhook Payload Specification

The SHIFT 1.0 server sends a `POST` request with `Content-Type: application/json` containing exactly 10 fields:

| Field | Type | Description |
|---|---|---|
| `secret` | string | Shared secret matching `SHIFT_SHARED_SECRET` in Script Properties |
| `eventId` | string | Unique idempotency ID (e.g. `EVT-SHFT-7821-UENR-1732785330`) |
| `ticketId` | string | Official Attendee Ticket ID (e.g. `SHFT-7821-UENR`) |
| `attendeeName` | string | Full Name of verified attendee |
| `category` | string | Attendee category (Student, Alumni, Faculty/Staff, etc.) |
| `institution` | string | Program/Department / Institution |
| `checkInStatus` | string | Status: `PRESENT` |
| `checkInTime` | string | ISO-8601 UTC timestamp of verified check-in |
| `checkedInBy` | string | Operator desk / Staff Identifier |
| `notes` | string | Entrance notes or desk location |

---

## 5. Automated Testing

Run the automated test suite locally:
```bash
npm run test
```
This tests:
- Successful sync and 10-field payload verification
- Graceful handling of missing URL or Secret
- Rejection of 401 Unauthorized and HTML 500 error pages
- Request timeout handling (AbortController)
- Idempotency & duplicate check-in retry handling
- Security & secret non-leakage
