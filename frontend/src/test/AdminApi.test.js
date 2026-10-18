import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminUnauthorizedError, adminFetchJson, clearAdminToken, loginAdmin } from '../lib/admin-api';

const jsonResponse = (body, options = {}) => ({
  ok: options.ok ?? true,
  status: options.status ?? 200,
  json: () => Promise.resolve(body),
});

describe('admin API contracts', () => {
  beforeEach(() => {
    localStorage.setItem('adminToken', 'test-token');
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    clearAdminToken();
    vi.unstubAllGlobals();
  });

  it('logs in with the existing username/password payload and returns the JWT response', async () => {
    fetch.mockResolvedValue(jsonResponse({ token: 'jwt-token' }));

    await expect(loginAdmin('admin-user', 'password')).resolves.toEqual({ token: 'jwt-token' });
    expect(fetch).toHaveBeenCalledWith('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin-user', password: 'password' }),
    });
  });

  it('adds the Bearer token to dashboard requests', async () => {
    fetch.mockResolvedValue(jsonResponse({ eventsCount: 3 }));

    await adminFetchJson('/admin/stats');

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/admin/stats');
    expect(options.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('preserves event CRUD methods, paths, JSON bodies, and MongoDB _id values', async () => {
    fetch.mockResolvedValue(jsonResponse({ _id: 'mongo-event-id' }));

    await adminFetchJson('/admin/events', { method: 'POST', body: JSON.stringify({ title: 'Event' }) });
    await adminFetchJson('/admin/events/mongo-event-id', { method: 'PUT', body: JSON.stringify({ title: 'Updated' }) });
    await adminFetchJson('/admin/events/mongo-event-id', { method: 'DELETE' });

    expect(fetch.mock.calls.map(([url, options]) => [url, options.method])).toEqual([
      ['/api/admin/events', 'POST'],
      ['/api/admin/events/mongo-event-id', 'PUT'],
      ['/api/admin/events/mongo-event-id', 'DELETE'],
    ]);
  });

  it('preserves team CRUD paths and nested social payloads', async () => {
    fetch.mockResolvedValue(jsonResponse({ _id: 'mongo-member-id' }));
    const payload = { name: 'Member', role: 'Chair', category: 'executive', socials: { linkedin: 'https://linkedin.example' } };

    await adminFetchJson('/admin/team/mongo-member-id', { method: 'PUT', body: JSON.stringify(payload) });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/admin/team/mongo-member-id');
    expect(options.method).toBe('PUT');
    expect(options.headers.get('Content-Type')).toBe('application/json');
    expect(options.body).toBe(JSON.stringify(payload));
  });

  it('sends uploads as FormData under the image field without overriding multipart headers', async () => {
    fetch.mockResolvedValue(jsonResponse({ url: 'https://cloudinary.example/image.jpg' }));
    const form = new FormData();
    form.append('image', new File(['image'], 'event.jpg', { type: 'image/jpeg' }));

    await adminFetchJson('/admin/upload', { method: 'POST', body: form });

    const [url, options] = fetch.mock.calls[0];
    expect(url).toBe('/api/admin/upload');
    expect(options.body).toBe(form);
    expect(options.headers.get('Authorization')).toBe('Bearer test-token');
    expect(options.headers.has('Content-Type')).toBe(false);
  });

  it('clears the token and raises a typed error on unauthorized responses', async () => {
    fetch.mockResolvedValue(jsonResponse({ message: 'Token is not valid' }, { ok: false, status: 401 }));

    await expect(adminFetchJson('/admin/stats')).rejects.toBeInstanceOf(AdminUnauthorizedError);
    expect(localStorage.getItem('adminToken')).toBeNull();
  });

  it('reports an HTML response without attempting to treat it as an API payload', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: { get: () => 'text/html' },
      text: () => Promise.resolve('<!DOCTYPE html><html><body>Not found</body></html>'),
    });

    await expect(adminFetchJson('/admin/stats')).rejects.toThrow(
      'Expected JSON from /api/admin/stats, but received text/html (HTTP 404 Not Found).',
    );
  });

  it('reports an HTML upload failure without exposing a parser error', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      headers: { get: () => 'text/html; charset=utf-8' },
      text: () => Promise.resolve('<!DOCTYPE html><html><body>Internal Server Error</body></html>'),
    });

    const form = new FormData();
    form.append('image', new File(['image'], 'event.png', { type: 'image/png' }));
    await expect(adminFetchJson('/admin/upload', { method: 'POST', body: form })).rejects.toThrow(
      'Expected JSON from /api/admin/upload, but received text/html; charset=utf-8 (HTTP 500 Internal Server Error).',
    );
  });
});
