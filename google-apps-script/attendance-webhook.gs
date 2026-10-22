/**
 * SHIFT 1.0 — Attendance Check-In Google Apps Script Webhook
 * 
 * Secure, production-ready attendance receiver for SHIFT 1.0 (UENR Sunyani).
 * Models the robust Kadesh event attendance check-in architecture.
 * 
 * Features:
 * - Authenticates requests using a shared secret stored in Script Properties
 * - Uses LockService to prevent race conditions during high-volume simultaneous check-ins
 * - Enforces idempotency via unique Event ID & Ticket ID check to prevent duplicate rows on retry
 * - Automatically initializes headers and sheet styling if the sheet is blank
 * - Returns structured JSON responses with HTTP-safe status payloads
 * 
 * Setup instructions:
 * 1. Open Google Sheets and create or open your SHIFT 1.0 Attendance sheet.
 * 2. In Google Sheets, click Extensions > Apps Script.
 * 3. Delete any code in the editor, and paste this entire file.
 * 4. In Apps Script, click Project Settings (gear icon) > Script Properties > Add script property:
 *    - Property: SHIFT_SHARED_SECRET
 *    - Value: <Generate a strong random secret string, e.g. shft_sec_99a38f7c12>
 *    (Optional) Property: SPREADSHEET_ID (leave blank to use the active bound spreadsheet)
 *    (Optional) Property: SHEET_NAME (defaults to "Attendance")
 * 5. Click Deploy > New deployment:
 *    - Select type: Web app
 *    - Description: "SHIFT 1.0 Live Attendance Webhook"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone"
 * 6. Copy the Web App URL (starts with https://script.google.com/macros/s/...) and configure
 *    it along with SHIFT_SHARED_SECRET in your SHIFT 1.0 server environment variables.
 */

// Configuration constants
var CONFIG = {
  DEFAULT_SHEET_NAME: 'Attendance',
  PROPERTY_SECRET_KEY: 'SHIFT_SHARED_SECRET',
  PROPERTY_SPREADSHEET_ID: 'SPREADSHEET_ID',
  PROPERTY_SHEET_NAME: 'SHEET_NAME',
  LOCK_TIMEOUT_MS: 15000, // 15 seconds wait for write lock
  HEADERS: [
    'Event ID',
    'Ticket ID',
    'Full Name',
    'Category',
    'Institution / Dept',
    'Status',
    'Check-In Timestamp (UTC)',
    'Operator / Staff',
    'Synced At (Apps Script UTC)',
    'Client Notes'
  ]
};

/**
 * Handle incoming POST requests from the SHIFT 1.0 verified server backend.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  var lockAcquired = false;

  try {
    // 1. Verify that POST body exists
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        success: false,
        error: 'Missing request body payload'
      }, 400);
    }

    // 2. Parse JSON payload
    var payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return createJsonResponse({
        success: false,
        error: 'Invalid JSON format: ' + parseErr.message
      }, 400);
    }

    // 3. Authenticate shared secret against Script Properties
    var scriptProperties = PropertiesService.getScriptProperties();
    var expectedSecret = scriptProperties.getProperty(CONFIG.PROPERTY_SECRET_KEY);

    // If script properties has not configured a secret yet, reject for security
    if (!expectedSecret || expectedSecret.trim() === '') {
      return createJsonResponse({
        success: false,
        error: 'Server configuration error: SHIFT_SHARED_SECRET is not configured in Script Properties.'
      }, 500);
    }

    var providedSecret = payload.secret || (e.parameter && e.parameter.secret);
    if (!providedSecret || providedSecret !== expectedSecret) {
      return createJsonResponse({
        success: false,
        error: 'Unauthorized: Invalid or missing authentication secret.'
      }, 401);
    }

    // 4. Validate mandatory payload fields
    var ticketId = (payload.ticketId || '').trim();
    var eventId = (payload.eventId || '').trim();

    if (!ticketId) {
      return createJsonResponse({
        success: false,
        error: 'Validation failed: ticketId is required.'
      }, 422);
    }

    if (!eventId) {
      // Generate a fallback event ID if omitted
      eventId = 'EVT-' + ticketId + '-' + new Date().getTime();
    }

    // 5. Acquire exclusive execution lock to prevent race conditions
    lockAcquired = lock.tryLock(CONFIG.LOCK_TIMEOUT_MS);
    if (!lockAcquired) {
      return createJsonResponse({
        success: false,
        error: 'Server busy: Could not acquire write lock within timeout. Please retry.'
      }, 503);
    }

    // 6. Access target Spreadsheet and Sheet
    var spreadsheet;
    var customSpreadsheetId = scriptProperties.getProperty(CONFIG.PROPERTY_SPREADSHEET_ID);

    if (customSpreadsheetId && customSpreadsheetId.trim() !== '') {
      spreadsheet = SpreadsheetApp.openById(customSpreadsheetId.trim());
    } else {
      spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    }

    if (!spreadsheet) {
      return createJsonResponse({
        success: false,
        error: 'Could not access destination Google Spreadsheet.'
      }, 500);
    }

    var targetSheetName = scriptProperties.getProperty(CONFIG.PROPERTY_SHEET_NAME) || CONFIG.DEFAULT_SHEET_NAME;
    var sheet = spreadsheet.getSheetByName(targetSheetName);

    // Auto-create sheet if it does not exist
    if (!sheet) {
      sheet = spreadsheet.insertSheet(targetSheetName);
    }

    // Initialize headers if sheet is empty
    if (sheet.getLastRowNum() === 0) {
      initializeSheetHeaders(sheet);
    }

    // 7. Enforce Idempotency (prevent duplicate rows on retry)
    // Check if eventId or ticketId already exists in sheet
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      // Read Event ID (col 1) and Ticket ID (col 2)
      var existingData = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
      for (var i = 0; i < existingData.length; i++) {
        var existingEventId = String(existingData[i][0] || '').trim();
        var existingTicketId = String(existingData[i][1] || '').trim();

        if (existingEventId === eventId) {
          // Already recorded with the exact same event ID -> return idempotent success
          return createJsonResponse({
            success: true,
            idempotent: true,
            message: 'Check-in was already recorded for eventId ' + eventId,
            ticketId: ticketId,
            eventId: eventId,
            row: i + 2
          }, 200);
        }

        if (existingTicketId === ticketId && payload.enforceSingleTicketCheckin !== false) {
          // Ticket was already checked in
          return createJsonResponse({
            success: true,
            idempotent: true,
            message: 'Ticket ' + ticketId + ' is already recorded in attendance sheet',
            ticketId: ticketId,
            eventId: existingEventId,
            row: i + 2
          }, 200);
        }
      }
    }

    // 8. Prepare row data safely
    var fullName = (payload.fullName || 'Registered Attendee').trim();
    var category = (payload.category || 'Delegate').trim();
    var institution = (payload.institution || 'UENR').trim();
    var status = (payload.status || 'CONFIRMED_CHECKED_IN').trim();
    var checkInTime = payload.checkedInAt || new Date().toISOString();
    var operator = (payload.checkedInBy || 'Secretariat Staff').trim();
    var syncedAt = new Date().toISOString();
    var notes = (payload.notes || '').trim();

    var newRow = [
      eventId,
      ticketId,
      fullName,
      category,
      institution,
      status,
      checkInTime,
      operator,
      syncedAt,
      notes
    ];

    // Append row
    sheet.appendRow(newRow);
    var insertedRowNumber = sheet.getLastRow();

    // 9. Format the newly added row
    var range = sheet.getRange(insertedRowNumber, 1, 1, newRow.length);
    range.setFontFamily('Inter, Roboto, sans-serif');
    range.setFontSize(10);
    range.setVerticalAlignment('middle');

    return createJsonResponse({
      success: true,
      idempotent: false,
      message: 'Attendance record appended successfully',
      ticketId: ticketId,
      eventId: eventId,
      row: insertedRowNumber,
      timestamp: syncedAt
    }, 200);

  } catch (err) {
    return createJsonResponse({
      success: false,
      error: 'Unexpected Apps Script error: ' + err.message
    }, 500);

  } finally {
    if (lockAcquired) {
      try {
        lock.releaseLock();
      } catch (e) {
        // Ignore lock release error
      }
    }
  }
}

/**
 * Handle GET requests for health check / endpoint verification.
 */
function doGet(e) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var isConfigured = !!scriptProperties.getProperty(CONFIG.PROPERTY_SECRET_KEY);

  return createJsonResponse({
    service: 'SHIFT 1.0 Attendance Webhook Service',
    status: 'ONLINE',
    version: '1.0.0',
    venue: 'Old Auditorium, UENR Sunyani',
    timestamp: new Date().toISOString(),
    configured: isConfigured,
    message: isConfigured 
      ? 'Webhook is configured and ready to receive POST requests.' 
      : 'Configuration pending: Please set SHIFT_SHARED_SECRET in Script Properties.'
  }, 200);
}

/**
 * Helper to initialize sheet header row with clean, high-contrast formatting.
 */
function initializeSheetHeaders(sheet) {
  sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setValues([CONFIG.HEADERS]);
  
  var headerRange = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length);
  headerRange.setBackground('#050505');
  headerRange.setFontColor('#7EE647');
  headerRange.setFontWeight('bold');
  headerRange.setFontFamily('Inter, Roboto, sans-serif');
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment('center');
  headerRange.setVerticalAlignment('middle');
  sheet.setRowHeight(1, 36);
  sheet.setFrozenRows(1);

  // Auto-resize columns
  for (var c = 1; c <= CONFIG.HEADERS.length; c++) {
    sheet.autoResizeColumn(c);
  }
}

/**
 * Helper to return standard JSON output.
 */
function createJsonResponse(data, statusCode) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
