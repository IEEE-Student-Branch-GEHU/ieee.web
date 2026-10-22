'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, ExternalLink } from 'lucide-react';
import { getMemberProfileUrl, getStableMemberId } from '../../lib/public-site';

const MemberQr = ({ member }) => {
  const rawMemberId = member?._id;
  const memberId = getStableMemberId(member);
  const hasStableMemberId = Boolean(memberId);
  const profileUrl = hasStableMemberId ? getMemberProfileUrl(memberId) : null;
  const [generatedQr, setGeneratedQr] = useState({ profileUrl, svg: '' });
  const [generationError, setGenerationError] = useState(null);

  useEffect(() => {
    let active = true;

    if (!profileUrl) {
      return () => { active = false; };
    }

    QRCode.toString(profileUrl, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 320,
      color: { dark: '#111827', light: '#ffffff' },
    }).then(result => {
      if (active) {
        setGeneratedQr({ profileUrl, svg: result });
        setGenerationError(null);
      }
    }).catch(() => {
      if (active) {
        setGeneratedQr({ profileUrl, svg: '' });
        setGenerationError({ profileUrl, message: 'The QR code could not be generated. Please try again.' });
      }
    });

    return () => { active = false; };
  }, [profileUrl]);

  const svg = generatedQr.profileUrl === profileUrl ? generatedQr.svg : '';
  const error = !rawMemberId
    ? 'A stable member profile ID is required before generating a QR code.'
    : !hasStableMemberId
      ? 'The member profile ID is invalid, so a QR code cannot be generated.'
      : !profileUrl
    ? 'Set an HTTPS public site URL before generating production QR codes.'
    : generationError?.profileUrl === profileUrl ? generationError.message : '';

  const download = () => {
    if (!svg || !memberId) return;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `ieee-member-${memberId}-qr.svg`;
    link.click();
    URL.revokeObjectURL(href);
  };

  return (
    <div className="site-text flex min-w-0 flex-col items-center gap-4 text-center">
      {error && <p role="alert" className="site-muted max-w-sm text-sm leading-6">{error}</p>}
      {svg && (
        <div data-qr-surface className="rounded-xl bg-white p-4" aria-label={`QR code for ${member?.name || 'member'} profile`}>
          <img src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`} alt={`QR code linking to ${member?.name || 'member'} profile`} className="h-auto w-[min(16rem,100%)] max-w-full aspect-square object-contain" />
        </div>
      )}
      {profileUrl && <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="site-link inline-flex min-h-11 items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2"><ExternalLink size={16} aria-hidden="true" />Open public profile</a>}
      <button type="button" disabled={!svg} onClick={download} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primaryDark disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2">
        <Download size={16} aria-hidden="true" />Download SVG
      </button>
    </div>
  );
};

export default MemberQr;
