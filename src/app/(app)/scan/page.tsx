'use client';

import Loading from '@/shared/UI/Loading';
import dynamic from 'next/dynamic';

// useQrScanner constructs a qr-scanner worker instance — keep the whole
// screen out of the server bundle rather than splitting camera state across
// a dynamic-import boundary (the success/manual-entry views all need the
// same hook state).
const ScanScreen = dynamic(() => import('./_components/ScanScreen'), {
  ssr: false,
  loading: () => (
    <div className="w-full min-h-dvh flex items-center justify-center bg-neutral-950">
      <Loading size="lg" />
    </div>
  ),
});

export default function ScanPage() {
  return <ScanScreen />;
}
