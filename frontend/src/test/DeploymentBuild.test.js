import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  normalizeApiBaseUrl,
  validateNextBuildEnvironment,
  validateViteBuildEnvironment,
} from '../lib/deployment-config';

const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));

afterEach(() => vi.unstubAllEnvs());

describe('hosted frontend build configuration', () => {
  it('uses the same-origin API when a hosted build has no API URL', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('VITE_API_URL', '');
    expect(() => validateViteBuildEnvironment({ isVercel: true, apiUrl: '', publicSiteUrl: 'https://ieee.example.org' })).not.toThrow();
  });

  it.each(['http://api.example.invalid/api', '/api', 'https://api.example.invalid/api/api'])(
    'fails a hosted build with an invalid backend URL', (url) => {
      vi.stubEnv('VERCEL', '1');
      vi.stubEnv('VITE_API_URL', url);
      expect(() => validateViteBuildEnvironment({ isVercel: true, apiUrl: url, publicSiteUrl: 'https://ieee.example.org' })).toThrow();
    },
  );

  it('fails a hosted build when the QR public origin is missing', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('VITE_API_URL', 'https://your-render-service.onrender.com/api');
    expect(() => validateViteBuildEnvironment({
      isVercel: true,
      apiUrl: 'https://your-render-service.onrender.com/api',
      publicSiteUrl: '',
    })).toThrow('VITE_PUBLIC_SITE_URL');
  });

  it.each([
    'http://ieee.example.org',
    'https://localhost',
    'https://ieee.example.org/profile',
    'https://your-verified-domain.example',
  ])('rejects an unsafe hosted QR public origin: %s', (publicSiteUrl) => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('VITE_API_URL', 'https://your-render-service.onrender.com/api');
    expect(() => validateViteBuildEnvironment({
      isVercel: true,
      apiUrl: 'https://your-render-service.onrender.com/api',
      publicSiteUrl,
    })).toThrow('VITE_PUBLIC_SITE_URL');
  });

  it('accepts an HTTPS Render URL for the production build', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('VITE_API_URL', 'https://your-render-service.onrender.com/api');
    expect(normalizeApiBaseUrl('https://your-render-service.onrender.com/api')).toBe('https://your-render-service.onrender.com/api');
    expect(() => validateViteBuildEnvironment({
      isVercel: true,
      apiUrl: 'https://your-render-service.onrender.com/api',
      publicSiteUrl: 'https://ieee-gehu.example.org',
    })).not.toThrow();
  });

  it('keeps local development and local builds usable without a public URL', () => {
    vi.stubEnv('VERCEL', '');
    vi.stubEnv('VITE_API_URL', '');
    expect(() => validateViteBuildEnvironment({ isVercel: false, apiUrl: '', publicSiteUrl: '' })).not.toThrow();
    expect(normalizeApiBaseUrl('')).toBe('/api');
  });

  it('requires the Next.js public site origin and an HTTPS API URL when one is set', () => {
    expect(() => validateNextBuildEnvironment({
      isVercel: true,
      apiUrl: '',
      publicSiteUrl: 'https://ieee-gehu.example.org',
    })).not.toThrow();

    expect(() => validateNextBuildEnvironment({
      isVercel: true,
      apiUrl: 'http://api.example.invalid/api',
      publicSiteUrl: 'https://ieee-gehu.example.org',
    })).toThrow('NEXT_PUBLIC_API_URL');

    expect(() => validateNextBuildEnvironment({
      isVercel: true,
      apiUrl: 'https://your-render-service.onrender.com/api',
      publicSiteUrl: '',
    })).toThrow('NEXT_PUBLIC_SITE_URL');
  });

  it('accepts a verified Next.js production environment', () => {
    expect(() => validateNextBuildEnvironment({
      isVercel: true,
      apiUrl: 'https://your-render-service.onrender.com/api',
      publicSiteUrl: 'https://ieee-gehu.example.org',
    })).not.toThrow();
  });

  it('marks draft legal routes as non-indexable in the active Next.js deployment', () => {
    const legalHeaders = Object.fromEntries(
      vercelConfig.headers.map(({ source, headers }) => [source, Object.fromEntries(headers.map(header => [header.key, header.value]))]),
    );

    expect(legalHeaders['/privacy']['X-Robots-Tag']).toBe('noindex, nofollow');
    expect(legalHeaders['/terms']['X-Robots-Tag']).toBe('noindex, nofollow');
  });
});
