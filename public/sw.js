const CACHE_VERSION = 'Njp6QCbNKN5vmdg8aPVCE';

const SHELL_CACHE = `app-shell-${CACHE_VERSION}`;
const RUNTIME_CACHE = `app-runtime-${CACHE_VERSION}`;

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

      // Automatically activate the new worker.
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

      // Take control of existing pages immediately.
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
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
    return (await caches.match(request)) || (await caches.match('/offline.html'));
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

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

  // Only handle same-origin requests.
  if (url.origin !== self.location.origin) return;

  // Never cache backend/API responses.
  if (url.pathname.startsWith('/api/')) return;

  // HTML/navigation:
  // always prefer the network so deployed versions become visible quickly.
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request));
    return;
  }

  // Only cache predictable static application assets.
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/splash/')
  ) {
    event.respondWith(cacheFirst(request));
  }
});

/* -------------------------------------------------------------------------- */
/* Push notifications                                                         */
/* -------------------------------------------------------------------------- */

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const payload = event.data.json();

  const { title, body, icon, url, actions } = resolveNotificationContent(payload);

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icons/icon-192.png',
      badge: '/icons/badge-72.png',
      data: {
        url,
      },
      actions,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      const existing = allClients.find((client) => client.url.includes(url));

      if (existing) {
        return existing.focus();
      }

      return self.clients.openWindow(url);
    })()
  );
});

/* -------------------------------------------------------------------------- */
/* Notification resolver                                                      */
/* -------------------------------------------------------------------------- */

function resolveNotificationContent(payload) {
  switch (payload?.type) {
    case 'branch_offline':
      return {
        title: payload.title || 'وضعیت ایستگاه',
        body: payload.body || 'این ایستگاه در حال حاضر خارج از سرویس است.',
        icon: payload.icon,
        url: payload.url || '/',
        actions: payload.actions || [],
      };

    case 'branch_available':
      return {
        title: payload.title || 'ایستگاه آماده شارژ است',
        body: payload.body || 'ایستگاه موردنظر شما اکنون آماده استفاده است.',
        icon: payload.icon,
        url: payload.url || '/',
        actions: payload.actions || [],
      };

    case 'charging_session':
      return {
        title: payload.title || 'وضعیت شارژ',
        body: payload.body || 'وضعیت جلسه شارژ شما تغییر کرده است.',
        icon: payload.icon,
        url: payload.url || '/',
        actions: payload.actions || [],
      };

    case 'wallet':
      return {
        title: payload.title || 'کیف پول',
        body: payload.body || 'وضعیت کیف پول شما تغییر کرده است.',
        icon: payload.icon,
        url: payload.url || '/',
        actions: payload.actions || [],
      };

    case 'promo':
      return {
        title: payload.title || 'اطلاع‌رسانی',
        body: payload.body || '',
        icon: payload.icon,
        url: payload.url || '/',
        actions: payload.actions || [],
      };

    default:
      return {
        title: payload?.title || 'Asil',
        body: payload?.body || '',
        icon: payload?.icon,
        url: payload?.url || '/',
        actions: payload?.actions || [],
      };
  }
}
