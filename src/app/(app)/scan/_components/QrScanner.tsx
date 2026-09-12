'use client';

import { Camera } from 'lucide-react';
import type { RefObject } from 'react';

import type { QrScannerStatus } from '../_hooks/useQrScanner';

export interface QrScannerProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: QrScannerStatus;
  onStart: () => void;
}

function ScanFrameCorners() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative size-64">
        <span className="absolute left-0 top-0 h-8 w-8 border-l-4 border-t-4 border-white" />
        <span className="absolute right-0 top-0 h-8 w-8 border-r-4 border-t-4 border-white" />
        <span className="absolute bottom-0 left-0 h-8 w-8 border-b-4 border-l-4 border-white" />
        <span className="absolute bottom-0 right-0 h-8 w-8 border-b-4 border-r-4 border-white" />
      </div>
    </div>
  );
}

export default function QrScanner({ videoRef, status, onStart }: QrScannerProps) {
  const isScanning = status === 'scanning';
  const isResolving = status === 'resolving';

  return (
    <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl bg-neutral-900">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        playsInline
      />

      <ScanFrameCorners />

      {!isScanning && !isResolving && (
        <button
          type="button"
          onClick={onStart}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white"
        >
          <Camera className="size-8" />

          <span className="text-sm font-medium">برای شروع اسکن کنید</span>
        </button>
      )}

      {isResolving && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white">
          <span className="text-sm font-medium">در حال بررسی کد...</span>
        </div>
      )}
    </div>
  );
}
