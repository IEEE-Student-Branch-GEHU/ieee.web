import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('cross-bundler API configuration', () => {
  it('defaults to /api without configuration', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    vi.stubEnv('VITE_API_URL', '');
    vi.resetModules();
    const { default: base } = await import('../config');
    expect(base).toBe('/api');
  });

  it('appends /api to a public backend origin', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.invalid/');
    vi.resetModules();
    const { default: base } = await import('../config');
    expect(base).toBe('https://api.example.invalid/api');
  });

  it('does not duplicate /api on a configured public base', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.invalid/api/');
    vi.resetModules();
    const { default: base } = await import('../config');
    expect(base).toBe('https://api.example.invalid/api');
  });

  it('preserves the Vite API configuration', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    vi.stubEnv('VITE_API_URL', 'https://vite.example.invalid/api');
    vi.resetModules();
    const { default: base } = await import('../config');
    expect(base).toBe('https://vite.example.invalid/api');
  });

  it('uses the same-origin API for an unconfigured Next development client', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    vi.stubEnv('VITE_API_URL', '');
    vi.resetModules();
    const { default: base } = await import('../config');
    expect(base).toBe('/api');
  });

  it('prefers the active Next.js API variable when both frameworks are configured', async () => {
    vi.stubEnv('VITE_API_URL', 'https://vite.example.invalid');
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://next.example.invalid');
    vi.resetModules();
    const { default: base } = await import('../config');
    expect(base).toBe('https://next.example.invalid/api');
  });

  it('normalizes repeated trailing slashes without duplicating the API prefix', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', '');
    vi.stubEnv('VITE_API_URL', ' https://api.example.invalid/api/// ');
    vi.resetModules();
    const { default: base } = await import('../config');
    expect(base).toBe('https://api.example.invalid/api');
  });

  it.each(['https://api.example.invalid/api/api', 'https://api.example.invalid/path', 'https://api.example.invalid?token=private', 'https://user:password@api.example.invalid', '/wrong-prefix'])(
    'rejects API URLs that cannot target the backend contract', async (url) => {
      vi.stubEnv('NEXT_PUBLIC_API_URL', '');
      vi.stubEnv('VITE_API_URL', url);
      vi.resetModules();
      await expect(import('../config')).rejects.toThrow('API URL');
    },
  );
});
