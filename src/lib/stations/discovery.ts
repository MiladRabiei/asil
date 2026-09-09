import { createHttpNearbyStationDiscovery, type NearbyStationDiscovery } from './nearby';
import { createHttpViewportStationDiscovery, type ViewportStationDiscovery } from './viewport';
import { createMockNearbyStationDiscovery, createMockViewportStationDiscovery } from './mock';
import type { IChargingBranch } from '@/shared/_service/interface.ev';
import { runtimeConfig } from '@/config/runtime.config';

// STUB — same USE_MOCK pattern used across src/shared/_service. Flip to
// `false` once NEXT_PUBLIC_*_STATIONS_ENDPOINT point at a real backend; both
// createBranchNearbyDiscovery/createBranchViewportDiscovery keep working —
// callers never construct a discovery adapter directly.
const USE_MOCK_EV_DATA = runtimeConfig.useMockEvData;

export function createBranchNearbyDiscovery(): NearbyStationDiscovery<IChargingBranch> {
  const endpoint = process.env.NEXT_PUBLIC_NEARBY_STATIONS_ENDPOINT;
  if (!USE_MOCK_EV_DATA && endpoint) return createHttpNearbyStationDiscovery({ endpoint });
  return createMockNearbyStationDiscovery();
}

export function createBranchViewportDiscovery(): ViewportStationDiscovery<IChargingBranch> {
  const endpoint = process.env.NEXT_PUBLIC_STATIONS_IN_BOUNDS_ENDPOINT;
  if (!USE_MOCK_EV_DATA && endpoint) return createHttpViewportStationDiscovery({ endpoint });
  return createMockViewportStationDiscovery();
}
