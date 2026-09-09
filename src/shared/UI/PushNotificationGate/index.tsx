'use client';

import { useUser } from '@/context/UserContext'; // adjust to your actual export shape
import { usePushSubscription } from '@/shared/hooks/usePushSubscription';
import { PromptBanner } from '@/shared/UI/PromptBanner';
import { useState } from 'react';

export function PushNotificationGate() {
  const { user } = useUser();
  const userId = user?.id ? String(user.id) : null;
  const { status, subscribe } = usePushSubscription(userId);
  const [dismissed, setDismissed] = useState(false);

  if (status === 'unsupported' || status === 'loading' || dismissed) return null;

  if (status === 'denied') {
    return (
      <PromptBanner onDismiss={() => setDismissed(true)}>
        برای دریافت اطلاع‌رسانی، دسترسی نوتیفیکیشن را در تنظیمات مرورگر فعال کنید.
      </PromptBanner>
    );
  }

  if (status === 'subscribed') {
    // Already subscribed — no ongoing banner needed; expose the toggle from
    // a settings page instead of a persistent fixed element. Return null
    // here rather than nagging the user every visit.
    return null;
  }

  return (
    <PromptBanner onDismiss={() => setDismissed(true)}>
      <div className="flex items-center justify-between gap-sm">
        <span>با فعال‌سازی اعلان‌ها از وضعیت شارژ باخبر شوید</span>
        <button className="btn btn-sm btn-primary" onClick={subscribe}>
          فعال‌سازی
        </button>
      </div>
    </PromptBanner>
  );
}
