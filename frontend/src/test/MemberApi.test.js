import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config', () => ({ default: 'http://localhost:5000/api' }));

import { clearMemberToken, getMemberToken, memberFetchJson } from '../lib/member-api';

const jsonResponse = (payload, status = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? 'OK' : 'Unauthorized',
  headers: { get: () => 'application/json' },
  text: async () => JSON.stringify(payload),
});

describe('member API client', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it('sends the member bearer token without exposing it in request bodies', async () => {
    window.localStorage.setItem('memberToken', 'member-token');
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ profile: null }));
    vi.stubGlobal('fetch', fetchMock);

    await memberFetchJson('/member/me');

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:5000/api/member/me', expect.objectContaining({
      headers: expect.any(Headers),
    }));
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers.get('Authorization')).toBe('Bearer member-token');
    expect(options.body).toBeUndefined();
  });

  it('clears an expired token and emits an unauthorized event', async () => {
    window.localStorage.setItem('memberToken', 'expired-token');
    const unauthorized = vi.fn();
    window.addEventListener('member-unauthorized', unauthorized);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ message: 'Member token is not valid' }, 401)));

    await expect(memberFetchJson('/member/me')).rejects.toMatchObject({ name: 'MemberUnauthorizedError' });
    expect(getMemberToken()).toBeNull();
    expect(unauthorized).toHaveBeenCalledTimes(1);
    window.removeEventListener('member-unauthorized', unauthorized);
    clearMemberToken();
  });
});
