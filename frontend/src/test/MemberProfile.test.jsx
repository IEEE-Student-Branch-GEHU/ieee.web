import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MemberProfile from '../components/members/MemberProfile';
import MemberQr from '../components/members/MemberQr';
import { getMemberProfilePath, getMemberProfileUrl } from '../lib/public-site';

const { fetchJson, qrToString } = vi.hoisted(() => ({ fetchJson: vi.fn(), qrToString: vi.fn() }));
vi.mock('../lib/http', () => ({ fetchJson }));
vi.mock('qrcode', () => ({ default: { toString: qrToString } }));
vi.mock('../components/Navbar', () => ({ default: () => <nav aria-label="Primary navigation" /> }));
vi.mock('../components/Footer', () => ({ default: () => <footer /> }));

const member = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Approved Member',
  role: 'Chairperson',
  category: 'executive',
  bio: 'Approved public biography',
  socials: { github: 'https://github.com/example' },
};

beforeEach(() => {
  fetchJson.mockReset();
  qrToString.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('member profile URLs and QR configuration', () => {
  it('uses the stable Mongo identifier for a profile path', () => {
    expect(getMemberProfilePath(member._id)).toBe('/members/507f1f77bcf86cd799439011');
  });

  it('does not build public profile paths for legacy identifiers', () => {
    expect(getMemberProfilePath('legacy-member-id')).toBeNull();
  });

  it('does not fall back to localhost for a production QR destination', () => {
    expect(getMemberProfileUrl(member._id, { allowLocalPreview: false })).toBeNull();
  });

  it('builds an absolute stable QR destination from the configured public origin', () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://8.8.8.8');
    expect(getMemberProfileUrl(member._id, { allowLocalPreview: false })).toBe(
      'https://8.8.8.8/members/507f1f77bcf86cd799439011',
    );
  });

  it.each([
    'http://members.example.com',
    'https://localhost',
    'https://127.0.0.2',
    'https://192.168.1.20',
    'https://10.10.0.4',
    'https://172.16.4.8',
    'https://[::1]',
    'https://[::ffff:127.0.0.1]',
    'https://device.local',
  ])('rejects a non-public or private production origin: %s', origin => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', origin);
    expect(getMemberProfileUrl(member._id, { allowLocalPreview: false })).toBeNull();
  });

  it('allows the browser origin only for an explicit local preview', () => {
    expect(getMemberProfileUrl(member._id, { allowLocalPreview: true })).toBe(
      `${window.location.origin}/members/507f1f77bcf86cd799439011`,
    );
  });
});

describe('MemberProfile', () => {
  it('renders approved public data and a missing state', async () => {
    fetchJson.mockResolvedValueOnce(member);
    render(<MemberProfile memberId={member._id} />);

    expect(screen.getByRole('status')).toHaveTextContent('Loading profile...');
    expect(await screen.findByRole('heading', { name: 'Approved Member' })).toBeInTheDocument();
    expect(screen.getByText('Approved public biography')).toBeInTheDocument();
    expect(fetchJson).toHaveBeenCalledWith('/api/team/507f1f77bcf86cd799439011', expect.any(Object));
  });

  it('renders the not-found state for an unknown member', async () => {
    const error = new Error('missing');
    error.status = 404;
    fetchJson.mockRejectedValueOnce(error);
    render(<MemberProfile memberId="507f1f77bcf86cd799439099" />);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Member profile not found' })).toBeInTheDocument());
  });

  it('renders an unavailable state when the profile identifier is invalid', async () => {
    const error = new Error('invalid profile id');
    error.status = 400;
    fetchJson.mockRejectedValueOnce(error);
    render(<MemberProfile memberId="not-an-object-id" />);

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Profile unavailable' })).toBeInTheDocument());
  });
});

describe('MemberQr', () => {
  beforeEach(() => {
    qrToString.mockReset();
    qrToString.mockResolvedValue('<svg data-target="member"></svg>');
  });

  it('shows a safe unavailable state when no public HTTPS origin is configured', () => {
    render(<MemberQr member={member} />);
    expect(screen.getByRole('alert')).toHaveTextContent('HTTPS public site URL');
    expect(screen.getByRole('button', { name: /Download SVG/i })).toBeDisabled();
  });

  it.each([
    [{ name: 'Missing ID Member' }, 'stable member profile ID is required'],
    [{ _id: 'legacy-member-id', name: 'Invalid ID Member' }, 'member profile ID is invalid'],
  ])('does not generate a QR for an unusable member identifier', (invalidMember, message) => {
    render(<MemberQr member={invalidMember} />);

    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('button', { name: /Download SVG/i })).toBeDisabled();
    expect(qrToString).not.toHaveBeenCalled();
  });

  it('generates an accessible high-contrast QR for the stable public profile URL', async () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://8.8.8.8');
    render(<MemberQr member={member} />);

    const qrImage = await screen.findByRole('img', { name: 'QR code linking to Approved Member profile' });
    expect(qrImage).toBeInTheDocument();
    expect(qrImage).toHaveClass('h-auto', 'max-w-full');
    expect(screen.getByRole('link', { name: /Open public profile/i })).toHaveAttribute(
      'href',
      'https://8.8.8.8/members/507f1f77bcf86cd799439011',
    );
    expect(screen.getByRole('button', { name: /Download SVG/i })).not.toBeDisabled();
    expect(qrToString).toHaveBeenCalledWith(
      'https://8.8.8.8/members/507f1f77bcf86cd799439011',
      expect.objectContaining({
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 4,
        color: { dark: '#111827', light: '#ffffff' },
      }),
    );
    expect(qrToString.mock.calls[0][0]).not.toContain(member.bio);
    expect(qrToString.mock.calls[0][0]).not.toContain(member.socials.github);
  });

  it('keeps the QR destination unchanged when editable profile fields change', async () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://8.8.8.8');
    const { rerender } = render(<MemberQr member={member} />);

    await screen.findByRole('img', { name: 'QR code linking to Approved Member profile' });
    const originalDestination = qrToString.mock.calls[0][0];
    const editedMember = {
      ...member,
      name: 'Renamed Member',
      role: 'Updated Designation',
      image: 'https://cdn.example/updated-member.jpg',
      academicYear: 'Final Year',
      branch: 'Electronics',
    };

    rerender(<MemberQr member={editedMember} />);

    expect(qrToString).toHaveBeenCalledTimes(1);
    expect(qrToString).toHaveBeenCalledWith(originalDestination, expect.any(Object));
    expect(screen.getByRole('link', { name: /Open public profile/i })).toHaveAttribute('href', originalDestination);
    expect(getMemberProfileUrl(editedMember._id, { allowLocalPreview: false })).toBe(originalDestination);
  });

  it('does not display or download a previous member QR while a new one is generating', async () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://8.8.8.8');
    let resolveNextQr;
    qrToString.mockImplementationOnce(() => Promise.resolve('<svg data-target="first"></svg>'))
      .mockImplementationOnce(() => new Promise(resolve => { resolveNextQr = resolve; }));

    const { rerender } = render(<MemberQr member={member} />);
    await screen.findByRole('img', { name: 'QR code linking to Approved Member profile' });

    const nextMember = { ...member, _id: '507f1f77bcf86cd799439012', name: 'New Member' };
    rerender(<MemberQr member={nextMember} />);

    expect(screen.queryByRole('img', { name: 'QR code linking to New Member profile' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download SVG/i })).toBeDisabled();

    resolveNextQr('<svg data-target="second"></svg>');
    const newQrImage = await screen.findByRole('img', { name: 'QR code linking to New Member profile' });
    expect(decodeURIComponent(newQrImage.getAttribute('src').split(',')[1])).toContain('data-target="second"');
  });

  it('reports QR generation failures without enabling a download', async () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://8.8.8.8');
    qrToString.mockRejectedValueOnce(new Error('QR failure'));
    render(<MemberQr member={member} />);

    expect(await screen.findByRole('alert')).toHaveTextContent('QR code could not be generated');
    expect(screen.getByRole('button', { name: /Download SVG/i })).toBeDisabled();
  });

  it('downloads the generated SVG with a member-specific filename', async () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://8.8.8.8');
    const createObjectUrl = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:member-qr');
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    let downloadedLink;
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      downloadedLink = this;
    });
    render(<MemberQr member={member} />);

    await screen.findByRole('img', { name: 'QR code linking to Approved Member profile' });
    fireEvent.click(screen.getByRole('button', { name: /Download SVG/i }));

    expect(createObjectUrl).toHaveBeenCalledWith(expect.any(Blob));
    const [svgBlob] = createObjectUrl.mock.calls[0];
    expect(svgBlob.type).toBe('image/svg+xml;charset=utf-8');
    expect(await svgBlob.text()).toBe('<svg data-target="member"></svg>');
    expect(click).toHaveBeenCalled();
    expect(downloadedLink).toHaveAttribute('download', 'ieee-member-507f1f77bcf86cd799439011-qr.svg');
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:member-qr');
  });

  it('does not show a late QR result under a changed origin', async () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://8.8.8.8');
    let resolveFirstQr;
    qrToString
      .mockImplementationOnce(() => new Promise(resolve => { resolveFirstQr = resolve; }))
      .mockResolvedValueOnce('<svg data-target="new-origin"></svg>');

    const { rerender } = render(<MemberQr member={member} />);
    await waitFor(() => expect(qrToString).toHaveBeenCalledTimes(1));

    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://1.1.1.1');
    rerender(<MemberQr member={member} />);

    expect(screen.queryByRole('img', { name: 'QR code linking to Approved Member profile' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download SVG/i })).toBeDisabled();

    resolveFirstQr('<svg data-target="old-origin"></svg>');
    const newOriginQr = await screen.findByRole('img', { name: 'QR code linking to Approved Member profile' });
    expect(decodeURIComponent(newOriginQr.getAttribute('src').split(',')[1])).toContain('data-target="new-origin"');
    expect(decodeURIComponent(newOriginQr.getAttribute('src').split(',')[1])).not.toContain('old-origin');
  });

  it('does not show a late failure for a previous member', async () => {
    vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://8.8.8.8');
    let rejectFirstQr;
    qrToString
      .mockImplementationOnce(() => new Promise((resolve, reject) => { rejectFirstQr = reject; }))
      .mockResolvedValueOnce('<svg data-target="new-member"></svg>');

    const { rerender } = render(<MemberQr member={member} />);
    await waitFor(() => expect(qrToString).toHaveBeenCalledTimes(1));

    const nextMember = { ...member, _id: '507f1f77bcf86cd799439012', name: 'New Member' };
    rerender(<MemberQr member={nextMember} />);
    rejectFirstQr(new Error('old QR failure'));

    const newMemberQr = await screen.findByRole('img', { name: 'QR code linking to New Member profile' });
    expect(newMemberQr).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
