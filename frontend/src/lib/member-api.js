import API_BASE_URL from '../config';
import { readJsonResponse } from './http';

export class MemberUnauthorizedError extends Error {
  constructor(message = 'Member authentication expired. Please sign in again.') {
    super(message);
    this.name = 'MemberUnauthorizedError';
  }
}

export const getMemberToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('memberToken');
};

export const clearMemberToken = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('memberToken');
};

const notifyUnauthorized = () => {
  clearMemberToken();
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('member-unauthorized'));
};

const requestMemberJson = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, options);
  const data = await readJsonResponse(response, url);

  if (response.status === 401) {
    notifyUnauthorized();
    throw new MemberUnauthorizedError(data?.message);
  }
  if (!response.ok) throw new Error(data?.message || `Request failed with status ${response.status}`);
  return data;
};

export const memberFetchJson = async (path, options = {}) => {
  const token = getMemberToken();
  const headers = new Headers(options.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(options.body instanceof FormData) && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return requestMemberJson(path, { ...options, headers });
};

export const loginMember = async (username, password) => {
  const data = await requestMemberJson('/member/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!data?.token) throw new Error('Authentication response did not include a token.');
  return data;
};

export const loginMemberWithGoogle = async (credential) => {
  const data = await requestMemberJson('/member/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  if (!data?.token) throw new Error('Authentication response did not include a token.');
  return data;
};

export const activateMember = (token, password) => requestMemberJson('/member/activate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, password }),
});

export const logoutMember = async () => {
  try {
    await memberFetchJson('/member/logout', { method: 'POST' });
  } finally {
    clearMemberToken();
  }
};
