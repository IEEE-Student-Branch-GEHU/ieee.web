import { afterEach, describe, expect, it, vi } from 'vitest';

const { findOneAndUpdate } = vi.hoisted(() => ({
  findOneAndUpdate: vi.fn(),
}));

vi.mock('../server/models', () => ({ RateLimit: { findOneAndUpdate } }));

import { createAdminToken, enforceRateLimit } from '../server/security';

const request = (headers = {}) => ({ headers: new Headers(headers) });

afterEach(() => {
  delete process.env.JWT_SECRET;
});

describe('migrated API security controls', () => {
  it('uses one atomic rate-limit update and rejects the first request over the limit', async () => {
    findOneAndUpdate.mockResolvedValue({ count: 6 });

    await expect(enforceRateLimit(request({ 'x-forwarded-for': '198.51.100.10' }), 'admin-login', 5, 60_000))
      .rejects.toMatchObject({ status: 429 });

    expect(findOneAndUpdate).toHaveBeenCalledTimes(1);
    const [query, update, options] = findOneAndUpdate.mock.calls[0];
    expect(query).toEqual({ key: 'admin-login:198.51.100.10' });
    expect(Array.isArray(update)).toBe(true);
    expect(options).toEqual(expect.objectContaining({ upsert: true, new: true }));
  });

  it('rejects a JWT secret shorter than the deployment minimum', () => {
    process.env.JWT_SECRET = 'too-short';

    expect(() => createAdminToken('administrator')).toThrow(/JWT_SECRET/i);
  });
});
