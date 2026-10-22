import { v2 as cloudinary } from 'cloudinary';
import { ApiError } from './security';

let configured = false;

const getCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) throw new ApiError(503, 'File storage is not configured');
  if (!configured) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    configured = true;
  }
  return cloudinary;
};

const ext = (name) => String(name || '').toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || '';
const imageTypes = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const certificateTypes = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']);

const hasImageSignature = (buffer, mimeType) => {
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') return buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]));
  if (mimeType === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === 'image/webp') return buffer.subarray(0, 4).toString('ascii') === 'RIFF'
    && buffer.subarray(8, 12).toString('ascii') === 'WEBP';
  return false;
};

const readFile = async (file, { certificate = false } = {}) => {
  if (!file || typeof file.arrayBuffer !== 'function') throw new ApiError(400, 'No file uploaded');
  const max = 10 * 1024 * 1024;
  if (file.size > max) throw new ApiError(413, `${certificate ? 'Certificate' : 'Image'} exceeds the 10 MB upload limit.`);
  const allowedExtensions = certificate ? new Set(['.pdf', '.jpg', '.jpeg', '.png', '.webp']) : new Set(['.jpg', '.jpeg', '.png', '.webp']);
  if (!allowedExtensions.has(ext(file.name)) || ![...(certificate ? certificateTypes : imageTypes)].includes(String(file.type || '').toLowerCase())) {
    throw new ApiError(400, certificate ? 'Only PDF, JPG, PNG, and WebP certificates are allowed.' : 'Only JPG, PNG, and WebP images are allowed.');
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!certificate && !hasImageSignature(buffer, String(file.type || '').toLowerCase())) {
    throw new ApiError(400, 'The uploaded image content does not match its declared file type.');
  }
  return buffer;
};

export const uploadFile = async (file, { certificate = false } = {}) => {
  const buffer = await readFile(file, { certificate });
  const client = getCloudinary();
  const mime = file.type || 'application/octet-stream';
  const dataUri = `data:${mime};base64,${buffer.toString('base64')}`;
  try {
    const result = await client.uploader.upload(dataUri, certificate ? {
      folder: 'ieee-website/certificates', resource_type: 'auto', type: 'authenticated',
    } : {
      folder: 'ieee-website', resource_type: 'image', transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    });
    return result;
  } catch {
    throw new ApiError(502, `${certificate ? 'Certificate' : 'Image'} storage upload failed. Please try again.`);
  }
};

export const certificateDownloadUrl = (certificate) => {
  const storage = certificate?.storage;
  if (!storage?.publicId) return null;
  return getCloudinary().url(storage.publicId, {
    secure: true, sign_url: true, type: 'authenticated', resource_type: storage.resourceType || 'auto',
  });
};

export const destroyFile = async (storage) => {
  if (!storage?.publicId) return;
  try {
    await getCloudinary().uploader.destroy(storage.publicId, {
      resource_type: storage.resourceType || 'auto', type: 'authenticated',
    });
  } catch {
    throw new ApiError(502, 'Certificate storage deletion failed. Please try again.');
  }
};

export const destroyImage = async (storage) => {
  if (!storage?.publicId) return;
  try {
    await getCloudinary().uploader.destroy(storage.publicId, {
      resource_type: 'image',
      type: 'upload',
    });
  } catch {
    throw new ApiError(502, 'Image storage cleanup failed. Please try again.');
  }
};
