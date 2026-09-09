'use client';

import api from '@/lib/axiosInstance';
import { readStationCache, writeStationCache } from '@/lib/offline';
import { createBranchNearbyDiscovery, createBranchViewportDiscovery } from '@/lib/stations';
import { distanceMeters } from '@/lib/stations/distance';
import { viewportCacheKey } from '@/lib/stations/viewport';
import { useQuery } from '@tanstack/react-query';
import { runtimeConfig } from '@/config/runtime.config';
import type { IChargingBranch, IWallet } from './interface.ev';
import type { IMapPosition, IViewportStationQuery } from './interface.map';
import type { IUser } from './interface.schema';
import { fetchMockCurrentUser } from './mock.currentUser';
import { fetchMockBranch, fetchMockBranches, fetchMockWallet } from './mock.ev';
import { BRANCH_DETAIL_ROUTE, BRANCHES_LIST_ROUTE, ME_ROUTE, WALLET_BALANCE_ROUTE } from './route.api';
import { useEffect, useMemo, useState } from 'react';

// STUB — flip NEXT_PUBLIC_USE_MOCK_USER=false once ME_ROUTE is confirmed and
// live. Everything downstream (useUser, UserProvider, sidebar/dashboard role
// checks) reads through this hook, so this is the only line that changes.
const USE_MOCK_USER = runtimeConfig.useMockUser;

export const useGetCurrentUser = (enabled: boolean = true) => {
  return useQuery<IUser>({
    queryKey: ['current-user'],
    queryFn: USE_MOCK_USER ? fetchMockCurrentUser : api.get<IUser>(ME_ROUTE),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
};

// STUB — same pattern as useGetCurrentUser above. Flip
// NEXT_PUBLIC_USE_MOCK_EV_DATA=false and these three hooks talk to the real
// APP_EV routes (route.api.ts) with no change needed at any call site.
const USE_MOCK_EV_DATA = runtimeConfig.useMockEvData;

export const useGetBranches = () => {
  return useQuery<IChargingBranch[]>({
    queryKey: ['ev-branches'],
    queryFn: USE_MOCK_EV_DATA ? fetchMockBranches : api.get<IChargingBranch[]>(BRANCHES_LIST_ROUTE),
    staleTime: 60 * 1000,
  });
};

export const useGetBranch = (branchId: string) => {
  return useQuery<IChargingBranch | undefined>({
    queryKey: ['ev-branch', branchId],
    queryFn: USE_MOCK_EV_DATA
      ? () => fetchMockBranch(branchId)
      : api.get<IChargingBranch>(BRANCH_DETAIL_ROUTE(branchId)),
    enabled: Boolean(branchId),
    staleTime: 30 * 1000,
  });
};

export const useGetWallet = () => {
  return useQuery<IWallet>({
    queryKey: ['ev-wallet'],
    queryFn: USE_MOCK_EV_DATA ? fetchMockWallet : api.get<IWallet>(WALLET_BALANCE_ROUTE),
    staleTime: 30 * 1000,
  });
};

export interface StationQueryState<TStation> {
  data: TStation[];
  loading: boolean;
  error: string | null;
  offline: boolean;
  lastUpdatedAt: number | null;
}

const STATION_CACHE_STALE_TIME = 5 * 60 * 1000;
const DEFAULT_NEARBY_RADIUS_METERS = 10_000;
const DEFAULT_MOVEMENT_THRESHOLD_METERS = 3_000;

function isOffline(): boolean {
  return typeof navigator !== 'undefined' && !navigator.onLine;
}

function errorMessage(error: unknown): string | null {
  return error instanceof Error && error.message !== 'OFFLINE' ? error.message : null;
}

/**
 * Station discovery deliberately lives in the shared service query layer,
 * following the project's hook.query convention. React Query owns request
 * lifecycle, deduplication, retries and in-memory cache; IndexedDB remains
 * the persistence layer because station data must survive reloads/offline use.
 *
 * Nearby has one additional domain rule: GPS jitter must not create a request.
 * The anchor position changes only after the device moves by the configured
 * threshold. This is why this is a query hook rather than a plain useQuery at
 * the call site.
 */
export function useNearbyStations(
  position: IMapPosition | null,
  options: {
    radiusMeters?: number;
    movementThresholdMeters?: number;
    enabled?: boolean;
  } = {}
): StationQueryState<IChargingBranch> {
  const radiusMeters = options.radiusMeters ?? DEFAULT_NEARBY_RADIUS_METERS;
  const movementThresholdMeters = options.movementThresholdMeters ?? DEFAULT_MOVEMENT_THRESHOLD_METERS;
  const [anchorPosition, setAnchorPosition] = useState<IMapPosition | null>(position);

  useEffect(() => {
    if (!position) {
      setAnchorPosition(null);
      return;
    }
    if (!anchorPosition || distanceMeters(anchorPosition, position) >= movementThresholdMeters) {
      setAnchorPosition(position);
    }
  }, [position, anchorPosition, movementThresholdMeters]);

  const discovery = useMemo(() => createBranchNearbyDiscovery(), []);
  const enabled = options.enabled !== false && Boolean(anchorPosition);
  const cacheKey = anchorPosition
    ? `nearby:${anchorPosition.lat.toFixed(3)}:${anchorPosition.lng.toFixed(3)}:${radiusMeters}`
    : null;

  const query = useQuery<IChargingBranch[]>({
    queryKey: ['ev-branches-nearby', anchorPosition, radiusMeters],
    enabled,
    staleTime: STATION_CACHE_STALE_TIME,
    retry: false,
    networkMode: 'always',
    queryFn: async ({ signal }) => {
      if (!anchorPosition || !cacheKey) return [];
      const cached = await readStationCache<IChargingBranch[]>(cacheKey);
      if (isOffline()) {
        if (cached) return cached.data;
        throw new Error('OFFLINE');
      }

      try {
        const data = await discovery.findNearby({
          ...anchorPosition,
          radiusMeters,
          signal,
        });
        await writeStationCache(cacheKey, data);
        return data;
      } catch (error) {
        if (signal.aborted) throw error;
        if (cached) return cached.data;
        throw error;
      }
    },
  });

  const offline = isOffline();
  return {
    ...query,
    data: query.data ?? [],
    loading: query.isLoading,
    error: errorMessage(query.error),
    offline,
    lastUpdatedAt: query.dataUpdatedAt || null,
  };
}

/**
 * Viewport station discovery follows the same service/query convention.
 * The query key is the quantized viewport cell, so small map movements are
 * deduplicated by React Query while IndexedDB provides persistence across
 * reloads and offline sessions. Backend response parsing remains isolated in
 * the discovery adapter until the real contract is confirmed.
 */
export function useViewportStations(
  viewport: IViewportStationQuery | null,
  options: { enabled?: boolean; staleAfterMs?: number } = {}
): StationQueryState<IChargingBranch> {
  const staleAfterMs = options.staleAfterMs ?? STATION_CACHE_STALE_TIME;
  const discovery = useMemo(() => createBranchViewportDiscovery(), []);
  const key = viewport ? viewportCacheKey(viewport, viewport.zoom) : null;
  const enabled = options.enabled !== false && Boolean(viewport && key);
  const cacheKey = key ? `viewport:${key}` : null;

  const query = useQuery<IChargingBranch[]>({
    queryKey: ['ev-branches-viewport', key],
    enabled,
    staleTime: staleAfterMs,
    retry: false,
    networkMode: 'always',
    queryFn: async ({ signal }) => {
      if (!viewport || !cacheKey) return [];
      const cached = await readStationCache<IChargingBranch[]>(cacheKey);
      if (isOffline()) {
        if (cached) return cached.data;
        throw new Error('OFFLINE');
      }

      try {
        const data = await discovery.findInBounds({
          ...viewport,
          signal,
        });
        await writeStationCache(cacheKey, data);
        return data;
      } catch (error) {
        if (signal.aborted) throw error;
        if (cached) return cached.data;
        throw error;
      }
    },
  });

  const offline = isOffline();
  return {
    ...query,
    data: query.data ?? [],
    loading: query.isLoading,
    error: errorMessage(query.error),
    offline,
    lastUpdatedAt: query.dataUpdatedAt || null,
  };
}
