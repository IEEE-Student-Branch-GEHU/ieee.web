/* global process */

const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);
const LOCAL_HOSTNAME_SUFFIXES = [
  '.localhost',
  '.local',
  '.internal',
  '.lan',
  '.home.arpa',
  '.example',
  '.invalid',
  '.test',
];

const readConfiguredOrigin = () => {
  const viteOrigin = import.meta.env?.VITE_PUBLIC_SITE_URL;
  const nextOrigin = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SITE_URL : undefined;
  return (viteOrigin || nextOrigin || '').trim().replace(/\/+$/, '');
};

const isValidOrigin = (origin) => {
  try {
    const url = new URL(origin);
    return ['http:', 'https:'].includes(url.protocol)
      && Boolean(url.hostname)
      && !url.username
      && !url.password
      && !url.pathname.replace(/\/$/, '')
      && !url.search
      && !url.hash;
  } catch {
    return false;
  }
};

const canonicalizeOrigin = (origin) => {
  if (!isValidOrigin(origin)) return null;
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
};

const normalizeHostname = (hostname) => String(hostname || '')
  .toLowerCase()
  .replace(/^\[/, '')
  .replace(/\]$/, '')
  .replace(/\.$/, '');

const parseIpv4 = (hostname) => {
  const parts = normalizeHostname(hostname).split('.');
  if (parts.length !== 4 || parts.some(part => !/^\d+$/.test(part))) return null;

  const octets = parts.map(Number);
  return octets.every(octet => octet >= 0 && octet <= 255) ? octets : null;
};

const isPrivateIpv4 = (octets) => {
  if (!octets) return false;
  const [first, second, third] = octets;

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

const parseIpv6 = (hostname) => {
  const normalized = normalizeHostname(hostname);
  if (!normalized.includes(':')) return null;

  let address = normalized;
  if (address.includes('.')) {
    const separator = address.lastIndexOf(':');
    const ipv4Octets = parseIpv4(address.slice(separator + 1));
    if (separator < 0 || !ipv4Octets) return null;

    const high = (ipv4Octets[0] << 8) | ipv4Octets[1];
    const low = (ipv4Octets[2] << 8) | ipv4Octets[3];
    address = `${address.slice(0, separator)}${high.toString(16)}:${low.toString(16)}`;
  }

  const halves = address.split('::');
  if (halves.length > 2) return null;

  const left = halves[0] ? halves[0].split(':') : [];
  const right = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const explicitGroupCount = left.length + right.length;
  if (halves.length === 2 ? explicitGroupCount >= 8 : explicitGroupCount !== 8) return null;

  const groups = halves.length === 2
    ? [...left, ...Array(8 - explicitGroupCount).fill('0'), ...right]
    : left;
  if (groups.some(group => !/^[0-9a-f]{1,4}$/i.test(group))) return null;

  return groups.map(group => parseInt(group, 16));
};

const isPrivateIpv6 = (hostname) => {
  const groups = parseIpv6(hostname);
  if (!groups) return false;

  const first = groups[0];
  const second = groups[1];
  const third = groups[2];
  const allZero = groups.every(group => group === 0);
  const loopback = allZero || groups.slice(0, 7).every(group => group === 0) && groups[7] === 1;
  const uniqueLocal = (first & 0xfe00) === 0xfc00;
  const linkLocal = (first & 0xffc0) === 0xfe80;
  const siteLocal = (first & 0xffc0) === 0xfec0;
  const multicast = (first & 0xff00) === 0xff00;
  const documentation = first === 0x2001 && second === 0x0db8;
  const benchmarking = first === 0x2001 && second === 0x0002 && third === 0;
  const teredo = first === 0x2001 && second === 0;
  const sixToFour = first === 0x2002;
  const nat64 = first === 0x0064 && second === 0xff9b && (third === 0 || third === 1);
  const embeddedIpv4 = groups.slice(0, 5).every(group => group === 0)
    && (groups[5] === 0 || groups[5] === 0xffff);
  const embeddedOctets = embeddedIpv4
    ? [groups[6] >> 8, groups[6] & 255, groups[7] >> 8, groups[7] & 255]
    : null;

  return loopback
    || uniqueLocal
    || linkLocal
    || siteLocal
    || multicast
    || documentation
    || benchmarking
    || teredo
    || sixToFour
    || nat64
    || (embeddedIpv4 && isPrivateIpv4(embeddedOctets));
};

const isPrivateOrLocalHostname = (hostname) => {
  const normalized = normalizeHostname(hostname);
  if (!normalized) return true;
  if (LOCAL_HOSTNAMES.has(normalized)
    || LOCAL_HOSTNAME_SUFFIXES.some(suffix => normalized === suffix.slice(1) || normalized.endsWith(suffix))) return true;
  if (!normalized.includes('.') && !normalized.includes(':')) return true;

  return isPrivateIpv4(parseIpv4(normalized)) || isPrivateIpv6(normalized);
};

const isLocalOrigin = (origin) => {
  try {
    return isPrivateOrLocalHostname(new URL(origin).hostname);
  } catch {
    return true;
  }
};

const isProductionBuild = import.meta.env?.PROD === true
  || (typeof process !== 'undefined' && process.env.NODE_ENV === 'production');
const isTestBuild = import.meta.env?.MODE === 'test'
  || (typeof process !== 'undefined' && process.env.NODE_ENV === 'test');

// This is a format and address-space policy only; it does not verify DNS,
// TLS, or control of the configured domain.
const isAllowedPublicOrigin = (origin) => {
  if (!isValidOrigin(origin)) return false;

  try {
    return new URL(origin).protocol === 'https:' && !isPrivateOrLocalOrigin(origin);
  } catch {
    return false;
  }
};

export const getPublicSiteOrigin = ({ allowLocalPreview = !isProductionBuild && !isTestBuild } = {}) => {
  const localPreviewAllowed = !isProductionBuild && allowLocalPreview;
  const configuredOrigin = readConfiguredOrigin();
  const canonicalConfiguredOrigin = canonicalizeOrigin(configuredOrigin);
  const configuredOriginIsUsable = canonicalConfiguredOrigin
    && (localPreviewAllowed || isAllowedPublicOrigin(canonicalConfiguredOrigin));
  if (configuredOrigin && configuredOriginIsUsable) return canonicalConfiguredOrigin;

  // A local preview may use its own origin. Production builds deliberately do
  // not fall back to localhost or a private development host.
  if (typeof window !== 'undefined' && localPreviewAllowed) {
    return canonicalizeOrigin(window.location.origin);
  }

  return null;
};

export const getMemberProfilePath = (memberId) => {
  if (!isStableMemberId(memberId)) return null;
  return `/members/${memberId.toLowerCase()}`;
};

export const getStableMemberId = (member) => {
  const memberId = member && typeof member === 'object' ? member._id : member;
  return isStableMemberId(memberId) ? memberId.toLowerCase() : null;
};

// Public profile APIs address Team records by their stable MongoDB ObjectId.
// Keep malformed or legacy UI-only identifiers from producing QR codes that
// can never resolve through the public profile endpoint.
export const isStableMemberId = (memberId) => (
  typeof memberId === 'string' && /^[a-f\d]{24}$/i.test(memberId)
);

export const getMemberProfileUrl = (memberId, options) => {
  const origin = getPublicSiteOrigin(options);
  const path = getMemberProfilePath(memberId);
  return origin && path ? `${origin}${path}` : null;
};

export const validateMemberProfileDestination = (payload, { allowLocalPreview = true } = {}) => {
  if (typeof payload !== 'string' || payload.trim().length === 0 || payload.length > 4096) return null;

  let destination;
  let trustedOrigin;
  try {
    destination = new URL(payload.trim());
    trustedOrigin = getPublicSiteOrigin({ allowLocalPreview });
  } catch {
    return null;
  }

  if (!trustedOrigin || destination.origin !== trustedOrigin) return null;
  if (destination.username || destination.password || destination.search || destination.hash) return null;

  const match = destination.pathname.match(/^\/members\/([a-f\d]{24})\/?$/i);
  if (!match || !isStableMemberId(match[1])) return null;

  const memberId = match[1].toLowerCase();
  return {
    memberId,
    path: `/members/${memberId}`,
    url: `${trustedOrigin}/members/${memberId}`,
  };
};

export const isPrivateOrLocalOrigin = (origin) => !origin || !isValidOrigin(origin) || isLocalOrigin(origin);
