/**
 * Caches the promise returned by an async function per argument for a set time (ttlMs).
 *
 * Concurrent calls with the same arguments will share the same promise, so the function will only be called once.
 * Expired extries are evicted when the cache is checked for eviction and the oldest entries when its max size is exceeded.
 * Rejected promises are not cached, so the function will be called again on the next call with the same arguments.
 */
export function memoizeAsync(
  fn,
  { ttlMs, maxEntries = 500, key = (...args) => JSON.stringify(args) },
) {
  const cache = new Map();

  function evict() {
    const now = Date.now();
    for (const [k, entry] of cache) {
      if (entry.expires <= now) cache.delete(k);
    }
    while (cache.size > maxEntries) {
      cache.delete(cache.keys().next().value);
    }
  }

  return (...args) => {
    const cacheKey = key(...args);
    const hit = cache.get(cacheKey);

    if (hit && hit.expires > Date.now()) return hit.value;

    const promise = fn(...args).catch((error) => {
      cache.delete(cacheKey);
      throw error;
    });

    cache.set(cacheKey, { value: promise, expires: Date.now() + ttlMs });

    if (cache.size > maxEntries) evict();

    return promise;
  };
}
