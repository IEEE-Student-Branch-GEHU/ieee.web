'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff, ExternalLink, ScanLine } from 'lucide-react';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { BrowserQrScannerError, createBrowserQrScanner } from '../../lib/browser-qr-scanner';
import { validateMemberProfileDestination } from '../../lib/public-site';

const scannerErrorMessage = (error) => {
  if (error instanceof BrowserQrScannerError) return error.message;
  return 'The camera scanner could not start. Please try again.';
};

const MemberQrScanner = ({ onNavigate, scannerFactory = createBrowserQrScanner }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const handledScanRef = useRef(false);
  const mountedRef = useRef(true);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [manualPayload, setManualPayload] = useState('');

  const disposeScanner = () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    scanner.stop?.();
    scanner.destroy?.();
  };

  useEffect(() => () => {
    mountedRef.current = false;
    disposeScanner();
  }, []);

  const navigateFromPayload = (payload) => {
    if (handledScanRef.current) return;
    const destination = validateMemberProfileDestination(payload);
    if (!destination) {
      setStatus('invalid');
      setMessage('That QR code is not a trusted IEEE member profile URL.');
      return;
    }

    handledScanRef.current = true;
    disposeScanner();
    setStatus('success');
    setMessage('Member profile found. Opening the public profile…');
    onNavigate(destination.path);
  };

  const handleScannerError = (error) => {
    if (!mountedRef.current) return;
    disposeScanner();
    setStatus(error?.code === 'unsupported' ? 'unsupported' : 'error');
    setMessage(scannerErrorMessage(error));
  };

  const startScanning = async () => {
    if (status === 'starting' || status === 'scanning') return;
    handledScanRef.current = false;
    setMessage('Requesting camera permission…');
    setStatus('starting');

    try {
      const scanner = scannerFactory({
        video: videoRef.current,
        onResult: navigateFromPayload,
        onError: handleScannerError,
      });
      scannerRef.current = scanner;
      await scanner.start();
      if (!mountedRef.current || scannerRef.current !== scanner) {
        scanner.stop?.();
        scanner.destroy?.();
        return;
      }
      setStatus('scanning');
      setMessage('Point the camera at an IEEE member QR code.');
    } catch (error) {
      handleScannerError(error);
    }
  };

  const stopScanning = () => {
    disposeScanner();
    handledScanRef.current = false;
    setStatus('idle');
    setMessage('Camera stopped. Start scanning when you are ready.');
  };

  const handleManualSubmit = (event) => {
    event.preventDefault();
    navigateFromPayload(manualPayload);
  };

  const isActive = status === 'starting' || status === 'scanning';

  return (
    <div className="site-surface min-h-screen">
      <Navbar surface />
      <main className="site-surface px-6 pb-24 pt-36 sm:px-8" aria-labelledby="member-qr-scanner-title">
        <div className="mx-auto max-w-3xl">
          <header>
            <p className="site-accent text-sm font-semibold uppercase tracking-[0.18em]">Community</p>
            <h1 id="member-qr-scanner-title" className="site-text mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Scan Member QR</h1>
            <p className="site-muted mt-5 max-w-2xl text-base leading-8 sm:text-lg">Scan an IEEE member profile QR code to open its public, read-only profile. Scanning never signs you in or grants editing access.</p>
          </header>

          <section className="site-panel site-border mt-10 rounded-3xl border p-6 shadow-sm sm:p-8" aria-live="polite">
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="site-panel-muted flex h-16 w-16 items-center justify-center rounded-2xl text-primary" aria-hidden="true"><ScanLine size={32} /></div>
              <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-slate-950">
                <video ref={videoRef} className={`aspect-video w-full object-cover ${isActive ? 'block' : 'hidden'}`} aria-label="QR scanner camera preview" autoPlay playsInline muted />
                {!isActive && <div className="flex aspect-video items-center justify-center px-8 text-sm text-slate-300">Camera preview appears after you start scanning.</div>}
              </div>
              {message && <p role={status === 'error' || status === 'unsupported' || status === 'invalid' ? 'alert' : 'status'} className="site-muted max-w-xl text-sm leading-7">{message}</p>}
              {status === 'success' ? <p className="site-accent inline-flex items-center gap-2 text-sm font-semibold"><ExternalLink size={16} aria-hidden="true" />Opening public profile…</p> : isActive ? <button type="button" onClick={stopScanning} className="inline-flex min-h-11 items-center gap-2 rounded-xl border site-border px-5 py-3 text-sm font-semibold site-text hover:border-primary hover:text-primary"><CameraOff size={17} aria-hidden="true" />Stop camera</button> : <button type="button" onClick={startScanning} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primaryDark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"><Camera size={17} aria-hidden="true" />Start scanning</button>}
            </div>
          </section>

          <section className="site-panel site-border mt-8 rounded-2xl border p-6" aria-labelledby="manual-member-url-title">
            <h2 id="manual-member-url-title" className="site-text text-xl font-bold">Open a member QR destination manually</h2>
            <p className="site-muted mt-2 text-sm leading-6">For browsers without camera support, paste the full URL from an IEEE member QR code. Only the trusted public `/members/&lt;id&gt;` format is accepted.</p>
            <form onSubmit={handleManualSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="member-qr-manual-url" className="sr-only">Member profile URL</label>
              <input id="member-qr-manual-url" type="url" value={manualPayload} onChange={event => setManualPayload(event.target.value)} placeholder="https://your-approved-site/members/..." className="site-panel site-border site-text min-h-11 min-w-0 flex-1 rounded-xl border px-3 text-sm" />
              <button type="submit" className="min-h-11 rounded-xl border site-border px-5 py-3 text-sm font-semibold site-text hover:border-primary hover:text-primary">Open profile</button>
            </form>
          </section>
        </div>
      </main>
      <Footer sectionLinkPrefix="/" />
    </div>
  );
};

export default MemberQrScanner;
