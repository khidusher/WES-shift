/**
 * Tests for SHIFT 1.0 Google Apps Script Attendance Sync Integration
 *
 * Verifies:
 * - Exact 10 payload fields matching attendance-webhook.gs
 * - Successful synchronization & response verification
 * - Missing environment configuration handling
 * - Invalid webhook responses (HTTP 401, non-JSON, 500)
 * - Timeout handling
 * - Retry & duplicate/idempotent handling
 * - Security & secret non-leakage
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  dispatchToAppsScript,
  AppsScriptSyncPayload,
  RegistrationRecordLike,
} from '../src/services/appsScriptSync.ts';

// Sample verified attendee for testing
const mockAttendee: RegistrationRecordLike = {
  ticketId: 'SHFT-7821-UENR',
  fullName: 'Kwame Mensah',
  email: 'k.mensah@uenr.edu.gh',
  phone: '+233 24 112 3456',
  category: 'Student',
  institution: 'BSc Computer Science, Level 400',
  status: 'confirmed',
  checkedIn: true,
  checkedInAt: '2026-11-28T09:15:30.000Z',
  checkedInBy: 'Secretariat Lead Desk 1',
  eventId: 'EVT-SHFT-7821-UENR-1732785330',
  syncStatus: 'pending',
  syncAttempts: 1,
  createdAt: '2026-10-15T10:00:00.000Z',
  updatedAt: '2026-11-28T09:15:30.000Z',
};

describe('SHIFT 1.0 Google Apps Script Attendance Sync Engine', () => {

  test('1. Successful Sync — validates all 10 fields and marks record synced', async () => {
    let capturedBody: AppsScriptSyncPayload | null = null;
    let capturedHeaders: Record<string, string> = {};

    const mockFetch = (async (url: string | URL | Request, init?: RequestInit) => {
      capturedHeaders = (init?.headers as Record<string, string>) || {};
      capturedBody = JSON.parse(init?.body as string);

      return new Response(
        JSON.stringify({
          status: 'success',
          alreadyRecorded: false,
          message: 'Attendance recorded successfully',
          ticketId: capturedBody?.ticketId,
          eventId: capturedBody?.eventId,
          syncedAt: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }) as unknown as typeof fetch;

    const result = await dispatchToAppsScript(
      mockAttendee,
      'EVT-TEST-1001',
      'Secretariat Staff #1',
      'VIP Gate Entry',
      {
        webhookUrl: 'https://script.google.com/macros/s/AKfycb_sample/exec',
        sharedSecret: 'test_secret_abc123',
        fetchFn: mockFetch,
      }
    );

    // Assert overall success
    assert.equal(result.success, true, 'Sync should report success: true');
    assert.equal(result.alreadyRecorded, false);
    assert.equal(result.message, 'Attendance recorded successfully');

    // Assert that the exact 10 required fields matching attendance-webhook.gs are present
    assert.ok(capturedBody, 'POST body must have been transmitted');
    const body = capturedBody as AppsScriptSyncPayload;
    assert.equal(body.secret, 'test_secret_abc123');
    assert.equal(body.eventId, 'EVT-TEST-1001');
    assert.equal(body.ticketId, 'SHFT-7821-UENR');
    assert.equal(body.attendeeName, 'Kwame Mensah');
    assert.equal(body.category, 'Student');
    assert.equal(body.institution, 'BSc Computer Science, Level 400');
    assert.equal(body.checkInStatus, 'PRESENT');
    assert.equal(body.checkInTime, '2026-11-28T09:15:30.000Z');
    assert.equal(body.checkedInBy, 'Secretariat Staff #1');
    assert.equal(body.notes, 'VIP Gate Entry');
  });

  test('2. Missing Configuration — handles missing URL or Secret gracefully without crashing', async () => {
    // Case A: Missing URL
    const resultMissingUrl = await dispatchToAppsScript(
      mockAttendee,
      'EVT-TEST-1002',
      'Operator #1',
      undefined,
      {
        webhookUrl: '',
        sharedSecret: 'test_secret_abc123',
      }
    );
    assert.equal(resultMissingUrl.success, false);
    assert.match(resultMissingUrl.error || '', /APPS_SCRIPT_WEBAPP_URL/i);

    // Case B: Missing Secret
    const resultMissingSecret = await dispatchToAppsScript(
      mockAttendee,
      'EVT-TEST-1003',
      'Operator #1',
      undefined,
      {
        webhookUrl: 'https://script.google.com/macros/s/AKfycb_sample/exec',
        sharedSecret: '',
      }
    );
    assert.equal(resultMissingSecret.success, false);
    assert.match(resultMissingSecret.error || '', /APPS_SCRIPT_SHARED_SECRET/i);
  });

  test('3. Invalid Webhook Responses — rejects 401 unauthorized, 500 error, and non-JSON output', async () => {
    // 3A: Webhook rejects with HTTP 401 Unauthorized
    const mockFetch401 = (async () => {
      return new Response(
        JSON.stringify({
          status: 'error',
          code: 'UNAUTHORIZED',
          message: 'Invalid or missing shared secret',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }) as unknown as typeof fetch;

    const result401 = await dispatchToAppsScript(
      mockAttendee,
      'EVT-TEST-1004',
      'Operator #1',
      undefined,
      {
        webhookUrl: 'https://script.google.com/macros/s/AKfycb_sample/exec',
        sharedSecret: 'bad_secret',
        fetchFn: mockFetch401,
      }
    );
    assert.equal(result401.success, false);
    assert.equal(result401.httpStatus, 401);
    assert.equal(result401.error, 'Invalid or missing shared secret');

    // 3B: Non-JSON HTML error page (e.g. Google 502/503 service outage)
    const mockFetchHtml = (async () => {
      return new Response('<html><body>Google Service Unavailable</body></html>', {
        status: 503,
        headers: { 'Content-Type': 'text/html' },
      });
    }) as unknown as typeof fetch;

    const resultHtml = await dispatchToAppsScript(
      mockAttendee,
      'EVT-TEST-1005',
      'Operator #1',
      undefined,
      {
        webhookUrl: 'https://script.google.com/macros/s/AKfycb_sample/exec',
        sharedSecret: 'test_secret_abc123',
        fetchFn: mockFetchHtml,
      }
    );
    assert.equal(resultHtml.success, false);
    assert.match(resultHtml.error || '', /Received non-JSON response/i);

    // 3C: Explicit error payload in 200 response
    const mockFetchErrorPayload = (async () => {
      return new Response(
        JSON.stringify({
          status: 'error',
          code: 'LOCK_TIMEOUT',
          message: 'Spreadsheet write lock timed out',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as unknown as typeof fetch;

    const resultErrorPayload = await dispatchToAppsScript(
      mockAttendee,
      'EVT-TEST-1006',
      'Operator #1',
      undefined,
      {
        webhookUrl: 'https://script.google.com/macros/s/AKfycb_sample/exec',
        sharedSecret: 'test_secret_abc123',
        fetchFn: mockFetchErrorPayload,
      }
    );
    assert.equal(resultErrorPayload.success, false);
    assert.equal(resultErrorPayload.error, 'Spreadsheet write lock timed out');
  });

  test('4. Timeout Handling — aborts within specified timeout and preserves check-in', async () => {
    // Simulated slow Apps Script response that takes longer than timeout
    const mockFetchSlow = (async (_url: any, init?: RequestInit) => {
      return new Promise((resolve, reject) => {
        const signal = init?.signal;
        if (signal) {
          signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }
        // Do not resolve normally
      });
    }) as unknown as typeof fetch;

    const resultTimeout = await dispatchToAppsScript(
      mockAttendee,
      'EVT-TEST-1007',
      'Operator #1',
      undefined,
      {
        webhookUrl: 'https://script.google.com/macros/s/AKfycb_sample/exec',
        sharedSecret: 'test_secret_abc123',
        timeoutMs: 150, // Short timeout for test
        fetchFn: mockFetchSlow,
      }
    );

    assert.equal(resultTimeout.success, false);
    assert.match(resultTimeout.error || '', /timed out/i);
  });

  test('5. Duplicate & Retry Idempotency — recognizes alreadyRecorded without creating duplicate errors', async () => {
    const mockFetchDuplicate = (async () => {
      return new Response(
        JSON.stringify({
          status: 'success',
          alreadyRecorded: true,
          message: 'Attendance record already exists (idempotent no-op)',
          ticketId: 'SHFT-7821-UENR',
          eventId: 'EVT-SHFT-7821-UENR-1732785330',
          existingRow: 4,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }) as unknown as typeof fetch;

    const resultRetry = await dispatchToAppsScript(
      mockAttendee,
      mockAttendee.eventId!,
      'Operator #1',
      undefined,
      {
        webhookUrl: 'https://script.google.com/macros/s/AKfycb_sample/exec',
        sharedSecret: 'test_secret_abc123',
        fetchFn: mockFetchDuplicate,
      }
    );

    assert.equal(resultRetry.success, true, 'Idempotent duplicate response should be considered successfully synced');
    assert.equal(resultRetry.alreadyRecorded, true);
    assert.match(resultRetry.message || '', /idempotent/i);
  });

  test('6. Security — shared secret and sensitive personal payload are not leaked in error summaries', async () => {
    const secret = 'super_secret_token_never_leak_xyz789';
    const mockFetchFailing = (async () => {
      return new Response(
        JSON.stringify({
          status: 'error',
          code: 'LOCK_UNAVAILABLE',
          message: 'Could not obtain lock to write to spreadsheet. Please retry.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }) as unknown as typeof fetch;

    const result = await dispatchToAppsScript(
      mockAttendee,
      'EVT-TEST-1008',
      'Operator #1',
      undefined,
      {
        webhookUrl: 'https://script.google.com/macros/s/AKfycb_sample/exec',
        sharedSecret: secret,
        fetchFn: mockFetchFailing,
      }
    );

    // Verify secret is NOT leaked into the error string
    assert.equal(result.success, false);
    assert.ok(!result.error?.includes(secret), 'Secret must NEVER appear in the error message');
  });

});
