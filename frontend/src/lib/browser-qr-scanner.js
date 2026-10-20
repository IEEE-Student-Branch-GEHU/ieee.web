export class BrowserQrScannerError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'BrowserQrScannerError';
    this.code = code;
  }
}

const stopTracks = (stream) => {
  stream?.getTracks?.().forEach(track => track.stop());
};

const getScannerError = (error) => {
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
    return new BrowserQrScannerError('permission-denied', 'Camera permission was denied. Allow camera access and try again.');
  }
  if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') {
    return new BrowserQrScannerError('camera-unavailable', 'No usable camera was found on this device.');
  }
  return new BrowserQrScannerError('camera-error', 'The camera could not be started. Please try again.');
};

export const createBrowserQrScanner = ({ video, onResult, onError }) => {
  let detector;
  let stream;
  let animationFrame;
  let stopped = true;
  let destroyed = false;
  let detecting = false;

  const cancelFrame = () => {
    if (animationFrame !== undefined && typeof window !== 'undefined') {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = undefined;
    }
  };

  const stop = () => {
    stopped = true;
    cancelFrame();
    stopTracks(stream);
    stream = undefined;
    if (video) video.srcObject = null;
  };

  const scanFrame = async () => {
    if (stopped || destroyed || !detector || detecting) return;
    detecting = true;
    try {
      const results = await detector.detect(video);
      if (!stopped && !destroyed) {
        const result = results?.find(item => typeof item?.rawValue === 'string' && item.rawValue.trim());
        if (result) onResult(result.rawValue);
      }
    } catch (error) {
      if (!stopped && !destroyed) {
        stop();
        onError(getScannerError(error));
      }
      return;
    } finally {
      detecting = false;
    }

    if (!stopped && !destroyed && typeof window !== 'undefined') {
      animationFrame = window.requestAnimationFrame(scanFrame);
    }
  };

  const start = async () => {
    if (destroyed) throw new BrowserQrScannerError('destroyed', 'The scanner is no longer available.');

    const Detector = globalThis.BarcodeDetector;
    if (typeof Detector !== 'function') {
      throw new BrowserQrScannerError('unsupported', 'This browser does not support QR camera scanning.');
    }
    if (!globalThis.navigator?.mediaDevices?.getUserMedia) {
      throw new BrowserQrScannerError('unsupported', 'Camera access is not supported by this browser.');
    }

    if (typeof Detector.getSupportedFormats === 'function') {
      const formats = await Detector.getSupportedFormats();
      if (!formats.includes('qr_code')) {
        throw new BrowserQrScannerError('unsupported', 'This browser does not support QR camera scanning.');
      }
    }

    detector = new Detector({ formats: ['qr_code'] });
    stopped = false;
    let nextStream;
    try {
      nextStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } },
      });
    } catch (error) {
      throw getScannerError(error);
    }

    if (destroyed || stopped) {
      stopTracks(nextStream);
      return;
    }

    stream = nextStream;
    video.srcObject = stream;
    video.setAttribute('playsinline', 'true');
    video.muted = true;
    try {
      await video.play();
    } catch (error) {
      stop();
      throw getScannerError(error);
    }
    stopped = false;
    scanFrame();
  };

  const destroy = () => {
    destroyed = true;
    stop();
    detector = undefined;
  };

  return { start, stop, destroy };
};
