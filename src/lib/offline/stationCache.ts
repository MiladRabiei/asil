import { readCache, writeCache } from './idb';

export async function readStationCache<T>(key: string) {
  const record = await readCache<T>(`stations:${key}`);
  return record ? { key, data: record.value, updatedAt: record.updatedAt } : null;
}

export function writeStationCache<T>(key: string, data: T) {
  return writeCache(`stations:${key}`, data);
}
