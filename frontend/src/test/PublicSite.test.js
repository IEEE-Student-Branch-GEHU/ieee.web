import { afterEach, describe, expect, it, vi } from 'vitest';

const importPublicSite = () => import('../lib/public-site');
const MEMBER_ID = '507f1f77bcf86cd799439011';

describe('public site origin policy', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it.each([
    'https://intranet',
    'https://printer.localhost',
    'https://device.local',
    'https://service.internal',
    'https://switch.lan',
    'https://home.arpa',
    'https://router.home.arpa',
    'https://members.example',
    'https://members.invalid',
    'https://members.test',
    'https://127.0.0.2',
    'https://100.64.0.1',
    'https://169.254.10.20',
    'https://172.31.255.254',
    'https://192.168.1.20',
    'https://192.0.2.20',
    'https://198.18.0.20',
    'https://198.51.100.20',
    'https://203.0.113.20',
    'https://[::]',
    'https://[0:0:0:0:0:0:0:1]',
    'https://[fe80::1]',
    'https://[fc00::1]',
    'https://[fd12:3456::1]',
    'https://[::ffff:192.168.1.20]',
    'https://[0:0:0:0:0:ffff:c0a8:0114]',
    'https://[::ffff:7f00:1]',
    'https://[::ffff:169.254.1.20]',
    'https://[2001:db8::1]',
    'https://[2001:2::1]',
    'https://[fec0::1]',
    'https://[2002:7f00:1::1]',
    'https://[64:ff9b::7f00:1]',
  ])('rejects a private, local, or placeholder origin: %s', async origin => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', origin);
    const { getMemberProfileUrl } = await importPublicSite();

    expect(getMemberProfileUrl('member-1', { allowLocalPreview: false })).toBeNull();
  });

  it.each([
    'https://8.8.8.8',
    'https://198.51.99.1',
    'https://198.52.0.1',
    'https://203.0.112.1',
    'https://203.1.0.1',
  ])('accepts an HTTPS origin outside reserved IPv4 blocks: %s', async origin => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', origin);
    const { getMemberProfileUrl } = await importPublicSite();

    expect(getMemberProfileUrl(MEMBER_ID, { allowLocalPreview: false })).toBe(
      `${origin}/members/${MEMBER_ID}`,
    );
  });

  it('canonicalizes a configured origin before building and validating profile URLs', async () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'HTTPS://8.8.8.8:443///');
    const { getMemberProfileUrl, validateMemberProfileDestination } = await importPublicSite();
    const profileUrl = getMemberProfileUrl(MEMBER_ID, { allowLocalPreview: false });

    expect(profileUrl).toBe(`https://8.8.8.8/members/${MEMBER_ID}`);
    expect(validateMemberProfileDestination(profileUrl, { allowLocalPreview: false })).toMatchObject({
      memberId: MEMBER_ID,
      path: `/members/${MEMBER_ID}`,
    });
  });

  it('does not let explicit local preview override a production build', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'http://intranet');
    const { getPublicSiteOrigin } = await importPublicSite();

    expect(getPublicSiteOrigin({ allowLocalPreview: true })).toBeNull();
  });

  it('reads a Next public origin while keeping production preview rules', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://8.8.8.8');
    const { getMemberProfileUrl } = await importPublicSite();

    expect(getMemberProfileUrl(MEMBER_ID, { allowLocalPreview: true })).toBe(
      `https://8.8.8.8/members/${MEMBER_ID}`,
    );
  });

  it('uses the actual QR renderer with the requested high-contrast colors', async () => {
    const { default: actualQRCode } = await vi.importActual('qrcode');
    const svg = await actualQRCode.toString('https://8.8.8.8/members/member-1', {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 320,
      color: { dark: '#111827', light: '#ffffff' },
    });

    expect(svg).toMatch(/^<svg\b/);
    expect(svg).toContain('stroke="#111827"');
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toContain('shape-rendering="crispEdges"');
  });
});
