'use client';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Refetches active queries whenever the PWA comes back to the foreground —
// covers both "switched app then back" (visibilitychange) and iOS Safari's
// bfcache restore (pageshow), which visibilitychange alone misses.
export function usePwaLifecycle() {
  const queryClient = useQueryClient();
  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === 'visible') void queryClient.refetchQueries({ type: 'active' });
    };
    window.addEventListener('pageshow', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.removeEventListener('pageshow', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [queryClient]);
}
