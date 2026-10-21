import QRCode from 'qrcode';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MEMBER_QR_COLORS, MEMBER_QR_LOGO_PATH, buildMemberQrSvg } from '../lib/member-qr';

const profileUrl = 'https://ieee-web-seven.vercel.app/members/507f1f77bcf86cd799439011';
const logo = 'data:image/png;base64,aGVsbG8=';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('buildMemberQrSvg', () => {
  it('encodes only the profile URL at the highest error correction level', () => {
    const create = vi.spyOn(QRCode, 'create');
    buildMemberQrSvg(profileUrl, { logo });
    expect(create).toHaveBeenCalledWith(profileUrl, { errorCorrectionLevel: 'H' });
  });

  it('renders a branded, self-contained SVG with the logo centred on a plate', () => {
    const svg = buildMemberQrSvg(profileUrl, { logo });

    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
    expect(svg).toContain(`fill="${MEMBER_QR_COLORS.module}"`);
    expect(svg).toContain(`fill="${MEMBER_QR_COLORS.eyeRing}"`);
    expect(svg).toContain(`xlink:href="${logo}"`);
    expect(svg.match(/<image /g)).toHaveLength(1);
  });

  it('keeps every module when no logo is available', () => {
    const withLogo = buildMemberQrSvg(profileUrl, { logo });
    const withoutLogo = buildMemberQrSvg(profileUrl);

    expect(withoutLogo).not.toContain('<image');
    expect(withoutLogo.match(/M/g).length).toBeGreaterThan(withLogo.match(/M/g).length);
  });

  it('escapes the logo reference before placing it in an attribute', () => {
    const svg = buildMemberQrSvg(profileUrl, { logo: 'data:x"><script>' });
    expect(svg).not.toContain('"><script>');
    expect(svg).toContain('data:x&quot;>&lt;script>');
  });
});

describe('loadMemberQrLogo', () => {
  it('inlines the logo as a data URI and reuses the request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['png'], { type: 'image/png' })),
    });
    vi.stubGlobal('fetch', fetchMock);
    const { loadMemberQrLogo } = await import('../lib/member-qr');

    await expect(loadMemberQrLogo()).resolves.toMatch(/^data:image\/png;base64,/);
    await loadMemberQrLogo();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(MEMBER_QR_LOGO_PATH);
  });

  it('falls back to no logo on failure and retries on the next request', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    const { createMemberQrSvg, loadMemberQrLogo } = await import('../lib/member-qr');

    await expect(createMemberQrSvg(profileUrl)).resolves.not.toContain('<image');
    await loadMemberQrLogo();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
