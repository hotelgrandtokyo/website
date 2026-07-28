/*
  Hotel Grand Tokyo - Professional Google Apps Script Backend v3.0
  Use this as Code.gs in the Google Sheet-bound Apps Script project.

  Security notes:
  - Anything sent from main.js is public and cannot be trusted.
  - Keep this Sheet private; only trusted admins should have editor access.
  - Admin email is controlled here, not by browser-submitted data.
*/

const PUBLIC_READ_TOKEN = 'TOKYO_PRIVATE_KEY_9801';
const ADMIN_EMAIL_FALLBACK = 'hotelgrandtokyo@gmail.com';
const HOTEL_NAME = 'Hotel Grand Tokyo';
const HOTEL_PHONE = '01-5904107 | 9761799648';
const HOTEL_ADDRESS = 'Baghdurbar-11, Sundhara, Kathmandu, Nepal';
const BOOKING_PHONE_COOLDOWN_SECONDS = 10 * 60;
const BOOKING_EMAIL_COOLDOWN_SECONDS = 10 * 60;
const BOOKING_DUPLICATE_WINDOW_HOURS = 12;
const BOOKING_DAILY_LIMIT_PER_PHONE = 3;
const BOOKING_DAILY_LIMIT_PER_EMAIL = 3;
const CONTACT_COOLDOWN_SECONDS = 5 * 60;
const CONTACT_DAILY_LIMIT = 5;
const NEWSLETTER_COOLDOWN_SECONDS = 10 * 60;

const PUBLIC_SHEETS = {
  Settings: ['Key', 'Value'],
  Home_Content: ['Component', 'Title', 'Description', 'ImageURL', 'Extra_Data', 'Order'],
  Rooms: ['Title', 'Description', 'Price', 'Guests', 'Amenities', 'Features', 'ImageURL', 'Order'],
  Services: ['Title', 'Description', 'Icon', 'ImageURL', 'Order'],
  Offers: ['Title', 'Description', 'Price', 'Rate', 'Tag', 'Category', 'ImageURL', 'Order'],
  Blogs: ['Title', 'Date', 'Excerpt', 'Body', 'ImageURL', 'Order'],
  Gallery: ['Caption', 'ImageURL', 'Order'],
  Testimonials: ['Author', 'Quote', 'Rating', 'Location', 'Source', 'AvatarURL', 'Order'],
  About: ['Title', 'Subtitle', 'Body', 'ImageURL', 'Order']
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Website Admin')
    .addItem('Setup / Reset All Sheets', 'setupDatabase')
    .addToUi();
}

function doGet(e) {
  try {
    if (!e || !e.parameter || e.parameter.key !== PUBLIC_READ_TOKEN) {
      return jsonResponse({
        status: 'error',
        message: 'Access restricted.'
      });
    }

    return jsonResponse(getWebsiteData());
  } catch (err) {
    logError('doGet', err);
    return jsonResponse({ status: 'error', message: 'Unable to load website data.' });
  }
}

function doPost(e) {
  try {
    const request = parseRequest(e);

    if (request.honeypot) {
      return jsonResponse({ status: 'success', message: 'Received.' });
    }

    if (request.type === 'newsletter') {
      return handleNewsletterSubscription(request.email);
    }

    if (request.type === 'contact') {
      return handleContactForm(request);
    }

    return handleBookingForm(request);
  } catch (err) {
    logError('doPost', err);
    return jsonResponse({ status: 'error', message: 'Request could not be processed.' });
  }
}

function parseRequest(e) {
  const params = (e && e.parameter) ? e.parameter : {};

  if (params['newsletter-email']) {
    return {
      type: 'newsletter',
      email: cleanEmail(params['newsletter-email']),
      honeypot: ''
    };
  }

  if (params['contact-name']) {
    return {
      type: 'contact',
      name: cleanText(params['contact-name'], 80),
      email: cleanEmail(params['contact-email']),
      phone: cleanPhone(params['contact-phone']),
      subject: cleanText(params['contact-subject'], 80),
      message: cleanText(params['contact-message'], 1200),
      honeypot: cleanText(params.website || params.honeypot || '', 80)
    };
  }

  let data = {};
  if (e && e.postData && e.postData.contents) {
    data = safeJsonParse(e.postData.contents);
  }

  return {
    type: 'booking',
    name: cleanText(data.name, 80),
    email: cleanEmail(data.email),
    phone: cleanPhone(data.phone),
    room: cleanText(data.room, 120),
    pax: cleanNumber(data.pax, 1, 50, 1),
    rooms: cleanNumber(data.rooms, 1, 20, 1),
    message: cleanText(data.message, 1500),
    source: cleanText(data.source, 80) || 'official-website',
    honeypot: cleanText(data.website || data.honeypot || '', 80)
  };
}

function handleBookingForm(data) {
  validateBooking(data);
  rateLimit('booking:global', 5);
  rateLimit('booking:phone:' + normalizePhoneDigits(data.phone), BOOKING_PHONE_COOLDOWN_SECONDS);
  if (data.email) rateLimit('booking:email:' + data.email, BOOKING_EMAIL_COOLDOWN_SECONDS);
  rateLimit('booking:sig:' + requestSignature([data.name, data.phone, data.email, data.room, data.message]), BOOKING_DUPLICATE_WINDOW_HOURS * 60 * 60);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet('Bookings', [
    'Date', 'Reference', 'Name', 'Email', 'Phone', 'Room', 'Pax', 'Rooms', 'Message', 'Source', 'Status'
  ]);

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  let ref = '';
  try {
    enforceBookingLimits(sheet, data);
    ref = 'BKT' + Date.now().toString().slice(-8);
    sheet.appendRow([
      new Date(),
      ref,
      data.name,
      data.email,
      data.phone,
      data.room,
      data.pax,
      data.rooms,
      data.message,
      data.source,
      'Pending'
    ]);
  } finally {
    lock.releaseLock();
  }

  sendAdminBookingEmail(data, ref);
  if (data.email) sendCustomerBookingEmail(data, ref);

  return jsonResponse({
    status: 'success',
    message: 'Reservation request received. Reference: #' + ref,
    bookingRef: ref
  });
}

function handleContactForm(data) {
  validateContact(data);
  rateLimit('contact:global', 5);
  rateLimit('contact:' + (normalizePhoneDigits(data.phone) || data.email), CONTACT_COOLDOWN_SECONDS);
  rateLimit('contact:sig:' + requestSignature([data.name, data.phone, data.email, data.subject, data.message]), CONTACT_COOLDOWN_SECONDS);

  const sheet = getOrCreateSheet('Contact', [
    'Date', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status'
  ]);

  enforceContactLimits(sheet, data);

  sheet.appendRow([
    new Date(),
    data.name,
    data.email,
    data.phone,
    data.subject,
    data.message,
    'New'
  ]);

  sendAdminContactEmail(data);
  return jsonResponse({ status: 'success', message: 'Message sent successfully.' });
}

function handleNewsletterSubscription(email) {
  if (!isValidEmail(email)) {
    return jsonResponse({ status: 'error', message: 'Please enter a valid email address.' });
  }

  rateLimit('newsletter:' + email, NEWSLETTER_COOLDOWN_SECONDS);

  const sheet = getOrCreateSheet('Newsletter', ['Date', 'Email', 'Status']);
  const lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    const emails = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat().map(String);
    if (emails.includes(email)) {
      return jsonResponse({ status: 'success', message: 'Already subscribed.' });
    }
  }

  sheet.appendRow([new Date(), email, 'Subscribed']);
  return jsonResponse({ status: 'success', message: 'Subscribed successfully.' });
}

function getWebsiteData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const result = { status: 'success', settings: {}, data: {} };

  Object.keys(PUBLIC_SHEETS).forEach(function(sheetName) {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet || sheet.getLastRow() < 1) return;

    const values = sheet.getDataRange().getValues();
    const headers = values[0].map(function(h) { return String(h).trim(); });
    const allowed = PUBLIC_SHEETS[sheetName];
    const rows = values.slice(1).map(function(row) {
      const obj = {};
      allowed.forEach(function(key) {
        const idx = headers.indexOf(key);
        obj[key] = idx >= 0 ? cleanPublicValue(row[idx], key) : '';
      });
      return obj;
    }).filter(function(row) {
      return Object.keys(row).some(function(k) { return String(row[k]).trim() !== ''; });
    });

    if (sheetName === 'Settings') {
      rows.forEach(function(item) {
        if (item.Key) result.settings[item.Key] = item.Value;
      });
    } else {
      rows.sort(function(a, b) {
        return Number(a.Order || 999) - Number(b.Order || 999);
      });
      result.data[sheetName.toLowerCase()] = rows;
    }
  });

  return result;
}

function validateBooking(data) {
  if (!data.name || data.name.length < 2) throw new Error('Invalid name.');
  if (!data.phone || data.phone.length < 7) throw new Error('Invalid phone number.');
  if (!data.room) throw new Error('Please choose a room.');
  if (isLowQualityName(data.name)) throw new Error('Invalid name.');
  if (String(data.message || '').length > 1200) throw new Error('Message is too long.');
  if (data.email && !isValidEmail(data.email)) throw new Error('Invalid email address.');
  if (hasSuspiciousContent(data.name + ' ' + data.room + ' ' + data.message)) {
    throw new Error('Invalid message content.');
  }
}

function validateContact(data) {
  if (!data.name || data.name.length < 2) throw new Error('Invalid name.');
  if (!data.message || data.message.length < 5) throw new Error('Message is too short.');
  if (isLowQualityName(data.name)) throw new Error('Invalid name.');
  if (data.email && !isValidEmail(data.email)) throw new Error('Invalid email address.');
  if (!data.phone && !data.email) throw new Error('Please provide phone or email.');
  if (hasSuspiciousContent(data.name + ' ' + data.subject + ' ' + data.message)) {
    throw new Error('Invalid message content.');
  }
}

function sendCustomerBookingEmail(data, ref) {
  const subject = 'Reservation Request Received - Hotel Grand Tokyo #' + ref;
  const html = emailShell(
    'Reservation Request Received',
    '<p>Dear <strong>' + esc(data.name) + '</strong>, thank you for contacting Hotel Grand Tokyo. Your reservation request has been received. Our team will contact you to confirm availability.</p>' +
    detailTable([
      ['Reference', '#' + ref],
      ['Room', data.room],
      ['Guests', data.pax],
      ['Rooms', data.rooms],
      ['Phone', data.phone],
      ['Message', data.message || 'None']
    ])
  );

  GmailApp.sendEmail(data.email, subject, 'Your reservation request #' + ref + ' has been received.', {
    htmlBody: html,
    name: HOTEL_NAME
  });
}

function sendAdminBookingEmail(data, ref) {
  const adminEmail = getAdminEmail();
  const subject = 'New Booking Request: ' + data.name + ' #' + ref;
  const html = emailShell(
    'New Booking Request',
    detailTable([
      ['Reference', '#' + ref],
      ['Name', data.name],
      ['Phone', data.phone],
      ['Email', data.email || 'Not provided'],
      ['Room', data.room],
      ['Guests', data.pax],
      ['Rooms', data.rooms],
      ['Source', data.source],
      ['Message', data.message || 'None']
    ])
  );

  GmailApp.sendEmail(adminEmail, subject, 'New booking request from ' + data.name + ' | ' + data.phone, {
    htmlBody: html,
    name: HOTEL_NAME
  });
}

function sendAdminContactEmail(data) {
  const adminEmail = getAdminEmail();
  const subject = 'Website Contact: ' + (data.subject || 'General Inquiry');
  const html = emailShell(
    'New Contact Message',
    detailTable([
      ['Name', data.name],
      ['Phone', data.phone || 'Not provided'],
      ['Email', data.email || 'Not provided'],
      ['Subject', data.subject || 'General Inquiry'],
      ['Message', data.message]
    ])
  );

  GmailApp.sendEmail(adminEmail, subject, 'New contact message from ' + data.name, {
    htmlBody: html,
    name: HOTEL_NAME
  });
}

function emailShell(title, bodyHtml) {
  return '' +
    '<div style="max-width:620px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">' +
    '<div style="background:#0f5f4a;padding:26px;text-align:center">' +
    '<h1 style="color:#fff;margin:0;font-size:22px">' + esc(HOTEL_NAME) + '</h1>' +
    '<p style="color:#d7efe7;margin:6px 0 0;font-size:13px">Sundhara, Kathmandu</p>' +
    '</div>' +
    '<div style="padding:28px">' +
    '<h2 style="margin:0 0 14px;color:#111827;font-size:20px">' + esc(title) + '</h2>' +
    bodyHtml +
    '<div style="background:#f8f5ee;border-radius:6px;padding:16px;margin-top:22px;text-align:center;color:#374151;font-size:13px">' +
    '<strong>Need quick help?</strong><br>' + esc(HOTEL_PHONE) + '<br>' + esc(ADMIN_EMAIL_FALLBACK) +
    '</div></div>' +
    '<div style="background:#f3f4f6;padding:14px;text-align:center;color:#6b7280;font-size:12px">' + esc(HOTEL_ADDRESS) + '</div>' +
    '</div>';
}

function detailTable(rows) {
  return '<table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151">' +
    rows.map(function(row) {
      return '<tr>' +
        '<td style="padding:9px;border-bottom:1px solid #eee;background:#fafafa;font-weight:700;width:34%">' + esc(row[0]) + '</td>' +
        '<td style="padding:9px;border-bottom:1px solid #eee">' + esc(row[1]) + '</td>' +
      '</tr>';
    }).join('') +
    '</table>';
}

function getSettings() {
  return getWebsiteData().settings || {};
}

function getAdminEmail() {
  const email = cleanEmail(PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL') || ADMIN_EMAIL_FALLBACK);
  return isValidEmail(email) ? email : ADMIN_EMAIL_FALLBACK;
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  return sheet;
}

function rateLimit(key, seconds) {
  const cache = CacheService.getScriptCache();
  const safeKey = key.replace(/[^a-zA-Z0-9:_@.+-]/g, '').slice(0, 200);
  if (cache.get(safeKey)) throw new Error('Please wait before submitting again.');
  cache.put(safeKey, '1', seconds);
}

function enforceBookingLimits(sheet, data) {
  const phoneDigits = normalizePhoneDigits(data.phone);
  const email = data.email || '';

  if (countRecentRows(sheet, 24, function(row) {
    return normalizePhoneDigits(row[4]) === phoneDigits;
  }) >= BOOKING_DAILY_LIMIT_PER_PHONE) {
    throw new Error('Daily booking limit reached for this phone number.');
  }

  if (email && countRecentRows(sheet, 24, function(row) {
    return cleanEmail(row[3]) === email;
  }) >= BOOKING_DAILY_LIMIT_PER_EMAIL) {
    throw new Error('Daily booking limit reached for this email address.');
  }

  if (isDuplicateRecentBooking(sheet, data, BOOKING_DUPLICATE_WINDOW_HOURS)) {
    throw new Error('This booking request was already received recently.');
  }
}

function enforceContactLimits(sheet, data) {
  const phoneDigits = normalizePhoneDigits(data.phone);
  const email = data.email || '';

  const recentCount = countRecentRows(sheet, 24, function(row) {
    return (phoneDigits && normalizePhoneDigits(row[3]) === phoneDigits) || (email && cleanEmail(row[2]) === email);
  });

  if (recentCount >= CONTACT_DAILY_LIMIT) {
    throw new Error('Daily message limit reached. Please call or WhatsApp the hotel.');
  }
}

function countRecentRows(sheet, hours, predicate) {
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 0;

  const now = Date.now();
  const cutoffMs = hours * 60 * 60 * 1000;
  const startRow = Math.max(2, lastRow - 200);
  const values = sheet.getRange(startRow, 1, lastRow - startRow + 1, sheet.getLastColumn()).getValues();

  return values.reduce(function(count, row) {
    const rowDate = row[0] instanceof Date ? row[0].getTime() : 0;
    if (!rowDate || now - rowDate > cutoffMs) return count;
    return predicate(row) ? count + 1 : count;
  }, 0);
}

function isDuplicateRecentBooking(sheet, data, hours) {
  const phoneDigits = normalizePhoneDigits(data.phone);
  const normalizedRoom = cleanText(data.room, 120).toLowerCase();
  const normalizedName = cleanText(data.name, 80).toLowerCase();

  return countRecentRows(sheet, hours, function(row) {
    return normalizePhoneDigits(row[4]) === phoneDigits &&
      cleanText(row[5], 120).toLowerCase() === normalizedRoom &&
      cleanText(row[2], 80).toLowerCase() === normalizedName;
  }) > 0;
}

function requestSignature(parts) {
  const raw = parts.map(function(part) {
    return cleanText(part, 300).toLowerCase();
  }).join('|');
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
  return Utilities.base64EncodeWebSafe(digest).replace(/=+$/g, '').slice(0, 40);
}

function normalizePhoneDigits(value) {
  return String(value || '').replace(/\D/g, '').slice(-15);
}

function safeJsonParse(value) {
  try {
    return JSON.parse(String(value || '{}'));
  } catch (err) {
    throw new Error('Invalid request format.');
  }
}

function cleanPublicValue(value, key) {
  const text = cleanText(value, 3000);
  if (/url|image|avatar|photo|map/i.test(key)) return cleanUrlList(text);
  if (/icon/i.test(key)) return text.replace(/[^a-zA-Z0-9\-\s]/g, '').trim();
  return text;
}

function cleanText(value, maxLength) {
  return String(value == null ? '' : value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength || 1000);
}

function cleanEmail(value) {
  return cleanText(value, 160).toLowerCase();
}

function cleanPhone(value) {
  return cleanText(value, 40).replace(/[^\d+\-\s()]/g, '');
}

function cleanNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function cleanUrlList(value) {
  return String(value || '').split(',').map(function(url) {
    const clean = cleanText(url, 600).replace(/[\u0000-\u001F\u007F'"`\\()]/g, '');
    if (/^https:\/\/[^\s<>"]+$/i.test(clean)) return clean;
    if (/^[./]?[a-zA-Z0-9_\-./]+\.(png|jpe?g|webp|gif|svg)$/i.test(clean)) return clean;
    return '';
  }).filter(Boolean).join(',');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

function hasSuspiciousContent(text) {
  return /<\s*script|javascript:|onerror\s*=|onload\s*=|<\s*iframe|<\s*object|https?:\/\/|www\.|bit\.ly|t\.me\/|free money|crypto|casino|viagra|loan/i.test(String(text || ''));
}

function isLowQualityName(value) {
  const name = cleanText(value, 80);
  const letters = name.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 2) return true;
  if (/(.)\1{4,}/i.test(letters)) return true;
  if (/^[bcdfghjklmnpqrstvwxyz]{7,}$/i.test(letters)) return true;
  return false;
}

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function logError(where, err) {
  Logger.log(where + ': ' + (err && err.stack ? err.stack : err));
}

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = [
    'Settings', 'Home_Content', 'Rooms', 'Services', 'Offers', 'Blogs',
    'Gallery', 'Testimonials', 'About', 'Bookings', 'Contact', 'Newsletter'
  ];

  sheets.forEach(function(name) {
    if (!ss.getSheetByName(name)) ss.insertSheet(name);
  });

  const settings = ss.getSheetByName('Settings');
  settings.clear();
  settings.appendRow(['Key', 'Value', 'Notes']);
  settings.getRange('A2:C6').setValues([
    ['siteName', HOTEL_NAME, 'Public hotel name'],
    ['contactEmail', ADMIN_EMAIL_FALLBACK, 'Public contact email. Admin notification email should be set in Script Properties as ADMIN_EMAIL.'],
    ['contactPhone', '9761799648, 01-5904107', 'Public phone numbers'],
    ['address', 'Baghdurbar-11, Sundhara, Kathmandu', 'Public address'],
    ['mapEmbedUrl', '', 'Optional public Google Maps embed URL']
  ]);

  getOrCreateSheet('Bookings', ['Date', 'Reference', 'Name', 'Email', 'Phone', 'Room', 'Pax', 'Rooms', 'Message', 'Source', 'Status']);
  getOrCreateSheet('Contact', ['Date', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Status']);
  getOrCreateSheet('Newsletter', ['Date', 'Email', 'Status']);

  SpreadsheetApp.getUi().alert('Database ready. Keep this Sheet private and restrict editor access.');
}

function testEmail() {
  sendAdminBookingEmail({
    name: 'Test User',
    phone: '9761799648',
    email: '',
    room: 'Test Room',
    pax: 2,
    rooms: 1,
    message: 'This is a test booking.',
    source: 'test'
  }, 'TEST');
}
