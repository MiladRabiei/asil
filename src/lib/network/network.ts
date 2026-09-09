export interface ResilientRequestOptions extends RequestInit {
  retries?: number;
  timeoutMs?: number;
  retryDelayMs?: number;
}

// Retries with exponential backoff, per-attempt timeout via AbortController,
// and forwards an external abort signal (e.g. from a cancelled station
// query) alongside the internal timeout one. Used by the station discovery
// adapters (lib/stations) instead of a bare fetch.
export async function resilientFetch(
  input: RequestInfo | URL,
  options: ResilientRequestOptions = {}
) {
  const { retries = 2, timeoutMs = 10_000, retryDelayMs = 500, signal, ...requestInit } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    const onAbort = () => controller.abort();
    if (signal?.aborted) {
      throw new DOMException('The operation was aborted.', 'AbortError');
    }
    signal?.addEventListener('abort', onAbort, { once: true });

    try {
      const response = await fetch(input, { ...requestInit, signal: controller.signal });
      if (response.ok || response.status < 500 || attempt === retries) return response;
      throw new Error(`request_failed_${response.status}`);
    } catch (error) {
      lastError = error;
      if (signal?.aborted) {
        throw error;
      }
      if (attempt < retries) {
        await new Promise<void>((resolve, reject) => {
          const delay = window.setTimeout(
            () => {
              signal?.removeEventListener('abort', cancelDelay);
              resolve();
            },
            retryDelayMs * 2 ** attempt
          );
          const cancelDelay = () => {
            window.clearTimeout(delay);
            reject(new DOMException('The operation was aborted.', 'AbortError'));
          };
          signal?.addEventListener('abort', cancelDelay, { once: true });
        });
      }
    } finally {
      window.clearTimeout(timeout);
      signal?.removeEventListener('abort', onAbort);
    }
  }

  throw lastError instanceof Error ? lastError : new Error('network_request_failed');
}

export async function resilientJson<T>(
  input: RequestInfo | URL,
  options?: ResilientRequestOptions
): Promise<T> {
  const response = await resilientFetch(input, options);
  return response.json() as Promise<T>;
}
