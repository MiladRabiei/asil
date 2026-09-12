'use client';

import { useViewportStationsQuery } from '@/shared/_service/hook.query';
import type { IMapBounds } from '@/shared/_service/interface.map';
import { useNetworkStatus } from '@/lib/network/useNetworkStatus';

export function useViewportStations(
  viewport: IMapBounds | null,
  options: { enabled?: boolean; staleAfterMs?: number } = {}
) {
  const query = useViewportStationsQuery(viewport, options);
  const { isOnline } = useNetworkStatus();

  return {
    ...query,
    data: query.data ?? [],
    loading: query.isLoading,
    offline: !isOnline,
    lastUpdatedAt: query.dataUpdatedAt || null,
  };
}
