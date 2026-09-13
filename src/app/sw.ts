/// <reference lib="esnext" />
/// <reference lib="webworker" />

import type { PushNotificationPayload } from '@/shared/_service/interface.push';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { CacheFirst, NetworkFirst, Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  // PWA_ARCHITECTURE.md documents "/ and /auth are explicitly precached as
  // the application entry shells" — they weren't actually in this list
  // before (only the auto-generated build manifest was), and both routes
  // sit behind 'use client' + auth context, which often forces dynamic
  // rendering and can leave them out of that auto-generated list entirely.
  // Adding them here directly guarantees the doc's claim is actually true —
  // bare strings are valid precache entries (Serwist treats them as
  // no-revision URLs), no extra config shape needed.
  // `/`, `/auth`, and `/offline.html` are already precached with proper
  // revision hashes via `additionalPrecacheEntries` in
  // src/app/serwist/[path]/route.ts (createSerwistRoute merges those into
  // self.__SW_MANIFEST at build time, before this file ever runs). Adding
  // '/' and '/auth' again here as bare strings only creates duplicate
  // precache entries — one with a real revision, one without — for
  // something already handled correctly. Removed.
  precacheEntries: self.__SW_MANIFEST,
  // false (the default) is deliberate, not an oversight: it makes Serwist
  // register its own `message` listener for `{ type: 'SKIP_WAITING' }`
  // instead of calling self.skipWaiting() unconditionally at install.
  // `skipWaiting: true` here would activate every new deploy immediately —
  // on every open tab, mid-charging-session or mid-wallet-mutation, with no
  // way to defer it. ServiceWorkerUpdate (client side) decides *when* it's
  // safe to send that message.
  skipWaiting: false,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Navigation can be served from the last successful HTML response when
    // the network is unavailable. API/RSC/data requests are not cached here.
    {
      matcher: ({ request, sameOrigin }) => sameOrigin && request.mode === 'navigate',
      handler: new NetworkFirst({ cacheName: 'asil-pages' }),
    },
    // Only static public assets are runtime-cached. Station discovery data
    // remains application-owned IndexedDB/React Query data.
    {
      matcher: ({ request, sameOrigin, url }) =>
        sameOrigin &&
        request.method === 'GET' &&
        (url.pathname.startsWith('/icons/') || url.pathname.startsWith('/splash/')),
      handler: new CacheFirst({ cacheName: 'asil-static' }),
    },
  ],
  fallbacks: {
    entries: [
      {
        url: '/offline.html',
        matcher: ({ request }) => request.destination === 'document',
      },
    ],
  },
});

// Product-specific push behavior stays custom; Serwist owns SW lifecycle,
// precaching, routing and cache cleanup around it.
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload: PushNotificationPayload;
  try {
    payload = event.data.json();
  } catch {
    return;
  }

  const content = resolveNotificationContent(payload);

  event.waitUntil(
    self.registration.showNotification(content.title || 'اعلان', {
      body: content.body || '',
      icon: content.icon || '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url: content.url },
      actions: content.actions,
    } as NotificationOptions & { actions?: { action: string; title: string; icon?: string }[] })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });
      const existing = clients.find((client) => client.url === target);
      if (existing) return existing.focus();
      return self.clients.openWindow(target);
    })()
  );
});

function resolveNotificationContent(payload: PushNotificationPayload): {
  title?: string;
  body?: string;
  url?: string;
  icon?: string;
  actions?: { action: string; title: string; icon?: string }[];
} {
  // Every case passes through the backend's own url/icon/actions verbatim —
  // this worker never reconstructs a URL from an id field, matching what
  // the backend actually sends. Cases only differ in which fallback
  // title/body text applies when the backend omits them.
  const fallback = (() => {
    switch (payload.type) {
      case 'branch_offline':
        return { title: 'وضعیت ایستگاه', body: 'این ایستگاه در حال حاضر خارج از سرویس است.' };
      case 'branch_available':
        return {
          title: 'ایستگاه آماده شارژ است',
          body: 'ایستگاه موردنظر شما اکنون آماده استفاده است.',
        };
      case 'charging_session':
        return { title: 'وضعیت شارژ', body: 'وضعیت جلسه شارژ شما تغییر کرده است.' };
      case 'wallet':
        return { title: 'کیف پول', body: 'وضعیت کیف پول شما تغییر کرده است.' };
      case 'promo':
        return { title: 'اطلاع‌رسانی', body: '' };
      default:
        return { title: 'Asil', body: '' };
    }
  })();

  return {
    title: payload.title || fallback.title,
    body: payload.body || fallback.body,
    url: payload.url || '/',
    icon: payload.icon,
    actions: payload.actions,
  };
}

serwist.addEventListeners();
