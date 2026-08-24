const sanitizeHtml = require('sanitize-html');
const validator = require('validator');

const sanitizeString = (str, options = {}) => {
  if (!str || typeof str !== 'string') return '';
  return sanitizeHtml(str, { allowedTags: options.allowedTags || [], allowedAttributes: {}, textFilter: (text) => text.replace(/[<>]/g, '') }).trim();
};

const sanitizeEmail = (email) => {
  if (!email) return '';
  const cleaned = email.toLowerCase().trim();
  if (!validator.isEmail(cleaned)) return '';
  return cleaned;
};

const sanitizeFilename = (filename) => {
  if (!filename) return '';
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_{2,}/g, '_').substring(0, 255);
};

const sanitizePhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 ? digits : '';
};

const sanitizeUrl = (url) => {
  if (!url) return '';
  const cleaned = url.trim();
  if (!validator.isURL(cleaned, { require_protocol: true })) return '';
  return cleaned;
};

const sanitizeObject = (obj, allowedFields = []) => {
  if (!obj || typeof obj !== 'object') return {};
  const result = {};
  for (const key of allowedFields) {
    if (obj[key] !== undefined) result[key] = sanitizeString(String(obj[key]));
  }
  return result;
};

module.exports = { sanitizeString, sanitizeEmail, sanitizeFilename, sanitizePhone, sanitizeUrl, sanitizeObject };
