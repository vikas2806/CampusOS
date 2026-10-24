const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { CLIENT_URL } = require('../config/env');

function generateCertificateCode(registrationId) {
  const prefix = 'COS';
  const regPart = registrationId.toString().slice(-4).toUpperCase();
  const randPart = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `${prefix}-${regPart}-${randPart}`;
}

async function generateCertificatePdf({ template = {}, registration, event, club }) {
  const pdfDoc = await PDFDocument.create();
  // Landscape A4: 842 x 595 pt
  const width = 842;
  const height = 595;
  const page = pdfDoc.addPage([width, height]);

  // Select fonts based on style
  const isClassic = template.style === 'classic';
  const titleFont = isClassic
    ? await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
    : await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = isClassic
    ? await pdfDoc.embedFont(StandardFonts.TimesRoman)
    : await pdfDoc.embedFont(StandardFonts.Helvetica);
  const italicFont = isClassic
    ? await pdfDoc.embedFont(StandardFonts.TimesRomanItalic)
    : await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Style colors
  let primaryColor = rgb(79 / 255, 70 / 255, 229 / 255); // Indigo
  let accentColor = rgb(245 / 255, 158 / 255, 11 / 255); // Amber

  if (template.style === 'gold') {
    primaryColor = rgb(180 / 255, 115 / 255, 10 / 255);
    accentColor = rgb(217 / 255, 119 / 255, 6 / 255);
  } else if (template.style === 'classic') {
    primaryColor = rgb(30 / 255, 58 / 255, 138 / 255); // Deep Navy
    accentColor = rgb(148 / 255, 163 / 255, 184 / 255);
  } else if (template.style === 'minimal') {
    primaryColor = rgb(51 / 255, 65 / 255, 85 / 255);
    accentColor = rgb(100 / 255, 116 / 255, 139 / 255);
  }

  const textColor = rgb(15 / 255, 23 / 255, 42 / 255);
  const mutedColor = rgb(100 / 255, 116 / 255, 139 / 255);

  // Background Fill (Soft warm white)
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(254 / 255, 254 / 255, 255 / 255),
  });

  // Outer Decorative Border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: primaryColor,
    borderWidth: 4,
  });

  // Inner Subtle Border
  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderColor: accentColor,
    borderWidth: 1.5,
  });

  const drawCentered = (text, y, size, font, color) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color,
    });
  };

  // Organization / Club Header
  const orgName = (club && club.name ? club.name : 'CampusOS Academy').toUpperCase();
  drawCentered(orgName, 520, 13, boldFont, accentColor);

  // Certificate Title
  const title = template.title || 'CERTIFICATE OF PARTICIPATION';
  drawCentered(title.toUpperCase(), 468, 28, titleFont, primaryColor);

  // Subtitle
  const subtitle = template.subtitle || 'This is proudly presented to';
  drawCentered(subtitle, 425, 15, italicFont, mutedColor);

  // Recipient Name
  const recipientName = registration.name || 'Participant Name';
  drawCentered(recipientName, 370, 30, titleFont, textColor);

  // Underline beneath recipient name
  const nameWidth = titleFont.widthOfTextAtSize(recipientName, 30);
  page.drawLine({
    start: { x: (width - nameWidth) / 2 - 20, y: 360 },
    end: { x: (width + nameWidth) / 2 + 20, y: 360 },
    thickness: 1.5,
    color: primaryColor,
  });

  // Body / Description
  const eventTitle = event && event.title ? event.title : 'the event';
  const defaultBody = `for active participation and successful completion of ${eventTitle}.`;
  const bodyText = template.body ? template.body.replace('{eventName}', eventTitle) : defaultBody;
  drawCentered(bodyText, 325, 14, bodyFont, textColor);

  // Date
  const issueDateObj = template.issueDate ? new Date(template.issueDate) : new Date();
  const dateStr = `Issued on: ${issueDateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}`;
  drawCentered(dateStr, 290, 11, italicFont, mutedColor);

  // Verification Code
  const certCode = registration.certificateCode || generateCertificateCode(registration._id);
  const verifyUrl = `${CLIENT_URL || 'http://localhost:5173'}/verify/${certCode}`;

  // QR Code for verification
  try {
    const qrBuffer = await QRCode.toBuffer(verifyUrl, {
      type: 'png',
      width: 140,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    });
    const qrImage = await pdfDoc.embedPng(qrBuffer);
    page.drawImage(qrImage, {
      x: (width - 70) / 2,
      y: 115,
      width: 70,
      height: 70,
    });
  } catch (err) {
    console.error('Failed to embed QR in certificate:', err);
  }

  // Verification ID text
  const verifyText = `Verification Code: ${certCode}`;
  drawCentered(verifyText, 98, 10, boldFont, mutedColor);
  drawCentered(`Verify at: ${CLIENT_URL || 'http://localhost:5173'}/verify`, 84, 8, bodyFont, mutedColor);

  // Left Signatory (Issuer)
  const leftX = 80;
  const leftName = template.issuerName || 'Coordinator';
  const leftTitle = template.issuerTitle || 'Faculty Advisor';

  page.drawLine({
    start: { x: leftX, y: 155 },
    end: { x: leftX + 170, y: 155 },
    thickness: 1,
    color: rgb(150 / 255, 150 / 255, 150 / 255),
  });
  page.drawText(leftName, {
    x: leftX,
    y: 138,
    size: 11,
    font: boldFont,
    color: textColor,
  });
  page.drawText(leftTitle, {
    x: leftX,
    y: 122,
    size: 9,
    font: bodyFont,
    color: mutedColor,
  });

  // Right Signatory (Signatory)
  const rightX = width - 250;
  const rightName = template.signatoryName || 'President';
  const rightTitle = template.signatoryTitle || 'Club Lead';

  page.drawLine({
    start: { x: rightX, y: 155 },
    end: { x: rightX + 170, y: 155 },
    thickness: 1,
    color: rgb(150 / 255, 150 / 255, 150 / 255),
  });
  page.drawText(rightName, {
    x: rightX,
    y: 138,
    size: 11,
    font: boldFont,
    color: textColor,
  });
  page.drawText(rightTitle, {
    x: rightX,
    y: 122,
    size: 9,
    font: bodyFont,
    color: mutedColor,
  });

  const pdfBytes = await pdfDoc.save();
  return { pdfBuffer: Buffer.from(pdfBytes), certCode };
}

module.exports = {
  generateCertificateCode,
  generateCertificatePdf,
};
