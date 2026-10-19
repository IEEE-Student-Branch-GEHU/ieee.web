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

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);
const LOCAL_HOSTNAME_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home.arpa', '.example', '.invalid', '.test'];

const isPrivateIpv4 = (hostname) => {
  const parts = hostname.split('.');
  if (parts.length !== 4 || parts.some(part => !/^\d+$/.test(part))) return false;

  const [first, second, third] = parts.map(Number);
  if ([first, second, third].some(value => !Number.isInteger(value))) return false;
  if (parts.some(part => Number(part) < 0 || Number(part) > 255)) return true;

  return first === 0
    || first === 10
    || first === 127
    || (first === 100 && second >= 64 && second <= 127)
    || (first === 169 && second === 254)
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 0 && (third === 0 || third === 2))
    || (first === 192 && second === 168)
    || (first === 198 && second >= 18 && second <= 19)
    || (first === 198 && second === 51 && third === 100)
    || (first === 203 && second === 0 && third === 113)
    || first >= 224;
};

export const normalizePublicSiteOrigin = (value) => {
  const candidate = typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '';
  let parsed;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error('VITE_PUBLIC_SITE_URL must be a valid HTTPS origin');
  }

  const hostname = parsed.hostname.toLowerCase().replace(/^\[/, '').replace(/\]$/, '').replace(/\.$/, '');
  const isLocalHostname = LOCAL_HOSTNAMES.has(hostname)
    || LOCAL_HOSTNAME_SUFFIXES.some(suffix => hostname === suffix.slice(1) || hostname.endsWith(suffix))
    || (!hostname.includes('.') && !hostname.includes(':'));

  if (parsed.protocol !== 'https:'
    || !hostname
    || parsed.username
    || parsed.password
    || parsed.pathname !== '/'
    || parsed.search
    || parsed.hash
    || isLocalHostname
    || hostname.includes(':')
    || isPrivateIpv4(hostname)) {
    throw new Error('VITE_PUBLIC_SITE_URL must be a valid HTTPS public origin');
  }

  return parsed.origin;
};

export const validateViteBuildEnvironment = ({ isVercel, apiUrl, publicSiteUrl }) => {
  if (!isVercel) return;
  if (!apiUrl?.trim()) throw new Error('VITE_API_URL is required for Vercel production builds');
  if (!apiUrl.trim().startsWith('https://')) throw new Error('VITE_API_URL must use HTTPS for Vercel production builds');
  normalizeApiBaseUrl(apiUrl);
  if (!publicSiteUrl?.trim()) throw new Error('VITE_PUBLIC_SITE_URL is required for Vercel production builds');
  normalizePublicSiteOrigin(publicSiteUrl);
};
