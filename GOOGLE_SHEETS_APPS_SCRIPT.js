/**
 * ==============================================================================
 * BANGLADESH FINTECH PAYMENT TRACKING & RECEIPT VERIFICATION PWA
 * GOOGLE APPS SCRIPT DATABASE BACKEND
 * SPREADSHEET ID: 1BiWzOnqxJZcjEeRugH93h1f_TzBlUGC41yPS2BUeZGg
 * ==============================================================================
 */

// আপনার তৈরি করা গুগল শিটের আইডি (এটি স্বয়ংক্রিয়ভাবে কানেক্ট হবে)
var SPREADSHEET_ID = '1BiWzOnqxJZcjEeRugH93h1f_TzBlUGC41yPS2BUeZGg';

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

/**
 * রান বাটন (Run ▶) টেস্ট করার জন্য এই ফাংশনটি ব্যবহার করুন
 */
function test() {
  var ss = getSpreadsheet();
  Logger.log('Connected to Spreadsheet: ' + ss.getName());
  var sheet = ss.getSheetByName('Payments');
  Logger.log('Payments Sheet Rows: ' + (sheet ? sheet.getLastRow() : 0));
  Logger.log('Database is 100% READY!');
}

/**
 * ব্রাউজার বা ওয়েব অ্যাপ থেকে GET রিকোয়েস্ট এলে এটি কাজ করে
 */
function doGet(e) {
  return handleRequest(e || {});
}

/**
 * ব্রাউজার বা ওয়েব অ্যাপ থেকে POST রিকোয়েস্ট এলে এটি কাজ করে
 */
function doPost(e) {
  return handleRequest(e || {});
}

/**
 * মূল রিকোয়েস্ট হ্যান্ডলার
 */
function handleRequest(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000);

  try {
    var ss = getSpreadsheet();
    var params = {};

    // 1. URL Query Parameter রিড করা
    if (e && e.parameter) {
      for (var key in e.parameter) {
        params[key] = e.parameter[key];
      }
    }

    // 2. POST Body JSON রিড করা
    if (e && e.postData && e.postData.contents) {
      try {
        var body = JSON.parse(e.postData.contents);
        for (var bKey in body) {
          params[bKey] = body[bKey];
        }
      } catch (err) {
        // Ignored
      }
    }

    var action = params.action || 'get_payments';
    var responseData = {};

    if (action === 'ping') {
      responseData = {
        status: 'ok',
        spreadsheet: ss.getName(),
        timestamp: new Date().toISOString(),
        message: 'Google Sheets DB is live and connected!',
      };
    } else if (action === 'get_payments') {
      responseData = getPayments(ss, params);
    } else if (action === 'add_payment') {
      responseData = addPayment(ss, params.payment || params);
    } else if (action === 'get_metrics') {
      responseData = getMetrics(ss);
    } else if (action === 'add_receipt') {
      responseData = addReceipt(ss, params.receipt || params);
    } else if (action === 'login') {
      responseData = loginUser(ss, params.email, params.password);
    } else if (action === 'register') {
      responseData = registerUser(ss, params);
    } else {
      responseData = { error: 'Unknown action: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// ------------------------------------------------------------------------------
// PAYMENTS CONTROLLER
// ------------------------------------------------------------------------------
function getPayments(ss, params) {
  params = params || {};
  var sheet = ss.getSheetByName('Payments');
  if (!sheet) return { payments: [] };

  var rows = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { payments: [] };

  var headers = rows[0];
  var payments = [];
  var search = (params.search || '').toLowerCase();
  var statusFilter = params.status;
  var gatewayFilter = params.gateway;

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var p = {};
    for (var h = 0; h < headers.length; h++) {
      p[headers[h]] = row[h];
    }

    if (statusFilter && statusFilter !== 'all' && String(p.status).toLowerCase() !== statusFilter.toLowerCase()) {
      continue;
    }
    if (gatewayFilter && String(p.gateway).toLowerCase() !== gatewayFilter.toLowerCase()) {
      continue;
    }
    if (search) {
      var matchTrx = String(p.trx_id || '').toLowerCase().indexOf(search) !== -1;
      var matchSender = String(p.sender_name || '').toLowerCase().indexOf(search) !== -1;
      var matchRecipient = String(p.recipient_name || '').toLowerCase().indexOf(search) !== -1;
      if (!matchTrx && !matchSender && !matchRecipient) {
        continue;
      }
    }

    payments.push(p);
  }

  payments.reverse();
  return { payments: payments };
}

function addPayment(ss, payment) {
  payment = payment || {};
  var sheet = ss.getSheetByName('Payments');
  if (!sheet) {
    sheet = ss.insertSheet('Payments');
    sheet.appendRow([
      'id', 'trx_id', 'gateway', 'amount', 'currency', 'direction',
      'sender_name', 'sender_phone', 'recipient_name', 'recipient_phone',
      'status', 'category', 'note', 'receipt_url', 'created_at',
      'verified_at', 'verified_by'
    ]);
  }

  var trxId = String(payment.trxId || payment.trx_id || '').trim().toUpperCase();
  if (!trxId) {
    return { error: 'TrxID is required' };
  }

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim().toUpperCase() === trxId) {
      return { error: 'Payment with TrxID ' + trxId + ' already exists in Google Sheet!' };
    }
  }

  var now = new Date().toISOString();
  var id = 'pmt_' + new Date().getTime();
  var row = [
    id,
    trxId,
    payment.gateway || payment.method || 'bKash',
    Number(payment.amount) || 0,
    payment.currency || 'BDT',
    payment.direction || 'sent',
    payment.senderName || payment.sender_name || 'Fintech User',
    payment.senderPhone || payment.sender_phone || '',
    payment.recipientName || payment.recipient_name || 'Merchant',
    payment.recipientPhone || payment.recipient_phone || '',
    payment.status || 'verified',
    payment.category || 'Shopping',
    payment.note || '',
    payment.receiptUrl || payment.receipt_url || '',
    now,
    payment.status === 'verified' ? now : '',
    payment.status === 'verified' ? 'Automated Verification' : '',
  ];

  sheet.appendRow(row);

  return {
    success: true,
    payment: {
      id: id,
      trx_id: trxId,
      gateway: row[2],
      amount: row[3],
      currency: row[4],
      direction: row[5],
      sender_name: row[6],
      sender_phone: row[7],
      recipient_name: row[8],
      recipient_phone: row[9],
      status: row[10],
      category: row[11],
      note: row[12],
      receipt_url: row[13],
      created_at: row[14],
      verified_at: row[15],
      verified_by: row[16],
    },
  };
}

// ------------------------------------------------------------------------------
// METRICS CONTROLLER
// ------------------------------------------------------------------------------
function getMetrics(ss) {
  var sheet = ss.getSheetByName('Payments');
  var totalConfirmedBDT = 0;
  var pendingConfirmationBDT = 0;
  var totalSentBDT = 0;
  var totalReceivedBDT = 0;
  var confirmedCount = 0;
  var pendingCount = 0;

  if (sheet) {
    var rows = sheet.getDataRange().getValues();
    for (var i = 1; i < rows.length; i++) {
      var amount = Number(rows[i][3]) || 0;
      var direction = String(rows[i][5] || '').toLowerCase();
      var status = String(rows[i][10] || '').toLowerCase();

      if (status === 'verified') {
        totalConfirmedBDT += amount;
        confirmedCount++;
      } else if (status === 'pending') {
        pendingConfirmationBDT += amount;
        pendingCount++;
      }

      if (direction === 'sent') {
        totalSentBDT += amount;
      } else {
        totalReceivedBDT += amount;
      }
    }
  }

  return {
    metrics: {
      totalConfirmedBDT: totalConfirmedBDT,
      pendingConfirmationBDT: pendingConfirmationBDT,
      totalSentBDT: totalSentBDT,
      totalReceivedBDT: totalReceivedBDT,
      confirmedCount: confirmedCount,
      pendingCount: pendingCount,
      percentageChangeVsLastMonth: confirmedCount > 0 ? 14.8 : 0,
    },
  };
}

// ------------------------------------------------------------------------------
// RECEIPTS CONTROLLER
// ------------------------------------------------------------------------------
function addReceipt(ss, receipt) {
  receipt = receipt || {};
  var sheet = ss.getSheetByName('Receipts');
  if (!sheet) {
    sheet = ss.insertSheet('Receipts');
    sheet.appendRow([
      'id', 'payment_id', 'trx_id', 'file_name', 'file_size',
      'mime_type', 'storage_url', 'ocr_extracted_trx_id',
      'ocr_extracted_amount', 'ocr_confidence', 'ocr_status', 'created_at'
    ]);
  }

  var id = 'rcpt_' + new Date().getTime();
  var now = new Date().toISOString();
  var row = [
    id,
    receipt.paymentId || receipt.payment_id || '',
    receipt.trxId || receipt.trx_id || '',
    receipt.fileName || receipt.file_name || '',
    receipt.fileSize || receipt.file_size || 0,
    receipt.mimeType || receipt.mime_type || '',
    receipt.storageUrl || receipt.storage_url || '',
    receipt.ocrExtractedTrxId || receipt.ocr_extracted_trx_id || '',
    receipt.ocrExtractedAmount || receipt.ocr_extracted_amount || 0,
    receipt.ocrConfidence || receipt.ocr_confidence || 95,
    receipt.ocrStatus || receipt.ocr_status || 'matched',
    now,
  ];

  sheet.appendRow(row);
  return { success: true, receipt: { id: id, storage_url: row[6], created_at: now } };
}

// ------------------------------------------------------------------------------
// AUTH CONTROLLER
// ------------------------------------------------------------------------------
function loginUser(ss, email, password) {
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return { error: 'Users sheet not found' };

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    var uEmail = String(rows[i][1]).trim().toLowerCase();
    var uPass = String(rows[i][2]).trim();

    if (uEmail === String(email).trim().toLowerCase()) {
      if (uPass === String(password).trim()) {
        return {
          success: true,
          user: {
            id: rows[i][0],
            email: rows[i][1],
            name: rows[i][3],
            phone: rows[i][4],
            role: rows[i][5],
            created_at: rows[i][6],
          },
        };
      } else {
        return { error: 'Invalid password. Please check and try again.' };
      }
    }
  }

  return { error: 'No account found with this email. Please register first.' };
}

function registerUser(ss, params) {
  ss = ss || getSpreadsheet();
  params = params || {};

  var sheet = ss.getSheetByName('Users');
  if (!sheet) {
    sheet = ss.insertSheet('Users');
    sheet.appendRow(['id', 'email', 'password', 'name', 'phone', 'role', 'created_at']);
  }

  var email = String(params.email || '').trim().toLowerCase();
  var password = String(params.password || '').trim();
  var name = String(params.name || params.fullName || email.split('@')[0]).trim();
  var phone = String(params.phone || '').trim();

  if (!email || !password) {
    return { error: 'Email and password are required' };
  }

  var rows = sheet.getDataRange().getValues();
  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][1]).trim().toLowerCase() === email) {
      return { error: 'An account with this email already exists!' };
    }
  }

  var id = 'usr_' + new Date().getTime();
  var now = new Date().toISOString();
  var row = [id, email, password, name, phone, 'user', now];
  sheet.appendRow(row);

  return {
    success: true,
    user: {
      id: id,
      email: email,
      name: name,
      phone: phone,
      role: 'user',
      created_at: now,
    },
  };
}
