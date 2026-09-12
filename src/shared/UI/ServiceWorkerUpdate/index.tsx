'use client';

import { useEffect } from 'react';

/** Automatically activates and applies a newly deployed service worker. */
export function ServiceWorkerUpdate() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const hadController = Boolean(navigator.serviceWorker.controller);
    let disposed = false;

    const activateWaitingWorker = (worker: ServiceWorker | null | undefined) => {
      if (disposed || !worker || !navigator.serviceWorker.controller) return;
      worker.postMessage({ type: 'SKIP_WAITING' });
    };

    const watchInstallingWorker = (worker: ServiceWorker | null) => {
      if (!worker) return;

      const onStateChange = () => {
        if (worker.state === 'installed') {
          activateWaitingWorker(worker);
        }
      };

      worker.addEventListener('statechange', onStateChange);
      if (worker.state === 'installed') onStateChange();
    };

    const onControllerChange = () => {
      if (!disposed && hadController) window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const update = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        if (disposed) return;

        // An update may already have finished installing while this tab was
        // hidden/backgrounded. Apply that waiting worker immediately.
        activateWaitingWorker(registration.waiting);

        // For an update currently being downloaded, wait for it to reach
        // `installed`, then explicitly move it from waiting -> active.
        watchInstallingWorker(registration.installing);

        await registration.update();
        if (disposed) return;

        // `update()` can discover an already-installed waiting worker, so
        // check once more after the update attempt completes.
        activateWaitingWorker(registration.waiting);
        watchInstallingWorker(registration.installing);
      } catch {
        // Service Worker updates are best-effort; app startup must not depend on them.
      }
    };

    void update();
    window.addEventListener('online', update);
    document.addEventListener('visibilitychange', update);

    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      window.removeEventListener('online', update);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return null;
}
