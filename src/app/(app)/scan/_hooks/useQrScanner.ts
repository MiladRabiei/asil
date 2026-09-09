'use client';

import { lookupBranchByCode } from '@/shared/_service/ev.service';
import type { IChargingBranch } from '@/shared/_service/interface.ev';
import { useCallback, useEffect, useRef, useState } from 'react';
import QrScannerLib from 'qr-scanner';

// Uses the `qr-scanner` npm package rather than a Barcode-Detection-API
// based scanner (e.g. @yudiel/react-qr-scanner): it decodes on a Web Worker
// via its own bundled algorithm, so behavior is identical across browsers
// instead of silently falling back to a heavier WASM polyfill on Safari/iOS
// — the platform this app cares most about (see lib/pwa/detectInstall.ts).
export type QrScannerStatus = 'idle' | 'scanning' | 'resolving' | 'success' | 'error';

export function useQrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScannerLib | null>(null);
  const lastScanned = useRef<string | null>(null);
  const [status, setStatus] = useState<QrScannerStatus>('idle');
  const [branch, setBranch] = useState<IChargingBranch | null>(null);
  const [error, setError] = useState('');

  const resolveCode = useCallback(async (rawValue: string) => {
    if (!rawValue || rawValue === lastScanned.current) return; // ignore duplicate frames
    lastScanned.current = rawValue;
    scannerRef.current?.stop();
    setStatus('resolving');
    try {
      const result = await lookupBranchByCode(rawValue);
      setBranch(result);
      setStatus('success');
    } catch {
      setError('کد شناسایی نشد. دوباره تلاش کنید.');
      setStatus('error');
    }
  }, []);

  // Build the scanner instance once the <video> element exists, but never
  // start the camera until the user taps "start" (see `start` below) —
  // requesting camera permission on mount is a common source of surprise/
  // rejected-permission prompts, worse on iOS.
  useEffect(() => {
    if (!videoRef.current) return;
    const scanner = new QrScannerLib(
      videoRef.current,
      (result) => void resolveCode(result.data.trim()),
      { highlightScanRegion: false, highlightCodeOutline: false, preferredCamera: 'environment' }
    );
    scannerRef.current = scanner;
    return () => {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [resolveCode]);

  const start = useCallback(async () => {
    try {
      setError('');
      lastScanned.current = null;
      await scannerRef.current?.start();
      setStatus('scanning');
    } catch {
      setStatus('error');
      setError('دسترسی به دوربین ممکن نشد. می‌توانید کد را دستی وارد کنید.');
    }
  }, []);

  const stop = useCallback(() => {
    scannerRef.current?.stop();
    setStatus('idle');
  }, []);

  const reset = useCallback(() => {
    scannerRef.current?.stop();
    lastScanned.current = null;
    setBranch(null);
    setError('');
    setStatus('idle');
  }, []);

  // Manual code entry shares the exact same resolver as the camera path —
  // status/success/error behave identically either way.
  const submitManualCode = resolveCode;

  return { videoRef, status, branch, error, start, stop, reset, submitManualCode };
}
