const path = require('path');
const multer = require('multer');

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

class UploadValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UploadValidationError';
  }
}

class UploadStorageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UploadStorageError';
  }
}

const createUploadMiddleware = (storage) => multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname || '').toLowerCase();
    const extensionAllowed = ALLOWED_IMAGE_EXTENSIONS.has(extension);
    const mimeTypeAllowed = !file.mimetype || ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype.toLowerCase());

    if (!extensionAllowed || !mimeTypeAllowed) {
      return callback(new UploadValidationError('Only JPG, PNG, and WebP images are allowed.'));
    }

    return callback(null, true);
  },
});

const getUpstreamStatus = (error) => {
  const candidates = [error?.http_code, error?.statusCode, error?.status, error?.error?.http_code];
  return candidates.find(value => Number.isInteger(value) && value >= 100 && value <= 599);
};

const getErrorCode = (error) => {
  if (typeof error?.code === 'string' && error.code.length <= 80) return error.code;
  return undefined;
};

const redactSecrets = (message) => {
  let safeMessage = String(message || 'Upload middleware rejected the request');
  const secretValues = [
    process.env.MONGODB_URI,
    process.env.JWT_SECRET,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
  ].filter(value => typeof value === 'string' && value.length >= 4);

  for (const secret of secretValues) safeMessage = safeMessage.split(secret).join('[REDACTED]');

  return safeMessage
    .replace(/(authorization\s*[:=]\s*bearer\s+)[^\s,]+/gi, '$1[REDACTED]')
    .replace(/(password|secret|token|api[_-]?key)\s*[:=]\s*[^\s,]+/gi, '$1=[REDACTED]');
};

const describeUploadError = (error) => ({
  operation: 'admin_image_upload',
  errorClass: error?.constructor?.name || typeof error,
  message: redactSecrets(error?.message || error?.error?.message),
  ...(getErrorCode(error) ? { code: getErrorCode(error) } : {}),
  ...(getUpstreamStatus(error) ? { upstreamStatus: getUpstreamStatus(error) } : {}),
});

const isCloudinaryError = (error) => Boolean(
  getUpstreamStatus(error)
  || error?.name === 'CloudinaryError'
  || error?.error?.http_code,
);

const classifyUploadError = (error) => {
  if (error instanceof UploadValidationError) {
    return { status: 400, message: error.message };
  }

  if (error instanceof UploadStorageError) {
    return { status: 502, message: error.message };
  }

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return { status: 413, message: 'Image exceeds the 10 MB upload limit.' };
    }
    return { status: 400, message: 'Invalid image upload request.' };
  }

  if (isCloudinaryError(error)) {
    return { status: 502, message: 'Image storage upload failed. Please try again.' };
  }

  return { status: 500, message: 'Image upload failed. Please try again.' };
};

const sendUploadError = (res, error) => {
  const details = describeUploadError(error);
  console.error(JSON.stringify({ event: 'admin_upload_failed', ...details }));
  const response = classifyUploadError(error);
  return res.status(response.status).json({ message: response.message });
};

module.exports = {
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_UPLOAD_BYTES,
  UploadValidationError,
  UploadStorageError,
  classifyUploadError,
  createUploadMiddleware,
  describeUploadError,
  sendUploadError,
};
