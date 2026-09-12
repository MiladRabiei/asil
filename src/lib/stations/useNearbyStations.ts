'use client';

import { useEffect, useRef, useState } from 'react';
import { distanceMeters } from './distance';
import { useNearbyStationsQuery } from '@/shared/_service/hook.query';
import type { IMapPosition } from '@/shared/_service/interface.map';
import { useNetworkStatus } from '@/lib/network/useNetworkStatus';

const DEFAULT_MOVEMENT_THRESHOLD_METERS = 3_000;

export function useNearbyStations(
  position: IMapPosition | null,
  options: {
    radiusMeters?: number;
    movementThresholdMeters?: number;
    enabled?: boolean;
  } = {}
) {
  const movementThresholdMeters =
    options.movementThresholdMeters ?? DEFAULT_MOVEMENT_THRESHOLD_METERS;
  const [anchorPosition, setAnchorPosition] = useState<IMapPosition | null>(position);
  const lastAnchorRef = useRef<IMapPosition | null>(position);

  useEffect(() => {
    if (!position) {
      lastAnchorRef.current = null;
      setAnchorPosition(null);
      return;
    }

    const lastAnchor = lastAnchorRef.current;
    if (!lastAnchor || distanceMeters(lastAnchor, position) >= movementThresholdMeters) {
      lastAnchorRef.current = position;
      setAnchorPosition(position);
    }
  }, [position, movementThresholdMeters]);

  const query = useNearbyStationsQuery(anchorPosition, {
    radiusMeters: options.radiusMeters,
    enabled: options.enabled,
  });
  const { isOnline } = useNetworkStatus();

  return {
    ...query,
    data: query.data ?? [],
    loading: query.isLoading,
    offline: !isOnline,
    lastUpdatedAt: query.dataUpdatedAt || null,
  };
}
