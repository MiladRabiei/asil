'use client';

import { Camera, ScanLine } from 'lucide-react';

import type { QrScannerStatus } from '../_hooks/useQrScanner';

export interface QrScannerProps {
  videoRef: (node: HTMLVideoElement | null) => void;
  status: QrScannerStatus;
  onStart: () => void;
  cameraError?: string | null;
}

function ScanFrameCorners() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative size-64 max-w-[70vw]">
        <span className="absolute left-0 top-0 h-10 w-10 rounded-tl-xl border-l-4 border-t-4 border-white" />
        <span className="absolute right-0 top-0 h-10 w-10 rounded-tr-xl border-r-4 border-t-4 border-white" />
        <span className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-xl border-b-4 border-l-4 border-white" />
        <span className="absolute bottom-0 right-0 h-10 w-10 rounded-br-xl border-b-4 border-r-4 border-white" />
      </div>
    </div>
  );
}

export default function QrScanner({ videoRef, status, onStart, cameraError }: QrScannerProps) {
  const isScanning = status === 'scanning';
  const isResolving = status === 'resolving';
  const showCameraFallback = Boolean(cameraError);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="px-1">
        <div className="flex items-center gap-2">
          <ScanLine className="size-5 text-primary" />

          <h1 className="text-lg font-semibold">اسکن کد ایستگاه</h1>
        </div>

        <p className="mt-1 text-sm text-white/60">دوربین را روی QR کد دستگاه قرار دهید</p>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          autoPlay
          playsInline
        />

        <div className="pointer-events-none absolute inset-0 bg-black/10" />

        <ScanFrameCorners />

        {isScanning && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-xs text-white backdrop-blur">
            QR کد را داخل کادر قرار دهید
          </div>
        )}

        {status === 'idle' && !showCameraFallback && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="rounded-2xl bg-black/60 px-5 py-3 text-sm backdrop-blur">
              در حال فعال‌سازی دوربین...
            </div>
          </div>
        )}

        {isResolving && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="rounded-2xl bg-black/70 px-5 py-3 text-sm backdrop-blur">
              در حال بررسی کد...
            </div>
          </div>
        )}

        {showCameraFallback && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-black/80 px-6 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-white/10">
              <Camera className="size-8" />
            </div>

            <div>
              <p className="font-semibold">دسترسی به دوربین امکان‌پذیر نیست</p>

              <p className="mt-2 text-sm leading-6 text-white/60">{cameraError}</p>
            </div>

            <button
              type="button"
              onClick={onStart}
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition active:scale-95"
            >
              تلاش دوباره
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
