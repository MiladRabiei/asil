'use client';

import { Link, MapPin } from 'lucide-react';
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

  return (
    <div className="min-h-dvh">
      <AppTopBar eyebrow="Scan" className="text-white" />

      <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6">
        <QrScanner videoRef={videoRef} status={status} onStart={start} />

        {hasCamera === false && (
          <p className="text-center text-sm text-neutral-500">
            دوربین در این دستگاه در دسترس نیست.
          </p>
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
          <Button
            type="button"
            onClick={() => {
              // Keep your existing navigation/action here.
            }}
          >
            ادامه
          </Button>
        )}

        {status === 'error' && (
          <Button type="button" onClick={reset}>
            تلاش دوباره
          </Button>
        )}

        <button
          type="button"
          onClick={() => setShowManualEntry((current) => !current)}
          className="flex items-center justify-center gap-2 text-sm text-primary"
        >
          <Link className="size-4" />

          {showManualEntry ? 'بستن ورود دستی' : 'ورود دستی کد'}
        </button>

        {showManualEntry && <ManualCodeEntry onSubmit={submitManualCode} />}
      </div>
    </div>
  );
}
