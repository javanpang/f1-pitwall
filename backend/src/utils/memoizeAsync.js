/**
 * Caches the promise returned by an async function per argument for a set time (ttlMs).
 *
 * By default the cache key is the JSON of all arguments.
 * Pass `key` to derive cache key from the arguments instead.
 */
export function memoizeAsync(
  fn,
  { ttlMs, key = (...args) => JSON.stringify(args) },
) {
  const cache = new Map();
  return (...args) => {
    const cacheKey = key(...args);
    const hit = cache.get(cacheKey);
    if (hit && hit.expires > Date.now()) return hit.value;

    const promise = fn(...args).catch((error) => {
      cache.delete(cacheKey);
      throw error;
    });
    cache.set(cacheKey, { value: promise, expires: Date.now() + ttlMs });
    return promise;
  };
}
