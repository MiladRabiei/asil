// Minimal, dependency-free IndexedDB key/value cache. Deliberately not using
// the `idb` npm package — this needs exactly two operations, and a raw
// wrapper keeps the offline layer from ever depending on npm registry
// availability at build time.
const DB_NAME = 'ev-pwa-cache';
const DB_VERSION = 1;
const STORE_NAME = 'records';

interface CacheRecord<T> {
  key: string;
  value: T;
  updatedAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB is not available.'));
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'key' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open IndexedDB.'));
  });
}

export async function readCache<T>(key: string): Promise<CacheRecord<T> | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(key);
      request.onsuccess = () => resolve((request.result as CacheRecord<T> | undefined) ?? null);
      request.onerror = () => reject(request.error);
      tx.oncomplete = () => db.close();
    });
  } catch {
    return null; // persistence is optional — never block the UI on it
  }
}

export async function writeCache<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ key, value, updatedAt: Date.now() } satisfies CacheRecord<T>);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* persistence is optional */
  }
}
