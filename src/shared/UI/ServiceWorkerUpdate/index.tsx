'use client';

import { useEffect } from 'react';

/**
 * Automatically detects and applies newly deployed service workers.
 *
 * Flow:
 * active v1
 *   ↓
 * v2 installs
 *   ↓
 * skipWaiting()
 *   ↓
 * v2 activates
 *   ↓
 * clients.claim()
 *   ↓
 * controllerchange
 *   ↓
 * controlled page reloads once
 */
export function ServiceWorkerUpdate() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const hadController = Boolean(navigator.serviceWorker.controller);

    let disposed = false;

    // Prevent attaching multiple statechange listeners to the same worker
    // when update() is triggered repeatedly.
    const watchedWorkers = new Set<ServiceWorker>();

    const activateWaitingWorker = (worker: ServiceWorker | null | undefined) => {
      if (disposed || !worker) return;

      // Do not force activation on the very first installation.
      // There is no existing controlled page to reload in that case.
      if (!navigator.serviceWorker.controller) return;

      worker.postMessage({ type: 'SKIP_WAITING' });
    };

    const watchInstallingWorker = (worker: ServiceWorker | null) => {
      if (!worker || watchedWorkers.has(worker)) return;

      watchedWorkers.add(worker);

      const onStateChange = () => {
        if (disposed) return;

        if (worker.state === 'installed') {
          activateWaitingWorker(worker);
        }
      };

      worker.addEventListener('statechange', onStateChange);

      // Worker may already have reached "installed" before
      // the listener was attached.
      if (worker.state === 'installed') {
        onStateChange();
      }
    };

    const onControllerChange = () => {
      if (disposed || !hadController) return;

      // New service worker has taken control.
      // Reload exactly once so the page uses the new application assets.
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

    const update = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;

        if (disposed) return;

        activateWaitingWorker(registration.waiting);
        watchInstallingWorker(registration.installing);

        await registration.update();

        if (disposed) return;

        activateWaitingWorker(registration.waiting);
        watchInstallingWorker(registration.installing);
      } catch {
        // Service-worker updates are best effort.
        // Application startup must never depend on update() succeeding.
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
