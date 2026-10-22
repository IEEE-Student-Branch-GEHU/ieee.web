import { afterEach, describe, expect, it, vi } from 'vitest';

const { connectDatabase, enforceRateLimit, modelMocks } = vi.hoisted(() => ({
  connectDatabase: vi.fn().mockResolvedValue(undefined),
  enforceRateLimit: vi.fn().mockResolvedValue(undefined),
  modelMocks: {
    Team: { find: vi.fn(), distinct: vi.fn(), findById: vi.fn(), exists: vi.fn(), create: vi.fn(), findByIdAndUpdate: vi.fn(), findByIdAndDelete: vi.fn() },
    Event: { countDocuments: vi.fn(), find: vi.fn(), create: vi.fn(), findByIdAndUpdate: vi.fn(), findByIdAndDelete: vi.fn() },
    Admin: { findOne: vi.fn() },
    Member: { findOne: vi.fn(), findById: vi.fn(), findOneAndUpdate: vi.fn(), findByIdAndUpdate: vi.fn(), create: vi.fn() },
    Certificate: { find: vi.fn(), findOne: vi.fn(), findOneAndUpdate: vi.fn(), deleteOne: vi.fn(), create: vi.fn() },
    RateLimit: {},
  },
}));

vi.mock('../server/db', () => ({ connectDatabase, isDatabaseReady: () => true }));
vi.mock('../server/security', async () => {
  class MockApiError extends Error {
    constructor(status, message) { super(message); this.status = status; }
  }
  return {
    ApiError: MockApiError,
    createActivationToken: () => 'activation-token',
    createAdminToken: () => 'admin-token',
    createMemberToken: () => 'member-token',
    enforceRateLimit,
    hashActivationToken: value => `hash:${value}`,
    hashPassword: vi.fn().mockResolvedValue('password-hash'),
    verifyAdminRequest: vi.fn(),
    verifyMemberToken: vi.fn(),
    verifyPassword: vi.fn(),
  };
});
vi.mock('../server/models', () => modelMocks);
vi.mock('../server/storage', () => ({ certificateDownloadUrl: () => null, destroyFile: vi.fn(), uploadFile: vi.fn() }));

import { handleApiRequest } from '../server/api';

const chain = (value) => ({
  sort: vi.fn().mockReturnThis(),
  skip: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  lean: vi.fn().mockResolvedValue(value),
});

const request = (url, options = {}) => ({
  url: `http://localhost${url}`,
  method: options.method || 'GET',
  headers: new Headers(options.headers),
  json: vi.fn().mockResolvedValue(options.body || {}),
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('Next.js same-origin API route handlers', () => {
  it('filters and serializes public team records through the migrated route', async () => {
    modelMocks.Team.find.mockReturnValue(chain([{ _id: '507f1f77bcf86cd799439011', name: 'Ada', role: 'Chair', category: 'executive', year: '2025-2026', email: 'private@example.test' }]));

    const response = await handleApiRequest(request('/api/team?year=2025-2026&category=executive'), ['team']);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual([expect.objectContaining({ name: 'Ada', year: '2025-2026' })]);
    expect(body[0].email).toBeUndefined();
    expect(modelMocks.Team.find).toHaveBeenCalledWith({ year: { $eq: '2025-2026' }, category: { $eq: 'executive' } }, expect.stringContaining('year'));
  });

  it('allowlists public event fields and safe highlight URLs', async () => {
    modelMocks.Event.countDocuments.mockResolvedValue(1);
    modelMocks.Event.find.mockReturnValue(chain([{
      _id: '507f1f77bcf86cd799439011',
      title: 'Workshop',
      date: '2026-01-01',
      highlights: [
        { url: 'https://cdn.example.test/workshop.jpg', caption: 'Slides' },
        { url: 'javascript:alert(1)', caption: 'Unsafe' },
      ],
      privateNote: 'must not be exposed',
    }]));

    const response = await handleApiRequest(request('/api/events'), ['events']);
    const body = await response.json();

    expect(body.events[0]).toEqual(expect.objectContaining({ title: 'Workshop' }));
    expect(body.events[0].privateNote).toBeUndefined();
    expect(body.events[0].highlights).toEqual([{ url: 'https://cdn.example.test/workshop.jpg', caption: 'Slides' }]);
    expect(modelMocks.Event.find).toHaveBeenCalledWith(expect.any(Object), expect.stringContaining('title'));
  });

  it('returns distinct academic years in descending order', async () => {
    modelMocks.Team.distinct.mockResolvedValue(['2024-2025', '2026-2027', '2025-2026', '2026-2027']);

    const response = await handleApiRequest(request('/api/team/years'), ['team', 'years']);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(['2026-2027', '2025-2026', '2024-2025']);
  });

  it('rejects extra path segments instead of dispatching a different endpoint', async () => {
    const response = await handleApiRequest(request('/api/team/years/extra'), ['team', 'years', 'extra']);

    expect(response.status).toBe(404);
    expect(modelMocks.Team.distinct).not.toHaveBeenCalled();
  });

  it('rejects invalid public IDs before database access', async () => {
    const response = await handleApiRequest(request('/api/team/not-an-id'), ['team', 'not-an-id']);

    expect(response.status).toBe(400);
    expect(modelMocks.Team.findById).not.toHaveBeenCalled();
  });

  it('requires administrator authentication for Team creation', async () => {
    modelMocks.Team.create.mockResolvedValue({ toJSON: () => ({ name: 'Ada' }) });

    const response = await handleApiRequest(request('/api/admin/team', {
      method: 'POST',
      body: { name: 'Ada', role: 'Chair', category: 'executive', year: '2025-2026' },
    }), ['admin', 'team']);

    expect(response.status).toBe(201);
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(modelMocks.Team.create).toHaveBeenCalledWith(expect.objectContaining({ year: '2025-2026' }));
  });

  it('maps model validation failures to a client error', async () => {
    modelMocks.Team.create.mockRejectedValue({ name: 'ValidationError', message: 'year is invalid' });

    const response = await handleApiRequest(request('/api/admin/team', {
      method: 'POST',
      body: { name: 'Ada', role: 'Chair', category: 'executive', year: '2025-2026' },
    }), ['admin', 'team']);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: 'Invalid request data' });
  });

  it('maps provisioning duplicate-key races to a conflict', async () => {
    modelMocks.Team.findById.mockResolvedValue({ _id: '507f1f77bcf86cd799439011' });
    modelMocks.Member.findOne.mockResolvedValue(null);
    modelMocks.Member.create.mockRejectedValue({ code: 11000 });

    const response = await handleApiRequest(request('/api/admin/members/provision', {
      method: 'POST',
      body: { username: 'ada.member', teamId: '507f1f77bcf86cd799439011' },
    }), ['admin', 'members', 'provision']);

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ message: 'A member account or team link already exists' });
  });
});
