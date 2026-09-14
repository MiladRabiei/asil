'use client';

import { lookupBranchByCode } from '@/shared/_service/ev.service';
import type { IChargingBranch } from '@/shared/_service/interface.ev';
import QrScannerLib from 'qr-scanner';
import { useCallback, useEffect, useRef, useState } from 'react';

export type QrScannerStatus = 'idle' | 'scanning' | 'resolving' | 'success' | 'error';

export function useQrScanner() {
  const scannerRef = useRef<QrScannerLib | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const mountedRef = useRef(false);
  const startingRef = useRef(false);
  const resolvingRef = useRef(false);

  const requestId = useRef(0);
  const lastScanned = useRef<string | null>(null);

  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [status, setStatus] = useState<QrScannerStatus>('idle');
  const [branch, setBranch] = useState<IChargingBranch | null>(null);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    setVideoEl(node);
  }, []);

  const resolveCode = useCallback(async (rawValue: string) => {
    const code = rawValue.trim();

    if (!code || resolvingRef.current || code === lastScanned.current) {
      return;
    }

    resolvingRef.current = true;
    lastScanned.current = code;

    const currentRequest = ++requestId.current;

    scannerRef.current?.stop();

    setError('');
    setCameraError('');
    setStatus('resolving');

    try {
      const result = await lookupBranchByCode(code);

      if (!mountedRef.current || currentRequest !== requestId.current) {
        return;
      }

      setBranch(result);
      setStatus('success');
    } catch {
      if (!mountedRef.current || currentRequest !== requestId.current) {
        return;
      }

      lastScanned.current = null;
      setError('کد شناسایی نشد. دوباره تلاش کنید.');
      setStatus('scanning');
    } finally {
      resolvingRef.current = false;
    }
  }, []);

  const start = useCallback(async () => {
    const scanner = scannerRef.current;
    const video = videoRef.current;

    if (!scanner || !video) {
      setStatus('error');
      setCameraError('اسکنر دوربین آماده نیست. دوباره تلاش کنید.');
      return;
    }

    if (startingRef.current) {
      return;
    }

    startingRef.current = true;

    try {
      requestId.current += 1;
      lastScanned.current = null;
      resolvingRef.current = false;

      setError('');
      setCameraError('');
      setBranch(null);
      setStatus('idle');

      scanner.stop();

      // These are DOM properties, not React state.
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;

      await scanner.start();

      if (!mountedRef.current) {
        scanner.stop();
        return;
      }

      await new Promise<void>((resolve) => {
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          resolve();
          return;
        }

        const handler = () => {
          video.removeEventListener('loadedmetadata', handler);
          resolve();
        };

        video.addEventListener('loadedmetadata', handler);

        window.setTimeout(() => {
          video.removeEventListener('loadedmetadata', handler);
          resolve();
        }, 1000);
      });

      if (video.videoWidth === 0 || video.videoHeight === 0) {
        throw new Error('NO_VIDEO_FRAMES');
      }

      if (video.paused) {
        await video.play();
      }

      if (!mountedRef.current) {
        scanner.stop();
        return;
      }

      console.log('[QR] Camera started', {
        readyState: video.readyState,
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        paused: video.paused,
        srcObject: Boolean(video.srcObject),
      });

      setHasCamera(true);
      setStatus('scanning');
    } catch (cameraErr) {
      if (!mountedRef.current) {
        return;
      }

      console.error('[QR] Camera start failed:', cameraErr);

      scanner.stop();
      setStatus('error');

      if (cameraErr instanceof Error && cameraErr.message === 'NO_VIDEO_FRAMES') {
        setCameraError('تصویر دوربین دریافت نشد. صفحه را ببندید و دوباره وارد بخش اسکن شوید.');
        return;
      }

      const errorName =
        cameraErr instanceof DOMException
          ? cameraErr.name
          : cameraErr instanceof Error
            ? cameraErr.name
            : '';

      switch (errorName) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          setCameraError(
            'دسترسی به دوربین داده نشده است. دسترسی دوربین را فعال کنید و دوباره تلاش کنید.'
          );
          break;

        case 'NotFoundError':
        case 'DevicesNotFoundError':
          setHasCamera(false);
          setCameraError('دوربینی روی این دستگاه پیدا نشد. می‌توانید کد دستگاه را دستی وارد کنید.');
          break;

        case 'NotReadableError':
        case 'TrackStartError':
          setCameraError('دوربین در دسترس نیست. ممکن است توسط برنامه دیگری استفاده شود.');
          break;

        case 'OverconstrainedError':
          setCameraError('تنظیمات دوربین با این دستگاه سازگار نیست. دوباره تلاش کنید.');
          break;

        case 'SecurityError':
          setCameraError('مرورگر اجازه دسترسی به دوربین را نمی‌دهد. اتصال HTTPS را بررسی کنید.');
          break;

        default:
          setCameraError('دسترسی به دوربین ممکن نشد. دوباره تلاش کنید یا کد را دستی وارد کنید.');
      }
    } finally {
      startingRef.current = false;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      requestId.current += 1;

      scannerRef.current?.stop();
      scannerRef.current?.destroy();
      scannerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!videoEl) {
      return;
    }

    videoEl.muted = true;
    videoEl.autoplay = true;
    videoEl.playsInline = true;

    const scanner = new QrScannerLib(
      videoEl,
      (result) => {
        console.log('[QR] DETECTED:', result.data);
        void resolveCode(result.data);
      },
      {
        preferredCamera: 'environment',
        highlightScanRegion: false,
        highlightCodeOutline: false,
      }
    );

    scannerRef.current = scanner;

    // Delay start to the next frame so the effect only
    // synchronizes the external scanner instance.
    const startId = window.requestAnimationFrame(() => {
      void start();
    });

    return () => {
      window.cancelAnimationFrame(startId);

      scanner.stop();
      scanner.destroy();

      if (scannerRef.current === scanner) {
        scannerRef.current = null;
      }
    };
  }, [videoEl, resolveCode, start]);

  useEffect(() => {
    let cancelled = false;

    void QrScannerLib.hasCamera()
      .then((result) => {
        if (!cancelled) {
          setHasCamera(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setHasCamera(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const stop = useCallback(() => {
    scannerRef.current?.stop();
    resolvingRef.current = false;

    if (mountedRef.current) {
      setStatus('idle');
    }
  }, []);

  const reset = useCallback(() => {
    requestId.current += 1;
    resolvingRef.current = false;

    scannerRef.current?.stop();

    lastScanned.current = null;

    setBranch(null);
    setError('');
    setCameraError('');
    setStatus('idle');
  }, []);

  return {
    videoRef: videoRefCallback,

    status,
    branch,

    error,
    cameraError,
    hasCamera,

    start,
    stop,
    reset,

    submitManualCode: resolveCode,
  };
}
