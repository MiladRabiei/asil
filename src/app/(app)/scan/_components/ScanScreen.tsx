'use client';

import { AppTopBar } from '@/shared/layout/AppTopBar';
import Button from '@/shared/UI/Button';
import { MapPin } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useQrScanner } from '../_hooks/useQrScanner';
import ManualCodeEntry from './ManualCodeEntry';
import QrScanner from './QrScanner';

export default function ScanScreen() {
  const searchParams = useSearchParams();
  // Present when arriving via BranchDetail's "اسکن کد این ایستگاه" button —
  // lets us flag when the scanned code belongs to a different branch.
  const expectedBranchId = searchParams.get('branchId');
  const { videoRef, status, branch, error, start, submitManualCode, reset } = useQrScanner();
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Camera and manual entry both feed the same resolver — flip back to the
  // camera once a manual code resolves so "scan another" starts fresh.
  useEffect(() => {
    if (status === 'success') setShowManualEntry(false);
  }, [status]);

  if (status === 'success' && branch) {
    const mismatched = Boolean(expectedBranchId) && String(branch.id) !== expectedBranchId;
    return (
      <section className="w-full min-h-dvh flex flex-col bg-neutral-950 text-white">
        <AppTopBar eyebrow="Scan" className="text-white" />
        <div className="flex-1 flex flex-col items-center justify-center gap-md p-lg text-center">
          <p className="text-lg font-semibold">{branch.name} شناسایی شد</p>
          <p className="text-sm text-white/60">{branch.address}</p>
          {mismatched && (
            <p className="text-sm text-amber-400">این کد مربوط به ایستگاه دیگری است.</p>
          )}
          <div className="flex flex-col gap-sm w-full max-w-sm mt-md">
            {!mismatched && (
              <Link href={`/map/${branch.id}`}>
                <Button className="w-full gap-2">
                  <MapPin className="size-4" />
                  مشاهده ایستگاه و شروع شارژ
                </Button>
              </Link>
            )}
            <Button variant="outline" className="w-full text-white" onClick={reset}>
              اسکن مجدد
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full min-h-dvh flex flex-col bg-neutral-950 text-white">
      <AppTopBar eyebrow="Scan" className="text-white" />

      <div className="flex-1 flex flex-col items-center gap-md p-md">
        {showManualEntry ? (
          <div className="flex-1 flex items-center justify-center w-full">
            <ManualCodeEntry onSubmit={submitManualCode} />
          </div>
        ) : (
          <>
            <QrScanner videoRef={videoRef} status={status} onStart={start} />

            <p className="text-sm text-white/70 text-center max-w-xs">
              کد QR روی ایستگاه شارژ را داخل کادر قرار دهید.
            </p>

            {status === 'resolving' && <p className="text-sm text-white/70">در حال بررسی کد…</p>}
            {status === 'error' && error && <p className="text-sm text-red-400">{error}</p>}
          </>
        )}

        <div className="w-full max-w-sm flex flex-col items-center gap-1 border-t border-white/10 pt-md mt-auto text-center">
          <button
            onClick={() => setShowManualEntry((v) => !v)}
            className="text-sm font-medium underline underline-offset-4"
          >
            {showManualEntry ? 'اسکن با دوربین' : 'کد ایستگاه شارژ را به‌صورت دستی وارد کنید'}
          </button>
          <span className="text-xs text-white/50">
            در اسکن مشکل دارید؟ کد درج‌شده روی ایستگاه را پیدا کنید.
          </span>
        </div>
      </div>
    </section>
  );
}
