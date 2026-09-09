'use client';

import { useEffect } from 'react';
import { usePwaLifecycle } from './lifecycle';
import { useViewportKeyboard } from './useViewportKeyboard';
import { NetworkStatusBanner } from '@/shared/UI/NetworkStatusBanner';
import { ServiceWorkerUpdate } from '@/shared/UI/ServiceWorkerUpdate';

/**
 * App-wide PWA composition point: registers the service worker unconditionally
 * on mount (offline shell caching and update detection shouldn't depend on
 * the user opting into push notifications — see PushNotificationGate, which
 * registers it again defensively but only when the user subscribes),
 * refetches active queries on foreground, and tracks the keyboard inset.
 *
 * InstallPrompt and PushNotificationGate are mounted separately in
 * app/layout.tsx since they need UserContext, which sits inside this
 * provider's children in the tree, not above it.
 */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  usePwaLifecycle();
  useViewportKeyboard();

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' }).catch(() => {
      // Service Worker is an enhancement; app startup must not depend on it.
    });
  }, []);

  return (
    <>
      {children}
      <NetworkStatusBanner />
      <ServiceWorkerUpdate />
    </>
  );
}
