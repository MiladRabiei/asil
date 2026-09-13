'use client';

import { useSerwist } from '@serwist/turbopack/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

/**
 * Serwist owns SW installation, precaching, routing and cache cleanup.
 * This component owns Asil's activation *policy*: never let a new worker
 * take over while a mutation is in flight (wallet top-up, charging
 * actions, etc.) — sw.ts sets `skipWaiting: false` specifically so nothing
 * activates until this component explicitly says so via
 * `serwist.messageSkipWaiting()`.
 *
 * Flow:
 * active v1 → v2 installs → 'waiting' fires → (deferred if mutating) →
 * messageSkipWaiting() → v2 activates → clientsClaim → 'controlling' →
 * reload once (only if a worker was already controlling before — i.e. a
 * genuine update, not the very first install).
 */
export function ServiceWorkerUpdate() {
  const { serwist } = useSerwist();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!serwist) return;

    const hadController = Boolean(navigator.serviceWorker.controller);
    let pendingSkip = false;

    const trySkipWaiting = () => {
      if (queryClient.isMutating() > 0) return;
      serwist.messageSkipWaiting();
      pendingSkip = false;
    };

    const onWaiting = () => {
      pendingSkip = true;
      trySkipWaiting();
    };

    const onControlling = () => {
      if (hadController) window.location.reload();
    };

    serwist.addEventListener('waiting', onWaiting);
    serwist.addEventListener('controlling', onControlling);

    const update = () => void serwist.update().catch(() => undefined);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Returning to the foreground is also a good moment to check for
        // an update we might have missed while backgrounded.
        void update();
      } else if (pendingSkip) {
        // Backgrounded with an update already waiting — safe to apply now
        // even if we couldn't earlier.
        trySkipWaiting();
      }
    };

    void update();
    window.addEventListener('online', update);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      serwist.removeEventListener('waiting', onWaiting);
      serwist.removeEventListener('controlling', onControlling);
      window.removeEventListener('online', update);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [serwist, queryClient]);

  return null;
}
