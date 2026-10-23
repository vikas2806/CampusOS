const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = require('../config/env');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null; // email not configured — will console.log
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  return transporter;
}

async function sendMail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    // fallback: log to console when SMTP not configured
    console.log(`[EMAIL FALLBACK] To: ${to} | Subject: ${subject}`);
    if (text) console.log(text);
    return { fallback: true };
  }
  return t.sendMail({
    from: MAIL_FROM || SMTP_USER,
    to,
    subject,
    html,
    text,
  });
}

async function sendRegistrationConfirmation({ to, name, eventTitle, qrDataUrl, eventDate, venue }) {
  const subject = `You're registered for ${eventTitle}!`;
  const html = `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h2 style="color:#6366f1">Registration Confirmed 🎉</h2>
      <p>Hi <strong>${name}</strong>,</p>
      <p>You are registered for <strong>${eventTitle}</strong>.</p>
      ${eventDate ? `<p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>` : ''}
      ${venue ? `<p><strong>Venue:</strong> ${venue}</p>` : ''}
      <p>Show this QR code at the venue for check-in:</p>
      ${qrDataUrl ? `<img src="${qrDataUrl}" alt="QR Code" style="width:200px;height:200px" />` : ''}
      <hr/>
      <p style="color:#888;font-size:12px">Powered by CampusOS</p>
    </div>
  `;
  return sendMail({ to, subject, html });
}

module.exports = { sendMail, sendRegistrationConfirmation };
