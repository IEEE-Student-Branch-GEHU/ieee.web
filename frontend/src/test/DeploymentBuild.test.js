import { readFileSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeApiBaseUrl, validateViteBuildEnvironment } from '../lib/deployment-config';

const vercelConfig = JSON.parse(readFileSync('vercel.json', 'utf8'));

afterEach(() => vi.unstubAllEnvs());

describe('Vercel Vite build configuration', () => {
  it('fails a hosted build with no backend API URL', () => {
    vi.stubEnv('VERCEL', '1');
    vi.stubEnv('VITE_API_URL', '');
    expect(() => validateViteBuildEnvironment({ isVercel: true, apiUrl: '', publicSiteUrl: 'https://ieee.example.org' })).toThrow('VITE_API_URL');
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

  it('marks draft legal routes as non-indexable in the active Vite deployment', () => {
    const legalHeaders = Object.fromEntries(
      vercelConfig.headers.map(({ source, headers }) => [source, Object.fromEntries(headers.map(header => [header.key, header.value]))]),
    );

    expect(legalHeaders['/privacy']['X-Robots-Tag']).toBe('noindex, nofollow');
    expect(legalHeaders['/terms']['X-Robots-Tag']).toBe('noindex, nofollow');
  });
});
