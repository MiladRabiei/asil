'use client';

import { useInstallPrompt } from '@/shared/hooks/useInstallPrompt';
import { PromptBanner } from '@/shared/UI/PromptBanner';
import { useState } from 'react';

export function InstallPrompt() {
  const { status, platform, promptInstall } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  if (status === 'installed' || dismissed) return null;

  if (platform === 'ios') {
    return (
      <PromptBanner onDismiss={() => setDismissed(true)}>
        برای نصب: روی آیکون Share ضربه بزنید، سپس «Add to Home Screen» را انتخاب کنید.
      </PromptBanner>
    );
  }

  if (status === 'available') {
    return (
      <PromptBanner onDismiss={() => setDismissed(true)}>
        <div className="flex items-center justify-between gap-sm">
          <span>نصب اپلیکیشن برای دسترسی سریع‌تر</span>
          <button className="btn btn-sm btn-primary" onClick={promptInstall}>
            نصب
          </button>
        </div>
      </PromptBanner>
    );
  }

  return null;
}
