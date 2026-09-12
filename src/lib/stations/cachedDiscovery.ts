import { readStationCache, writeStationCache } from '@/lib/offline';
import type { IChargingBranch } from '@/shared/_service/interface.ev';
import type { IMapPosition, IViewportStationQuery } from '@/shared/_service/interface.map';
import type { NearbyStationDiscovery } from './nearby';
import type { ViewportStationDiscovery } from './viewport';

const BRANCH_STATUSES = new Set(['AVAILABLE', 'FULL', 'OUT_OF_SERVICE']);

function assertStationList(value: unknown): asserts value is IChargingBranch[] {
  if (!Array.isArray(value)) throw new Error('Invalid station response: expected an array.');
  for (const station of value) {
    if (!station || typeof station !== 'object') throw new Error('Invalid station response.');
    const item = station as Partial<IChargingBranch>;
    if (
      typeof item.id !== 'string' ||
      typeof item.name !== 'string' ||
      typeof item.address !== 'string' ||
      !item.position ||
      !Number.isFinite(item.position.lat) ||
      !Number.isFinite(item.position.lng) ||
      !BRANCH_STATUSES.has(item.status ?? '') ||
      !Array.isArray(item.connectors)
    ) {
      throw new Error('Invalid station response: invalid station shape.');
    }
  }
}

interface NearbyOptions {
  discovery: NearbyStationDiscovery<IChargingBranch>;
  position: IMapPosition;
  radiusMeters: number;
  signal?: AbortSignal;
}

interface ViewportOptions {
  discovery: ViewportStationDiscovery<IChargingBranch>;
  viewport: IViewportStationQuery;
  cacheKey: string;
  signal?: AbortSignal;
}

export async function fetchNearbyStationsWithCache({
  discovery,
  position,
  radiusMeters,
  signal,
}: NearbyOptions): Promise<IChargingBranch[]> {
  const cacheKey = `nearby:${position.lat.toFixed(3)}:${position.lng.toFixed(3)}:${radiusMeters}`;
  const cached = await readStationCache<IChargingBranch[]>(cacheKey);

  try {
    const data = await discovery.findNearby({
      ...position,
      radiusMeters,
      signal,
    });
    assertStationList(data);
    await writeStationCache(cacheKey, data);
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (cached) return cached.data;
    throw error;
  }
}

export async function fetchViewportStationsWithCache({
  discovery,
  viewport,
  cacheKey,
  signal,
}: ViewportOptions): Promise<IChargingBranch[]> {
  const storageKey = `viewport:${cacheKey}`;
  const cached = await readStationCache<IChargingBranch[]>(storageKey);

  try {
    const data = await discovery.findInBounds({
      ...viewport,
      signal,
    });
    assertStationList(data);
    await writeStationCache(storageKey, data);
    return data;
  } catch (error) {
    if (signal?.aborted) throw error;
    if (cached) return cached.data;
    throw error;
  }
}
