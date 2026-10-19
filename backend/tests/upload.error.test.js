const express = require('express');
const request = require('supertest');
const { createAdminToken } = require('../services/admin-auth');

const mockHandleFile = jest.fn();

jest.mock('../config/cloudinary', () => ({
  storage: {
    _handleFile: (...args) => mockHandleFile(...args),
    _removeFile: jest.fn((req, file, callback) => callback(null)),
  },
}));

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'upload-test-signing-secret-with-enough-length';

const adminRoutes = require('../routes/admin');

const token = createAdminToken({ username: 'upload-test-admin' }, process.env.JWT_SECRET);

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  return app;
};

const authenticatedUpload = (app) => request(app)
  .post('/api/admin/upload')
  .set('Authorization', `Bearer ${token}`);

const successfulStorage = () => {
  mockHandleFile.mockImplementation((req, file, callback) => {
    file.stream.on('end', () => callback(null, { path: 'https://res.cloudinary.com/test/upload.png' }));
    file.stream.resume();
  });
};

describe('admin image upload errors', () => {
  let consoleError;

  beforeEach(() => {
    mockHandleFile.mockReset();
    successfulStorage();
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleError.mockRestore();
  });

  it('returns JSON for an authenticated successful image upload', async () => {
    const response = await authenticatedUpload(createApp())
      .attach('image', Buffer.from('safe test image'), 'upload.png');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ url: 'https://res.cloudinary.com/test/upload.png' });
  });

  it('returns JSON when the image field is missing', async () => {
    const response = await authenticatedUpload(createApp());

    expect(response.status).toBe(400);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ message: 'No file uploaded' });
  });

  it('rejects unsupported file types before storage upload', async () => {
    const response = await authenticatedUpload(createApp())
      .attach('image', Buffer.from('not an image'), 'upload.txt');

    expect(response.status).toBe(400);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ message: 'Only JPG, PNG, and WebP images are allowed.' });
    expect(mockHandleFile).not.toHaveBeenCalled();
  });

  it('rejects oversized files before storage upload', async () => {
    const response = await authenticatedUpload(createApp())
      .attach('image', Buffer.alloc(10 * 1024 * 1024 + 1), 'large.png');

    expect(response.status).toBe(413);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ message: 'Image exceeds the 10 MB upload limit.' });
  });

  it('returns a safe JSON error for a Cloudinary failure object', async () => {
    mockHandleFile.mockImplementation((req, file, callback) => {
      file.stream.on('end', () => callback({
        name: 'CloudinaryError',
        http_code: 503,
        message: 'Upload provider unavailable',
        error: { message: 'private provider detail' },
      }));
      file.stream.resume();
    });

    const response = await authenticatedUpload(createApp())
      .attach('image', Buffer.from('safe test image'), 'upload.png');

    expect(response.status).toBe(502);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ message: 'Image storage upload failed. Please try again.' });
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('"errorClass":"Object"'));
    expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('"upstreamStatus":503'));
  });

  it('returns a safe JSON error for an unexpected storage exception', async () => {
    mockHandleFile.mockImplementation((req, file, callback) => {
      file.stream.on('end', () => callback(new Error('unexpected local storage failure')));
      file.stream.resume();
    });

    const response = await authenticatedUpload(createApp())
      .attach('image', Buffer.from('safe test image'), 'upload.png');

    expect(response.status).toBe(500);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ message: 'Image upload failed. Please try again.' });
  });

  it('rejects unauthenticated uploads before multipart storage handling', async () => {
    const response = await request(createApp())
      .post('/api/admin/upload')
      .attach('image', Buffer.from('safe test image'), 'upload.png');

    expect(response.status).toBe(401);
    expect(response.headers['content-type']).toMatch(/application\/json/);
    expect(response.body).toEqual({ message: 'No token, authorization denied' });
    expect(mockHandleFile).not.toHaveBeenCalled();
  });
});
