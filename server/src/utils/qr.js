const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

/**
 * Generates a unique QR code string (UUID-based).
 * This value is stored in the Registration.qrCode field.
 * @returns {string} Unique QR code identifier
 */
const generateQRCodeValue = () => {
  return `CF-${uuidv4().toUpperCase()}`;
};

/**
 * Generates a QR code as a Data URL (base64 PNG).
 * Useful for embedding in emails or returning to frontend.
 * @param {string} value - The string to encode (typically the QR code identifier)
 * @returns {Promise<string>} Base64 data URL (data:image/png;base64,...)
 */
const generateQRCodeDataURL = async (value) => {
  const dataUrl = await QRCode.toDataURL(value, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 300,
    margin: 2,
    color: {
      dark: '#111827',
      light: '#FFFFFF',
    },
  });
  return dataUrl;
};

/**
 * Generates a QR code as a Buffer (PNG).
 * Useful for saving to disk or attaching to emails.
 * @param {string} value - The string to encode
 * @returns {Promise<Buffer>} PNG buffer
 */
const generateQRCodeBuffer = async (value) => {
  const buffer = await QRCode.toBuffer(value, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 300,
    margin: 2,
    color: {
      dark: '#111827',
      light: '#FFFFFF',
    },
  });
  return buffer;
};

/**
 * Generates a QR code as an SVG string.
 * Useful for rendering in HTML/PDF certificates.
 * @param {string} value - The string to encode
 * @returns {Promise<string>} SVG markup string
 */
const generateQRCodeSVG = async (value) => {
  const svg = await QRCode.toString(value, {
    type: 'svg',
    errorCorrectionLevel: 'H',
    width: 200,
    margin: 2,
  });
  return svg;
};

module.exports = {
  generateQRCodeValue,
  generateQRCodeDataURL,
  generateQRCodeBuffer,
  generateQRCodeSVG,
};
