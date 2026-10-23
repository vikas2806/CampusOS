const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { QR_SECRET, CLIENT_URL } = require('../config/env');

// generate a signed QR token for a registration
function generateQrToken(registrationId, eventId) {
  return jwt.sign(
    { registrationId: registrationId.toString(), eventId: eventId.toString(), type: 'checkin' },
    QR_SECRET,
    { expiresIn: '365d' }
  );
}

// verify a QR token
function verifyQrToken(token) {
  return jwt.verify(token, QR_SECRET);
}

// generate QR code as base64 data URL
async function generateQrDataUrl(token) {
  const verifyUrl = `${CLIENT_URL || 'http://localhost:5173'}/checkin?token=${token}`;
  const dataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 300,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
  return dataUrl;
}

module.exports = { generateQrToken, verifyQrToken, generateQrDataUrl };
