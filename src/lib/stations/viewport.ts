import { resilientJson } from '@/lib/network';
import type { IMapBounds, IViewportStationQuery } from '@/shared/_service/interface.map';
import type { IChargingBranch } from '@/shared/_service/interface.ev';

export interface ViewportStationDiscovery<TStation extends IChargingBranch = IChargingBranch> {
  findInBounds(query: IViewportStationQuery): Promise<TStation[]>;
}

export interface HttpViewportStationDiscoveryOptions {
  endpoint: string;
  headers?: HeadersInit;
}

/** TODO(REQUIREMENT): replace response parsing when the backend envelope is known. */
export function createHttpViewportStationDiscovery<
  TStation extends IChargingBranch = IChargingBranch,
>({ endpoint, headers }: HttpViewportStationDiscoveryOptions): ViewportStationDiscovery<TStation> {
  return {
    findInBounds: (query) => {
      const url = new URL(endpoint, window.location.origin);
      for (const [key, value] of Object.entries({
        north: query.north,
        south: query.south,
        east: query.east,
        west: query.west,
      })) {
        url.searchParams.set(key, String(value));
      }
      if (query.zoom !== undefined) url.searchParams.set('zoom', String(query.zoom));
      return resilientJson<TStation[]>(url, {
        headers,
        method: 'GET',
        retries: 2,
        signal: query.signal,
      });
    },
  };
}

// Quantizing bounds to a coarse grid means dragging the map slightly doesn't
// re-request the same area repeatedly — the cache key only changes once the
// viewport crosses a grid line. 0.05° is roughly a 5-6km cell at Tehran's
// latitude; tune once real station density is known.
export function quantizeBounds(bounds: IMapBounds, precision = 0.05): IMapBounds {
  const floor = (value: number) => Math.floor(value / precision) * precision;
  const ceil = (value: number) => Math.ceil(value / precision) * precision;
  return {
    south: floor(bounds.south),
    west: floor(bounds.west),
    north: ceil(bounds.north),
    east: ceil(bounds.east),
  };
}

export function viewportCacheKey(bounds: IMapBounds, zoom?: number): string {
  const normalized = quantizeBounds(bounds);
  return (
    [normalized.south, normalized.west, normalized.north, normalized.east]
      .map((value) => value.toFixed(4))
      .join(':') + (zoom === undefined ? '' : `:z${Math.round(zoom * 10) / 10}`)
  );
}
