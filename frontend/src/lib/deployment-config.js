export const normalizeApiBaseUrl = (value) => {
  const baseUrl = value?.trim().replace(/\/+$/, '') || '/api';

  if (baseUrl === '/api') return baseUrl;
  if (baseUrl.startsWith('/')) throw new Error(`Invalid API URL: ${value}`);

  let parsed;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new Error(`Invalid API URL: ${value}`);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)
    || parsed.username
    || parsed.password
    || parsed.search
    || parsed.hash
    || (parsed.pathname !== '' && parsed.pathname !== '/' && parsed.pathname !== '/api')) {
    throw new Error(`Invalid API URL: ${value}`);
  }

  return `${parsed.origin}/api`;
};

export const validateViteBuildEnvironment = ({ isVercel, apiUrl }) => {
  if (!isVercel) return;
  if (!apiUrl?.trim()) throw new Error('VITE_API_URL is required for Vercel production builds');
  if (!apiUrl.trim().startsWith('https://')) throw new Error('VITE_API_URL must use HTTPS for Vercel production builds');
  normalizeApiBaseUrl(apiUrl);
};
