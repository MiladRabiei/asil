import { pruneCache, readCache, writeCache } from './idb';

const MAX_STATION_CACHE_ENTRIES = 100;
const STATION_CACHE_RETENTION_MS = 24 * 60 * 60 * 1000;

export async function readStationCache<T>(key: string) {
  const record = await readCache<T>(`stations:${key}`);
  return record ? { key, data: record.value, updatedAt: record.updatedAt } : null;
}

export function writeStationCache<T>(key: string, data: T) {
  return writeCache(`stations:${key}`, data).then(() =>
    pruneCache('stations:', {
      maxEntries: MAX_STATION_CACHE_ENTRIES,
      maxAgeMs: STATION_CACHE_RETENTION_MS,
    })
  );
}
