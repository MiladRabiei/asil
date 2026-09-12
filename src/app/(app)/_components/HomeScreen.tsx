'use client';

import { useUser } from '@/context/UserContext';
import { useCurrentLocation } from '@/lib/geolocation';
import { useNearbyStations } from '@/lib/stations';
import { useGetWallet } from '@/shared/_service/hook.query';
import { AppTopBar } from '@/shared/layout/AppTopBar';
import Button from '@/shared/UI/Button';
import { convertToPersianDigits } from '@/shared/utils/digitConvertor.utils';
import { MapPin, QrCode, Wallet2 } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

const STATUS_DOT: Record<string, string> = {
  AVAILABLE: 'bg-green-500',
  FULL: 'bg-amber-500',
  OUT_OF_SERVICE: 'bg-red-500',
};

export default function HomeScreen() {
  const { user } = useUser();
  const { data: wallet } = useGetWallet();

  // "Nearby" here means device GPS + radius (see lib/stations/nearby.ts) —
  // deliberately not the same query the full map screen uses (that's
  // viewport/bounds-based, see BranchMap). A user sitting in Tehran should
  // see Tehran stations here regardless of where they last panned the map.
  const { position, getLocation } = useCurrentLocation();
  const { data: branches } = useNearbyStations(position, { radiusMeters: 15_000 });

  useEffect(() => {
    getLocation();
  }, [getLocation]);

  return (
    <>
      <AppTopBar />
      <section className="w-full flex flex-col gap-md p-md">
        <div>
          <p className="text-sm text-muted-foreground">خوش آمدید</p>
          <h1 className="text-lg font-semibold">{user?.name ?? 'کاربر شارژ من'}</h1>
        </div>

        {/* Primary CTA — the whole point of this screen. Everything else
            here is a shortcut; scanning is the thing people open the app to
            do. */}
        <Link href="/scan">
          <Button size="lg" className="w-full gap-2 h-14 text-base">
            <QrCode className="size-5" />
            اسکن برای شروع شارژ
          </Button>
        </Link>

        <Link
          href="/wallet"
          className="flex items-center justify-between rounded-xl bg-primary text-primary-foreground p-md"
        >
          <div className="flex items-center gap-2">
            <Wallet2 className="size-5" />
            <span className="text-sm">موجودی کیف پول</span>
          </div>
          <span className="font-bold">
            {wallet ? convertToPersianDigits(wallet.balance.toLocaleString('en-US')) : '—'} تومان
          </span>
        </Link>

        <div className="flex flex-col gap-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">ایستگاه‌های نزدیک</h2>
            <Link href="/map" className="text-xs text-primary flex items-center gap-1">
              نمایش نقشه
              <MapPin className="size-3" />
            </Link>
          </div>

          {!position && (
            <p className="text-xs text-muted-foreground">
              برای دیدن ایستگاه‌های نزدیک، دسترسی به موقعیت مکانی را فعال کنید.
            </p>
          )}

          {branches.slice(0, 3).map((b) => (
            <Link
              key={b.id}
              href={`/map/${b.id}`}
              className="flex items-center justify-between rounded-lg border border-border-primary p-sm"
            >
              <div>
                <p className="text-sm font-medium">{b.name}</p>
                <p className="text-xs text-muted-foreground">{b.address}</p>
              </div>
              <span className={`size-2.5 rounded-full ${STATUS_DOT[b.status]}`} />
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
