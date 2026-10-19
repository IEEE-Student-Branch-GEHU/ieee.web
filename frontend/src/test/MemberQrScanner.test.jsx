import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BrowserQrScannerError } from '../lib/browser-qr-scanner';
import MemberQrScanner from '../components/members/MemberQrScanner';

vi.mock('../components/Navbar', () => ({ default: () => <nav aria-label="Primary navigation" /> }));
vi.mock('../components/Footer', () => ({ default: () => <footer /> }));

const MEMBER_URL = 'https://8.8.8.8/members/507f1f77bcf86cd799439011';

const createScannerFactory = ({ start = vi.fn().mockResolvedValue(undefined) } = {}) => {
  let callbacks;
  const scanner = {
    start,
    stop: vi.fn(),
    destroy: vi.fn(),
  };
  const factory = vi.fn((options) => {
    callbacks = options;
    return scanner;
  });
  return { factory, scanner, getCallbacks: () => callbacks };
};

beforeEach(() => {
  vi.stubEnv('VITE_PUBLIC_SITE_URL', 'https://8.8.8.8');
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('MemberQrScanner', () => {
  it('does not request a scanner until the user explicitly starts', async () => {
    const { factory, scanner } = createScannerFactory();
    render(<MemberQrScanner onNavigate={vi.fn()} scannerFactory={factory} />);

    expect(factory).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /start scanning/i }));
    await waitFor(() => expect(scanner.start).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('status')).toHaveTextContent(/point the camera/i);
  });

  it('validates a detected URL, stops scanning, and navigates only once', async () => {
    const { factory, scanner, getCallbacks } = createScannerFactory();
    const onNavigate = vi.fn();
    render(<MemberQrScanner onNavigate={onNavigate} scannerFactory={factory} />);
    fireEvent.click(screen.getByRole('button', { name: /start scanning/i }));
    await waitFor(() => expect(scanner.start).toHaveBeenCalled());

    await act(async () => {
      getCallbacks().onResult(MEMBER_URL);
      getCallbacks().onResult(MEMBER_URL);
    });

    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('/members/507f1f77bcf86cd799439011'));
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(scanner.stop).toHaveBeenCalled();
    expect(scanner.destroy).toHaveBeenCalled();
  });

  it.each([
    'https://evil.example/members/507f1f77bcf86cd799439011',
    'javascript:alert(1)',
    'https://8.8.8.8/members/507f1f77bcf86cd799439011?redirect=https://evil.example',
    'https://8.8.8.8/admin',
    'https://8.8.8.8/members/not-an-object-id',
  ])('rejects an unsafe detected payload: %s', async (payload) => {
    const { factory, scanner, getCallbacks } = createScannerFactory();
    const onNavigate = vi.fn();
    render(<MemberQrScanner onNavigate={onNavigate} scannerFactory={factory} />);
    fireEvent.click(screen.getByRole('button', { name: /start scanning/i }));
    await waitFor(() => expect(scanner.start).toHaveBeenCalled());

    await act(async () => {
      getCallbacks().onResult(payload);
    });

    expect(await screen.findByRole('alert')).toHaveTextContent(/not a trusted IEEE member profile URL/i);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('shows a permission error and does not leave the scanner active', async () => {
    const start = vi.fn().mockRejectedValue(new BrowserQrScannerError('permission-denied', 'Camera permission was denied.'));
    const { factory, scanner } = createScannerFactory({ start });
    render(<MemberQrScanner onNavigate={vi.fn()} scannerFactory={factory} />);
    fireEvent.click(screen.getByRole('button', { name: /start scanning/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/camera permission was denied/i);
    expect(scanner.stop).toHaveBeenCalled();
    expect(scanner.destroy).toHaveBeenCalled();
  });

  it('shows unsupported-browser errors without pretending to scan', async () => {
    const start = vi.fn().mockRejectedValue(new BrowserQrScannerError('unsupported', 'This browser does not support QR camera scanning.'));
    const { factory } = createScannerFactory({ start });
    render(<MemberQrScanner onNavigate={vi.fn()} scannerFactory={factory} />);
    fireEvent.click(screen.getByRole('button', { name: /start scanning/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/does not support QR camera scanning/i);
  });

  it('stops and destroys camera resources when unmounted', async () => {
    const { factory, scanner } = createScannerFactory();
    const { unmount } = render(<MemberQrScanner onNavigate={vi.fn()} scannerFactory={factory} />);
    fireEvent.click(screen.getByRole('button', { name: /start scanning/i }));
    await waitFor(() => expect(scanner.start).toHaveBeenCalled());

    unmount();

    expect(scanner.stop).toHaveBeenCalled();
    expect(scanner.destroy).toHaveBeenCalled();
  });

  it('uses the same destination validation for the manual fallback', async () => {
    const { factory, scanner } = createScannerFactory();
    const onNavigate = vi.fn();
    render(<MemberQrScanner onNavigate={onNavigate} scannerFactory={factory} />);
    fireEvent.change(screen.getByLabelText('Member profile URL'), { target: { value: MEMBER_URL } });
    fireEvent.click(screen.getByRole('button', { name: 'Open profile' }));

    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith('/members/507f1f77bcf86cd799439011'));
    expect(factory).not.toHaveBeenCalled();
    expect(scanner.stop).not.toHaveBeenCalled();
  });
});
