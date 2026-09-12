'use client';

import { lookupBranchByCode } from '@/shared/_service/ev.service';
import type { IChargingBranch } from '@/shared/_service/interface.ev';
import QrScannerLib from 'qr-scanner';
import { useCallback, useEffect, useRef, useState } from 'react';

export type QrScannerStatus = 'idle' | 'scanning' | 'resolving' | 'success' | 'error';

export function useQrScanner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScannerLib | null>(null);
  const lastScanned = useRef<string | null>(null);

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

    scannerRef.current?.stop();

    setError('');
    setStatus('resolving');

    try {
      const result = await lookupBranchByCode(code);

      setBranch(result);
      setStatus('success');
    } catch {
      setError('کد شناسایی نشد. دوباره تلاش کنید.');

      setStatus('error');
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const scanner = new QrScannerLib(
      video,
      (result) => {
        void resolveCode(result.data);
      },
      {
        highlightScanRegion: false,
        highlightCodeOutline: false,
        preferredCamera: 'environment',
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
  }, [resolveCode]);

  useEffect(() => {
    let cancelled = false;

    void QrScannerLib.hasCamera().then((result) => {
      if (!cancelled) {
        setHasCamera(result);
      }
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
      setError('');
      lastScanned.current = null;

      /*
       * qr-scanner uses the browser camera API.
       *
       * The browser owns the camera permission request.
       */
      await scanner.start();

      setStatus('scanning');
    } catch {
      setStatus('error');

      setError('دسترسی به دوربین ممکن نشد. لطفاً اجازه استفاده از دوربین را در مرورگر فعال کنید.');
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
