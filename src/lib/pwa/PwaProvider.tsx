'use client';

import { NetworkStatusBanner } from '@/shared/UI/NetworkStatusBanner';
import { ServiceWorkerUpdate } from '@/shared/UI/ServiceWorkerUpdate';
import { SerwistProvider } from '@serwist/turbopack/react';
import { usePwaLifecycle } from './lifecycle';
import { useViewportKeyboard } from './useViewportKeyboard';

/**
 * App-wide PWA composition point. Serwist owns service-worker registration,
 * precaching and cache lifecycle (see src/app/sw.ts and
 * src/app/serwist/[path]/route.ts); this component only supplies the app's
 * update policy via ServiceWorkerUpdate, plus foreground refetching and
 * keyboard-inset tracking.
 *
 * - cacheOnNavigation is off: Serwist's default patches history.pushState to
 *   proactively cache every client-side-navigated-to page. For an app with
 *   many dynamic branch-detail pages, that would start caching all of them
 *   with none of the size/age pruning discipline stationCache.ts already
 *   applies deliberately to that same data — better to leave this off and
 *   let the runtime-caching rules in sw.ts handle it explicitly.
 * - reloadOnOnline is off: that option reloads the page on *any* network
 *   reconnect, unrelated to app updates — ServiceWorkerUpdate already
 *   reloads once, specifically when a new worker actually takes control.
 *
 * InstallPrompt and PushNotificationGate are mounted separately in
 * app/layout.tsx since they need UserContext, which sits inside this
 * provider's children in the tree, not above it.
 */
export function PwaProvider({ children }: { children: React.ReactNode }) {
  usePwaLifecycle();
  useViewportKeyboard();

  return (
    <SerwistProvider swUrl="/serwist/sw.js" cacheOnNavigation={false} reloadOnOnline={false}>
      {children}
      <NetworkStatusBanner />
      <ServiceWorkerUpdate />
    </SerwistProvider>
  );
}
