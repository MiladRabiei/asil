'use client';

import { useNetworkStatus } from '@/lib/network';

export function NetworkStatusBanner() {
  const { isOnline } = useNetworkStatus();
  if (isOnline) return null;
  return (
    <div className="fixed inset-x-3 bottom-[calc(5rem+var(--safe-bottom,0px))] z-[70] mx-auto max-w-md rounded-xl border bg-background p-3 text-center text-sm shadow-lg">
      ارتباط اینترنت قطع است. اطلاعات ذخیره‌شده همچنان قابل مشاهده است.
    </div>
  );
}
