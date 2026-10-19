const path = require('path');
const multer = require('multer');

const MAX_CERTIFICATE_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_CERTIFICATE_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);
const ALLOWED_CERTIFICATE_EXTENSIONS = new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp']);

class CertificateUploadValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CertificateUploadValidationError';
  }
}

class CertificateUploadStorageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CertificateUploadStorageError';
  }
}

const createCertificateUploadMiddleware = (storage) => multer({
  storage,
  limits: { fileSize: MAX_CERTIFICATE_UPLOAD_BYTES, files: 1 },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const mimeType = String(file.mimetype || '').toLowerCase();
    if (!ALLOWED_CERTIFICATE_EXTENSIONS.has(extension) || !ALLOWED_CERTIFICATE_MIME_TYPES.has(mimeType)) {
      return callback(new CertificateUploadValidationError('Only PDF, JPG, PNG, and WebP certificates are allowed.'));
    }
    return callback(null, true);
  },
});

const classifyCertificateUploadError = (error) => {
  if (error instanceof CertificateUploadValidationError) return { status: 400, message: error.message };
  if (error instanceof CertificateUploadStorageError) return { status: 502, message: error.message };
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') return { status: 413, message: 'Certificate exceeds the 10 MB upload limit.' };
    return { status: 400, message: 'Invalid certificate upload request.' };
  }
  if (error?.name === 'CloudinaryError' || Number.isInteger(error?.http_code) || error?.error?.http_code) {
    return { status: 502, message: 'Certificate storage upload failed. Please try again.' };
  }
  return { status: 500, message: 'Certificate upload failed. Please try again.' };
};

const sendCertificateUploadError = (res, error) => {
  const response = classifyCertificateUploadError(error);
  console.error(JSON.stringify({
    event: 'member_certificate_upload_failed',
    errorClass: error?.constructor?.name || typeof error,
    code: typeof error?.code === 'string' ? error.code : undefined,
  }));
  return res.status(response.status).json({ message: response.message });
};

module.exports = {
  ALLOWED_CERTIFICATE_EXTENSIONS,
  ALLOWED_CERTIFICATE_MIME_TYPES,
  CertificateUploadStorageError,
  CertificateUploadValidationError,
  MAX_CERTIFICATE_UPLOAD_BYTES,
  classifyCertificateUploadError,
  createCertificateUploadMiddleware,
  sendCertificateUploadError,
};
