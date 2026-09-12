'use client';

import { Link2, MapPin } from 'lucide-react';
import NextLink from 'next/link';
import { useSearchParams } from 'next/navigation';

import { AppTopBar } from '@/shared/layout/AppTopBar';
import Button from '@/shared/UI/Button';

import ManualCodeEntry from './ManualCodeEntry';
import QrScanner from './QrScanner';

import { useState } from 'react';
import { useQrScanner } from '../_hooks/useQrScanner';

export default function ScanScreen() {
  const searchParams = useSearchParams();

  const expectedBranchId = searchParams.get('branchId');

  const [showManualEntry, setShowManualEntry] = useState(false);

  const { videoRef, status, branch, error, hasCamera, start, reset, submitManualCode } =
    useQrScanner();

  const branchMismatch =
    Boolean(expectedBranchId) && Boolean(branch) && String(branch?.id) !== expectedBranchId;

  // A device we already know has no camera can't do anything useful with
  // the scan UI — skip straight to manual entry instead of showing a "tap
  // to start" button that's guaranteed to fail.
  const noCamera = hasCamera === false;
  const manualEntryActive = showManualEntry || noCamera;

  return (
    <div className="min-h-dvh">
      <AppTopBar eyebrow="Scan" className="text-white" />

      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6">
        {manualEntryActive ? (
          <>
            {noCamera && (
              <p className="text-center text-sm text-neutral-500">
                دوربینی روی این دستگاه شناسایی نشد. کد ایستگاه را دستی وارد کنید.
              </p>
            )}
            <ManualCodeEntry onSubmit={submitManualCode} />
          </>
        ) : (
          <QrScanner videoRef={videoRef} status={status} onStart={start} />
        )}

        {error && <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        {branchMismatch && (
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
            این کد مربوط به ایستگاه دیگری است.
          </div>
        )}

        {branch && !branchMismatch && (
          <div className="rounded-2xl border bg-white p-4">
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

        {status === 'error' && (
          <Button type="button" onClick={reset}>
            تلاش دوباره
          </Button>
        )}

        {!noCamera && (
          <button
            type="button"
            onClick={() => setShowManualEntry((current) => !current)}
            className="flex items-center justify-center gap-2 text-sm text-primary"
          >
            <Link2 className="size-4" />

            {showManualEntry ? 'بستن ورود دستی' : 'ورود دستی کد'}
          </button>
        )}
      </div>
    </div>
  );
}
