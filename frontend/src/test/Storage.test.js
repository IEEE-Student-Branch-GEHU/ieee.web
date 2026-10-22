import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { config, upload } = vi.hoisted(() => ({
  config: vi.fn(),
  upload: vi.fn(),
}));

vi.mock('cloudinary', () => ({
  v2: {
    config,
    uploader: { upload },
  },
}));

import { uploadFile } from '../server/storage';

const file = (name, type, size = 4, bytes = Buffer.from('test')) => ({
  name,
  type,
  size,
  arrayBuffer: async () => bytes,
});

beforeEach(() => {
  process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
  process.env.CLOUDINARY_API_KEY = 'test-key';
  process.env.CLOUDINARY_API_SECRET = 'test-secret';
  upload.mockReset();
});

afterEach(() => {
  delete process.env.CLOUDINARY_CLOUD_NAME;
  delete process.env.CLOUDINARY_API_KEY;
  delete process.env.CLOUDINARY_API_SECRET;
});

describe('server-side profile image upload validation', () => {
  it('rejects unsupported image extensions and MIME types before storage', async () => {
    await expect(uploadFile(file('avatar.txt', 'text/plain'))).rejects.toMatchObject({ status: 400 });
    expect(upload).not.toHaveBeenCalled();
  });

  it('rejects images over the server upload limit before storage', async () => {
    await expect(uploadFile(file('avatar.png', 'image/png', 10 * 1024 * 1024 + 1))).rejects.toMatchObject({ status: 413 });
    expect(upload).not.toHaveBeenCalled();
  });

  it('rejects an image whose bytes do not match the declared MIME type', async () => {
    await expect(uploadFile(file('avatar.png', 'image/png'))).rejects.toMatchObject({ status: 400 });
    expect(upload).not.toHaveBeenCalled();
  });

  it('returns a configuration error when Cloudinary credentials are unavailable', async () => {
    delete process.env.CLOUDINARY_API_SECRET;

    await expect(uploadFile(file(
      'avatar.png',
      'image/png',
      24,
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ))).rejects.toMatchObject({ status: 503 });
    expect(upload).not.toHaveBeenCalled();
  });

  it('uploads an accepted image through the existing Cloudinary integration', async () => {
    upload.mockResolvedValue({
      secure_url: 'https://res.cloudinary.com/test/image/upload/avatar.png',
      public_id: 'ieee-website/avatar',
      resource_type: 'image',
    });

    const result = await uploadFile(file(
      'avatar.png',
      'image/png',
      24,
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ));

    expect(result.secure_url).toContain('cloudinary.com');
    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(/^data:image\/png;base64,/),
      expect.objectContaining({ folder: 'ieee-website', resource_type: 'image' }),
    );
  });
});
