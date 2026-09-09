import type { IMapBounds, IMapPosition } from '@/shared/_service/interface.map';

/**
 * Application-level map provider contract. Only add capabilities when a
 * second provider is actually required — do not leak Neshan/OpenLayers
 * objects outside their adapter (components/map/NeshanMap.tsx).
 */
export interface IMapProviderAdapter {
  readonly id: string;
  openNavigation?: (destination: IMapPosition, origin?: IMapPosition) => boolean;
}

/**
 * Optional offline-tile capability, deliberately separated from the base
 * adapter. Do NOT implement this for Neshan until the current SDK/terms are
 * confirmed to permit bounded client-side tile prefetching — assume they
 * don't until someone checks.
 */
export interface IOfflineMapProviderCapability {
  prefetchArea(bounds: IMapBounds, minZoom: number, maxZoom: number): Promise<void>;
  clearArea(bounds?: IMapBounds): Promise<void>;
}
