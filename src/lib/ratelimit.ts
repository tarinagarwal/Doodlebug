/**
 * Per-instance, in-memory fixed-window rate limiting.
 *
 * The card endpoint is an <img> src: GitHub's camo proxy fetches it constantly and every
 * request would otherwise pay a MongoDB round-trip *before* we even look at the cache.
 * A per-instance counter costs nothing and is accurate enough for flood protection —
 * cross-instance precision only matters for the auth routes, which use `rateLimit()`
 * in ./http instead.
 */

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();
/** Hard ceiling so a hostile spread of keys cannot grow the map without bound. */
const MAX_KEYS = 20_000;
let lastSweep = 0;

function sweep(now: number): void {
  for (const [k, w] of windows) if (w.resetAt <= now) windows.delete(k);
  lastSweep = now;
}

/**
 * Returns true when the request is allowed. Never throws and never awaits.
 */
export function memRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  // Expired entries are dropped lazily; sweep at most once a minute.
  if (now - lastSweep > 60_000 || windows.size > MAX_KEYS) sweep(now);
  if (windows.size > MAX_KEYS) windows.clear();

  const w = windows.get(key);
  if (!w || w.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  w.count++;
  return w.count <= limit;
}

/** Test helper — drops all state. */
export function resetMemRateLimit(): void {
  windows.clear();
  lastSweep = 0;
}
