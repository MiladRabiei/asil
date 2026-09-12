'use client';

import { lookupBranchByCode } from '@/shared/_service/ev.service';
import type { IChargingBranch } from '@/shared/_service/interface.ev';
import QrScannerLib from 'qr-scanner';
import { useCallback, useEffect, useRef, useState } from 'react';

// Uses the `qr-scanner` npm package rather than a Barcode-Detection-API
// based scanner (e.g. @yudiel/react-qr-scanner): it decodes on a Web Worker
// via its own bundled algorithm, so behavior is identical across browsers
// instead of silently falling back to a heavier WASM polyfill on Safari/iOS
// — the platform this app cares most about (see lib/pwaInstall/detect.ts).
export type QrScannerStatus = 'idle' | 'scanning' | 'resolving' | 'success' | 'error';

export function useQrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScannerLib | null>(null);
  const lastScanned = useRef<string | null>(null);
  // Guards against a lookupBranchByCode response arriving after the
  // component unmounted, or after a second scan already started — without
  // this, a slow first response can land after a faster second one and
  // clobber it.
  const requestId = useRef(0);
  const mountedRef = useRef(true);

  const [status, setStatus] = useState<QrScannerStatus>('idle');
  const [branch, setBranch] = useState<IChargingBranch | null>(null);
  const [error, setError] = useState('');
  const [hasCamera, setHasCamera] = useState<boolean | null>(null);

  const resolveCode = useCallback(async (rawValue: string) => {
    const code = rawValue.trim();

    if (!code || code === lastScanned.current) {
      return;
    }

    lastScanned.current = code;
    const currentRequest = ++requestId.current;

    scannerRef.current?.stop();
    setError('');
    setStatus('resolving');

    try {
      const result = await lookupBranchByCode(code);
      if (!mountedRef.current || currentRequest !== requestId.current) return;

      setBranch(result);
      setStatus('success');
    } catch {
      if (!mountedRef.current || currentRequest !== requestId.current) return;

      // Reset so the exact same code can be retried — without this, a
      // second scan of the same (still-invalid, or since-fixed) code would
      // silently no-op against the `code === lastScanned.current` guard
      // above.
      lastScanned.current = null;
      setError('کد شناسایی نشد. دوباره تلاش کنید.');
      setStatus('error');
    }
  }, []);

  // Build the scanner instance once the <video> element exists, but never
  // start the camera until the user taps "start" (see `start` below) —
  // requesting camera permission on mount is a common source of surprise/
  // rejected-permission prompts, worse on iOS.
  useEffect(() => {
    mountedRef.current = true;

    const video = videoRef.current;
    if (!video) return;

    const scanner = new QrScannerLib(
      video,
      (result) => {
        void resolveCode(result.data.trim());
      },
      {
        highlightScanRegion: false,
        highlightCodeOutline: false,
        preferredCamera: 'environment',
      }
    );

    scannerRef.current = scanner;

    return () => {
      mountedRef.current = false;
      requestId.current += 1;
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [resolveCode]);

  // Device-level camera check (enumerateDevices, no permission prompt) —
  // lets ScanScreen skip straight to manual entry on cameraless devices
  // (desktop QA, some emulators) instead of making them tap "start" first
  // and watch it fail.
  useEffect(() => {
    let cancelled = false;
    void QrScannerLib.hasCamera().then((result) => {
      if (!cancelled) setHasCamera(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const start = useCallback(async () => {
    const scanner = scannerRef.current;

    if (!scanner) {
      setStatus('error');
      setError('اسکنر دوربین آماده نیست. دوباره تلاش کنید.');
      return;
    }

    try {
      requestId.current += 1;
      setError('');
      lastScanned.current = null;

      // qr-scanner uses the browser camera API — the browser owns the
      // camera permission request, this just triggers it.
      await scanner.start();
      setStatus('scanning');
    } catch {
      setStatus('error');
      setError('دسترسی به دوربین ممکن نشد. می‌توانید کد را دستی وارد کنید.');
    }
  }, []);

  const stop = useCallback(() => {
    scannerRef.current?.stop();
  }, []);

  const reset = useCallback(() => {
    requestId.current += 1;
    scannerRef.current?.stop();
    lastScanned.current = null;
    setBranch(null);
    setError('');
    setStatus('idle');
  }, []);

  // Manual code entry shares the exact same resolver as the camera path —
  // status/success/error behave identically either way.
  return {
    videoRef,
    status,
    branch,
    error,
    hasCamera,
    start,
    stop,
    reset,
    submitManualCode: resolveCode,
  };
}
