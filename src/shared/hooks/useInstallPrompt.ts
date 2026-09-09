'use client';

import { detectPlatform, isStandalone } from '@/lib/pwaInstall/detect';
import type {
  IBeforeInstallPromptEvent,
  IInstallPlatformType,
} from '@/shared/_service/interface.schema';
import { useCallback, useEffect, useState } from 'react';

type PromptStatus = 'idle' | 'available' | 'prompting' | 'accepted' | 'dismissed' | 'installed';

export function useInstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<IBeforeInstallPromptEvent | null>(null);
  const [status, setStatus] = useState<PromptStatus>('idle');
  const [platform, setPlatform] = useState<IInstallPlatformType>('unknown');

  useEffect(() => {
    setPlatform(detectPlatform());
    if (isStandalone()) {
      setStatus('installed');
      return;
    }

    function onBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setDeferredEvent(event as IBeforeInstallPromptEvent);
      setStatus('available');
    }
    function onAppInstalled() {
      setStatus('installed');
      setDeferredEvent(null);
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredEvent) return;
    setStatus('prompting');
    await deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;
    setStatus(outcome === 'accepted' ? 'accepted' : 'dismissed');
    setDeferredEvent(null);
  }, [deferredEvent]);

  return { status, platform, promptInstall };
}
