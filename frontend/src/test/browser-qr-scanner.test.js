import { afterEach, expect, it, vi } from 'vitest';
import { BrowserQrScannerError, createBrowserQrScanner } from '../lib/browser-qr-scanner';

const originalBarcodeDetector = globalThis.BarcodeDetector;
const originalGetUserMedia = navigator.mediaDevices?.getUserMedia;
const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;

afterEach(() => {
  if (originalBarcodeDetector) globalThis.BarcodeDetector = originalBarcodeDetector;
  else delete globalThis.BarcodeDetector;
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = originalGetUserMedia;
  window.requestAnimationFrame = originalRequestAnimationFrame;
  window.cancelAnimationFrame = originalCancelAnimationFrame;
  vi.restoreAllMocks();
});

it('uses the rear camera, decodes QR frames, and stops tracks on stop', async () => {
  const track = { stop: vi.fn() };
  const stream = { getTracks: () => [track] };
  let frame;
  const detector = { detect: vi.fn().mockResolvedValue([{ rawValue: 'payload' }]) };
  globalThis.BarcodeDetector = class FakeBarcodeDetector {
    static getSupportedFormats = vi.fn().mockResolvedValue(['qr_code']);
    constructor() { return detector; }
  };
  navigator.mediaDevices = { getUserMedia: vi.fn().mockResolvedValue(stream) };
  window.requestAnimationFrame = vi.fn(callback => { frame = callback; return 1; });
  window.cancelAnimationFrame = vi.fn();
  const onResult = vi.fn();
  const onError = vi.fn();
  const video = { srcObject: null, play: vi.fn().mockResolvedValue(undefined), setAttribute: vi.fn(), muted: false };
  const scanner = createBrowserQrScanner({ video, onResult, onError });

  await scanner.start();
  expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
    audio: false,
    video: { facingMode: { ideal: 'environment' } },
  });
  expect(video.srcObject).toBe(stream);

  await frame();
  expect(onResult).toHaveBeenCalledWith('payload');
  scanner.stop();
  expect(track.stop).toHaveBeenCalledTimes(1);
  expect(video.srcObject).toBeNull();
  expect(onError).not.toHaveBeenCalled();
});

it('maps camera permission failures to a safe scanner error', async () => {
  globalThis.BarcodeDetector = class FakeBarcodeDetector {
    static getSupportedFormats = vi.fn().mockResolvedValue(['qr_code']);
  };
  const permissionError = new DOMException('denied', 'NotAllowedError');
  navigator.mediaDevices = { getUserMedia: vi.fn().mockRejectedValue(permissionError) };
  const scanner = createBrowserQrScanner({
    video: { play: vi.fn(), setAttribute: vi.fn() },
    onResult: vi.fn(),
    onError: vi.fn(),
  });

  await expect(scanner.start()).rejects.toMatchObject({
    name: 'BrowserQrScannerError',
    code: 'permission-denied',
  });
});

it('maps missing-camera failures to a camera-unavailable error', async () => {
  globalThis.BarcodeDetector = class FakeBarcodeDetector {
    static getSupportedFormats = vi.fn().mockResolvedValue(['qr_code']);
  };
  navigator.mediaDevices = {
    getUserMedia: vi.fn().mockRejectedValue(new DOMException('missing', 'NotFoundError')),
  };
  const scanner = createBrowserQrScanner({
    video: { play: vi.fn(), setAttribute: vi.fn() },
    onResult: vi.fn(),
    onError: vi.fn(),
  });

  await expect(scanner.start()).rejects.toMatchObject({
    name: 'BrowserQrScannerError',
    code: 'camera-unavailable',
  });
});

it('rejects browsers without BarcodeDetector before requesting camera access', async () => {
  delete globalThis.BarcodeDetector;
  const getUserMedia = vi.fn();
  navigator.mediaDevices = { getUserMedia };
  const scanner = createBrowserQrScanner({
    video: { play: vi.fn(), setAttribute: vi.fn() },
    onResult: vi.fn(),
    onError: vi.fn(),
  });

  await expect(scanner.start()).rejects.toEqual(expect.objectContaining({
    name: 'BrowserQrScannerError',
    code: 'unsupported',
  }));
  expect(getUserMedia).not.toHaveBeenCalled();
});
