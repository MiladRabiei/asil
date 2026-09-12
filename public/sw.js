// Bump this on every deploy that changes cached assets — old caches are
// cleaned up automatically in the 'activate' handler below.
const CACHE_VERSION = 'Njp6QCbNKN5vmdg8aPVCE';
const SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `app-runtime-${CACHE_VERSION}`;

// Keep this list small and static — just enough that a user with a flaky
// connection (or fully offline) can still open the app and see something
// other than a browser error.
const SHELL_URLS = [
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png',
  '/icons/badge-72.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await Promise.all(SHELL_URLS.map((url) => cache.add(url).catch(() => undefined)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              (key.startsWith('app-shell-') || key.startsWith('app-runtime-')) &&
              ![SHELL_CACHE, RUNTIME_CACHE].includes(key)
          )
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// Lets the page automatically activate an already-waiting SW.
// ServiceWorkerUpdate sends this message after a new worker is installed.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    return (await caches.match(request)) || caches.match('/offline.html');
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone()).catch(() => undefined);
    }
    return response;
  } catch {
    return caches.match('/offline.html');
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Application/API data is deliberately never cached here — React Query
  // (+ IndexedDB for station discovery, see src/lib/offline) owns that.
  // Caching /api/* at the SW layer would risk masking a stale response
  // behind a request that looks successful.
  if (url.pathname.startsWith('/api/')) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (
    url.pathname.startsWith('/_next/static/') ||
    /\.(?:js|css|png|jpg|jpeg|svg|webp|woff2?|ico)$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request));
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;
  const payload = event.data.json();
  const { title, body, icon, url, actions } = resolveNotificationContent(payload);

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: { url },
      actions, // e.g. [{ action: 'view', title: 'مشاهده' }] — safe to omit
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    (async () => {
      // Focus an existing tab on the right URL instead of always opening a
      // new one — matters once users start getting multiple notifications.
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = allClients.find((c) => c.url.includes(url));
      if (existing) return existing.focus();
      return self.clients.openWindow(url);
    })()
  );
});

// Mirrors the push payload union in interface.push.ts / sw.js's own domain
// notion of notification types — keep in sync manually, this file can't
// import TS types directly.
//
// To add a new notification type in the future: add a case here AND on the
// TS side, nothing else in this file needs to change.
function resolveNotificationContent(payload) {
  switch (payload.type) {
    case 'branch_offline':
      // A charging branch the user follows went out of service.
      return { title: payload.title, body: payload.body, url: `/map/${payload.branchId}` };
    case 'branch_available':
      // A previously-full/offline branch now has a free charging slot.
      return { title: payload.title, body: payload.body, url: `/map/${payload.branchId}` };
    case 'charging_session':
      // Session started/finished/failed at a charging device.
      return {
        title: payload.title,
        body: payload.body,
        url: `/wallet/sessions/${payload.sessionId}`,
      };
    case 'wallet':
      // Top-up confirmed, balance low, etc.
      return { title: payload.title, body: payload.body, url: '/wallet' };
    case 'promo':
      return { title: payload.title, body: payload.body, url: payload.url };
    default:
      return { title: payload.title || 'اعلان', body: payload.body || '', url: '/' };
  }
}
