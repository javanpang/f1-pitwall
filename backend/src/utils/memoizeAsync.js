/**
 * Caches the promise returned by an async function per argument for a set time (ttlMs).
 */
export function memoizeAsync(fn, { ttlMs }) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.value;

    const promise = fn(...args).catch((error) => {
      cache.delete(key);
      throw error;
    });
    cache.set(key, { value: promise, expires: Date.now() + ttlMs });
    return promise;
  };
}
