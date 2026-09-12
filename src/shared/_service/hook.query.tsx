'use client';

import { runtimeConfig } from '@/config/runtime.config';
import api from '@/lib/axiosInstance';
import {
  fetchNearbyStationsWithCache,
  fetchViewportStationsWithCache,
} from '@/lib/stations/cachedDiscovery';
import {
  createBranchNearbyDiscovery,
  createBranchViewportDiscovery,
} from '@/lib/stations/discovery';
import { viewportCacheKey } from '@/lib/stations/viewport';
import { useQuery } from '@tanstack/react-query';
import type { IChargingBranch, IWallet } from './interface.ev';
import type { IMapPosition, IViewportStationQuery } from './interface.map';
import type { IUser } from './interface.schema';
import { fetchMockCurrentUser } from './mock.currentUser';
import { fetchMockBranch, fetchMockWallet } from './mock.ev';
import { BRANCH_DETAIL_ROUTE, ME_ROUTE, WALLET_BALANCE_ROUTE } from './route.api';

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

// STUB — flip NEXT_PUBLIC_USE_MOCK_EV_DATA=false once the EV endpoints are
// confirmed and live. The domain-specific station discovery hooks below own
// map station fetching and caching separately.
const USE_MOCK_EV_DATA = runtimeConfig.useMockEvData;

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

/**
 * GET query definitions only.
 *
 * State, effects, GPS movement thresholds, browser connectivity state and
 * cache fallback orchestration live in src/lib/stations. Keeping this layer
 * declarative makes the GET hooks predictable and leaves the map domain hook
 * responsible for UI-facing behavior.
 */
const STATION_CACHE_STALE_TIME = 5 * 60 * 1000;
const DEFAULT_NEARBY_RADIUS_METERS = 10_000;
const nearbyDiscovery = createBranchNearbyDiscovery();
const viewportDiscovery = createBranchViewportDiscovery();

export function useNearbyStationsQuery(
  position: IMapPosition | null,
  options: { radiusMeters?: number; enabled?: boolean } = {}
) {
  const radiusMeters = options.radiusMeters ?? DEFAULT_NEARBY_RADIUS_METERS;
  return useQuery<IChargingBranch[]>({
    queryKey: [
      'ev-branches-nearby',
      position ? `${position.lat.toFixed(3)}:${position.lng.toFixed(3)}` : null,
      radiusMeters,
    ],
    enabled: options.enabled !== false && Boolean(position),
    staleTime: STATION_CACHE_STALE_TIME,
    retry: false,
    networkMode: 'always',
    queryFn: ({ signal }) => {
      if (!position) return Promise.resolve([]);
      return fetchNearbyStationsWithCache({
        discovery: nearbyDiscovery,
        position,
        radiusMeters,
        signal,
      });
    },
  });
}

export function useViewportStationsQuery(
  viewport: IViewportStationQuery | null,
  options: { enabled?: boolean; staleAfterMs?: number } = {}
) {
  const staleAfterMs = options.staleAfterMs ?? STATION_CACHE_STALE_TIME;
  const key = viewport ? viewportCacheKey(viewport, viewport.zoom) : null;
  return useQuery<IChargingBranch[]>({
    queryKey: ['ev-branches-viewport', key],
    enabled: options.enabled !== false && Boolean(viewport && key),
    staleTime: staleAfterMs,
    retry: false,
    networkMode: 'always',
    queryFn: ({ signal }) => {
      if (!viewport || !key) return Promise.resolve([]);
      return fetchViewportStationsWithCache({
        discovery: viewportDiscovery,
        viewport,
        cacheKey: key,
        signal,
      });
    },
  });
}
