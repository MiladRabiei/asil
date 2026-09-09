'use client';

import { useEffect, useState } from 'react';

/**
 * Keeps update UX outside the service worker itself — sw.js is only
 * responsible for caching; this component is responsible for asking the
 * user before activating a waiting worker (so an update never yanks state
 * out from under someone mid-session).
 */
export function ServiceWorkerUpdate() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let disposed = false;
    let registration: ServiceWorkerRegistration | null = null;
    let onlineHandler: (() => void) | null = null;

    const setup = async () => {
      registration = await navigator.serviceWorker.ready;
      if (disposed || !registration) return;

      const inspect = () => {
        if (registration?.waiting) setWaiting(registration.waiting);
      };

      const onUpdateFound = () => {
        const worker = registration?.installing;
        if (!worker) return;
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) inspect();
        });
      };

      registration.addEventListener('updatefound', onUpdateFound);
      inspect();
      onlineHandler = () => void registration?.update().catch(() => undefined);
      window.addEventListener('online', onlineHandler);

      return () => {
        registration?.removeEventListener('updatefound', onUpdateFound);
        if (onlineHandler) window.removeEventListener('online', onlineHandler);
      };
    };

    let cleanup: (() => void) | undefined;
    void setup().then((fn) => {
      cleanup = fn;
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  if (!waiting) return null;

  const apply = () => {
    waiting.postMessage({ type: 'SKIP_WAITING' });
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
      once: true,
    });
  };

  return (
    <div className="fixed inset-x-4 bottom-[calc(1rem+var(--safe-bottom,0px))] z-[70] mx-auto flex max-w-md items-center justify-between gap-3 rounded-xl border bg-background p-4 shadow-lg">
      <p className="text-sm">نسخه جدید برنامه آماده است.</p>
      <button
        type="button"
        onClick={apply}
        className="rounded-lg bg-foreground px-4 py-2 text-background"
      >
        به‌روزرسانی
      </button>
    </div>
  );
}
