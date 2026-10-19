import API_BASE_URL from '../config';
import { readJsonResponse } from './http';

export class AdminUnauthorizedError extends Error {
  constructor(message = 'Authentication expired. Please sign in again.') {
    super(message);
    this.name = 'AdminUnauthorizedError';
  }
}

export const getAdminToken = () => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('adminToken');
};

export const clearAdminToken = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('adminToken');
};

const notifyUnauthorized = () => {
  clearAdminToken();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('admin-unauthorized'));
  }
};

export const adminFetchJson = async (path, options = {}) => {
  const token = getAdminToken();
  const headers = new Headers(options.headers);

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (!(options.body instanceof FormData) && options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE_URL}${path}`;
  const response = await fetch(url, { ...options, headers });
  const data = await readJsonResponse(response, url);

  if (response.status === 401) {
    notifyUnauthorized();
    throw new AdminUnauthorizedError(data?.message);
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
};

export const loginAdmin = async (username, password) => {
  const url = `${API_BASE_URL}/admin/login`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await readJsonResponse(response, url);

  if (!response.ok) {
    throw new Error(data?.message || 'Authentication failed');
  }

  return data;
};
