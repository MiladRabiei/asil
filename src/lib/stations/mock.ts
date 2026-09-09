import { MOCK_BRANCHES } from '@/shared/_service/mock.ev';
import type { IChargingBranch } from '@/shared/_service/interface.ev';
import type { IMapBounds, IMapPosition } from '@/shared/_service/interface.map';
import { distanceMeters } from './distance';
import type { NearbyStationDiscovery } from './nearby';
import type { ViewportStationDiscovery } from './viewport';

async function wait(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      window.clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    }, { once: true });
  });
}

function inBounds(position: IMapPosition, bounds: IMapBounds): boolean {
  return (
    position.lat <= bounds.north &&
    position.lat >= bounds.south &&
    position.lng <= bounds.east &&
    position.lng >= bounds.west
  );
}

// Mock discovery adapters — same contracts as the HTTP ones
// (createHttp*StationDiscovery), so the shared service query hooks don't
// know or care which adapter they got. This is what
// lets the map render real-looking data today instead of an empty screen
// until the real /stations/nearby and /stations/in-bounds endpoints exist.
export function createMockNearbyStationDiscovery(): NearbyStationDiscovery<IChargingBranch> {
  return {
    async findNearby(query) {
      await wait(300, query.signal);
      return MOCK_BRANCHES.filter(
        (branch) => distanceMeters(branch.position, query) <= query.radiusMeters
      );
    },
  };
}

export function createMockViewportStationDiscovery(): ViewportStationDiscovery<IChargingBranch> {
  return {
    async findInBounds(query) {
      await wait(300, query.signal);
      return MOCK_BRANCHES.filter((branch) => inBounds(branch.position, query));
    },
  };
}
