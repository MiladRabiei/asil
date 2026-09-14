'use client';

import { Link2, MapPin } from 'lucide-react';
import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { AppTopBar } from '@/shared/layout/AppTopBar';
import Button from '@/shared/UI/Button';

import ManualCodeEntry from './ManualCodeEntry';
import QrScanner from './QrScanner';

import { useQrScanner } from '../_hooks/useQrScanner';

export default function ScanScreen() {
  const searchParams = useSearchParams();
  const expectedBranchId = searchParams.get('branchId');

  const [showManualEntry, setShowManualEntry] = useState(false);

  const { videoRef, status, branch, error, cameraError, start, stop, reset, submitManualCode } =
    useQrScanner();

  const branchMismatch =
    Boolean(expectedBranchId) && Boolean(branch) && String(branch?.id) !== expectedBranchId;

  const handleRetryCamera = () => {
    reset();
    void start();
  };

  const handleManualToggle = () => {
    if (!showManualEntry) {
      stop();
    } else {
      void start();
    }

    setShowManualEntry((current) => !current);
  };

  return (
    <div className="fixed inset-0 z-[60] flex w-full flex-col bg-neutral-950 text-white">
      <AppTopBar eyebrow="Scan" className="text-white" />

      <div className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
        {showManualEntry ? (
          <ManualCodeEntry onSubmit={submitManualCode} />
        ) : (
          <QrScanner
            videoRef={videoRef}
            status={status}
            onStart={handleRetryCamera}
            cameraError={cameraError}
          />
        )}

        {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {branchMismatch && (
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
            این کد مربوط به ایستگاه دیگری است.
          </div>
        )}

        {branch && !branchMismatch && (
          <div className="rounded-2xl border border-white/10 bg-white p-4 text-neutral-900">
            <div className="flex items-center gap-3">
              <MapPin className="size-5" />

              <div>
                <p className="font-semibold">{branch.name}</p>

                {branch.address && (
                  <p className="mt-1 text-sm text-neutral-500">{branch.address}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {status === 'success' && branch && !branchMismatch && (
          <NextLink href={`/map/${branch.id}`}>
            <Button type="button" className="w-full">
              ادامه
            </Button>
          </NextLink>
        )}

        <button
          type="button"
          onClick={handleManualToggle}
          className="flex items-center justify-center gap-2 py-2 text-sm text-primary"
        >
          <Link2 className="size-4" />

          {showManualEntry ? 'بستن ورود دستی' : 'ورود دستی کد'}
        </button>
      </div>
    </div>
  );
}
