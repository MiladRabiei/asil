'use client';

import { useSerwist } from '@serwist/turbopack/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

export function ServiceWorkerUpdate() {
  const { serwist } = useSerwist();
  const queryClient = useQueryClient();

  const hadController = useRef(false);
  const updatePending = useRef(false);

  useEffect(() => {
    if (!serwist) return;

    hadController.current = Boolean(navigator.serviceWorker.controller);

    const activateWaitingWorker = () => {
      if (!updatePending.current) return;
      if (queryClient.isMutating() > 0) return;

      updatePending.current = false;
      serwist.messageSkipWaiting();
    };

    const handleWaiting = () => {
      updatePending.current = true;
      activateWaitingWorker();
    };

    const handleControlling = () => {
      if (hadController.current) {
        window.location.reload();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        activateWaitingWorker();
      }
    };

    const handleOnline = () => {
      activateWaitingWorker();
    };

    const unsubscribeMutationCache = queryClient.getMutationCache().subscribe(() => {
      activateWaitingWorker();
    });

    serwist.addEventListener('waiting', handleWaiting);
    serwist.addEventListener('controlling', handleControlling);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      serwist.removeEventListener('waiting', handleWaiting);
      serwist.removeEventListener('controlling', handleControlling);

      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);

      unsubscribeMutationCache();
    };
  }, [serwist, queryClient]);

  return null;
}
