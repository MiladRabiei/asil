import { resilientJson } from '@/lib/network';
import type { INearbyStationQuery } from '@/shared/_service/interface.map';
import type { IChargingBranch } from '@/shared/_service/interface.ev';

export interface NearbyStationDiscovery<TStation extends IChargingBranch = IChargingBranch> {
  findNearby(query: INearbyStationQuery): Promise<TStation[]>;
}

export interface HttpNearbyStationDiscoveryOptions {
  endpoint: string;
  headers?: HeadersInit;
}

/** TODO(REQUIREMENT): replace response parsing when the backend envelope is known. */
export function createHttpNearbyStationDiscovery<TStation extends IChargingBranch = IChargingBranch>({
  endpoint,
  headers,
}: HttpNearbyStationDiscoveryOptions): NearbyStationDiscovery<TStation> {
  return {
    findNearby: (query) => {
      const url = new URL(endpoint, window.location.origin);
      url.searchParams.set('lat', String(query.lat));
      url.searchParams.set('lng', String(query.lng));
      url.searchParams.set('radius', String(query.radiusMeters));
      return resilientJson<TStation[]>(url, { headers, method: 'GET', retries: 2, signal: query.signal });
    },
  };
}
