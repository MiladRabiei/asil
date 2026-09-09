'use client';

import type { QrScannerStatus } from '../_hooks/useQrScanner';
import { Camera } from 'lucide-react';
import type { RefObject } from 'react';

export interface QrScannerProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: QrScannerStatus;
  onStart: () => void;
}

// Four corner brackets over the live camera feed — the standard "align the
// code in here" affordance, matching the reference design. Pure CSS
// (border-only L shapes), no image assets needed.
function ScanFrameCorners() {
  const base = 'absolute size-8 border-white';
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="relative size-56">
        <span className={`${base} top-0 right-0 border-t-4 border-r-4 rounded-tr-lg`} />
        <span className={`${base} top-0 left-0 border-t-4 border-l-4 rounded-tl-lg`} />
        <span className={`${base} bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg`} />
        <span className={`${base} bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg`} />
      </div>
    </div>
  );
}

// Purely presentational — the `qr-scanner` instance itself lives in
// useQrScanner (owns the <video> element via videoRef). Keeping the camera
// lifecycle out of this component means the corner-frame UI never has to
// know about the scanning library at all.
export default function QrScanner({ videoRef, status, onStart }: QrScannerProps) {
  return (
    <div className="relative w-full aspect-[3/4] max-w-sm mx-auto overflow-hidden rounded-3xl bg-neutral-900">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        playsInline
      />
      <ScanFrameCorners />

      {status !== 'scanning' && (
        <button
          type="button"
          onClick={onStart}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 text-white"
        >
          <Camera className="size-8" />
          <span className="text-sm font-medium">برای شروع اسکن کنید</span>
        </button>
      )}
    </div>
  );
}
