import { Redis } from "@upstash/redis";
import { db } from "./db";
import { CacheEntry, RateBucket } from "./models";

/**
 * Key/value layer for the two things Mongo was doing badly: the GitHub data cache and the
 * rate-limit buckets. Both are pure TTL data with no relational shape, and both sit in the
 * request path, so a Redis round-trip beats a Mongo one by an order of magnitude.
 *
 * Upstash is used when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set, and
 * MongoDB is the fallback otherwise — self-hosting without Redis keeps working unchanged.
 *
 * Nothing in here throws. A cache backend that is down must degrade into a cache miss, never
 * into a failed card render.
 */

let client: Redis | null | undefined;

function redis(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  client = url && token ? new Redis({ url, token }) : null;
  return client;
}

/** True when a Redis backend is configured. Exposed for diagnostics. */
export function kvEnabled(): boolean {
  return redis() !== null;
}

/* ------------------------------------------------------------------ cache */

export async function cacheGet<T>(key: string): Promise<T | null> {
  const r = redis();
  if (r) {
    try {
      return (await r.get<T>(key)) ?? null;
    } catch (e) {
      console.error("[kv] get failed", key, e);
      return null;
    }
  }
  try {
    await db();
    const doc = await CacheEntry.findOne({ key }).lean<{ value: T }>();
    return doc?.value ?? null;
  } catch (e) {
    console.error("[kv] mongo get failed", key, e);
    return null;
  }
}

export async function cacheSet<T>(key: string, value: T, ttlMs: number): Promise<void> {
  const ttl = Math.max(1000, Math.floor(ttlMs));
  const r = redis();
  if (r) {
    try {
      await r.set(key, value, { px: ttl });
    } catch (e) {
      console.error("[kv] set failed", key, e);
    }
    return;
  }
  try {
    await db();
    await CacheEntry.updateOne({ key }, { $set: { value, expiresAt: new Date(Date.now() + ttl) } }, { upsert: true });
  } catch (e) {
    console.error("[kv] mongo set failed", key, e);
  }
}

/** Deletes exact keys. Prefix scans are deliberately avoided — callers know their key shapes. */
export async function cacheDel(keys: string[]): Promise<void> {
  if (!keys.length) return;
  const r = redis();
  if (r) {
    try {
      await r.del(...keys);
    } catch (e) {
      console.error("[kv] del failed", e);
    }
    return;
  }
  try {
    await db();
    await CacheEntry.deleteMany({ key: { $in: keys } });
  } catch (e) {
    console.error("[kv] mongo del failed", e);
  }
}

/* ------------------------------------------------------------- rate limits */

export interface RateResult {
  allowed: boolean;
  remaining: number;
}

/**
 * Fixed-window counter shared across instances.
 *
 * On Redis this is INCR + PEXPIRE, which is atomic and has no duplicate-key race by
 * construction. The Mongo fallback keeps the retry that race needs.
 */
export async function kvRateLimit(key: string, limit: number, windowMs: number): Promise<RateResult> {
  const r = redis();
  if (r) {
    const k = `rl:${key}`;
    const count = await r.incr(k);
    // Only the request that created the window sets its expiry, so the window is fixed
    // rather than sliding forward on every hit.
    if (count === 1) await r.pexpire(k, windowMs);
    return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
  }
  return mongoRateLimit(key, limit, windowMs);
}

async function mongoRateLimit(key: string, limit: number, windowMs: number): Promise<RateResult> {
  await db();
  const now = new Date();
  const freshReset = new Date(now.getTime() + windowMs);
  const expired = { $or: [{ $eq: [{ $type: "$resetAt" }, "missing"] }, { $lt: ["$resetAt", now] }] };
  const bump = async () =>
    RateBucket.findOneAndUpdate(
      { key },
      [
        {
          $set: {
            count: { $cond: [expired, 1, { $add: [{ $ifNull: ["$count", 0] }, 1] }] },
            resetAt: { $cond: [expired, freshReset, "$resetAt"] },
          },
        },
      ],
      { upsert: true, new: true },
    ).lean();

  let doc: Awaited<ReturnType<typeof bump>>;
  try {
    doc = await bump();
  } catch (e) {
    // Two concurrent requests for a key that does not exist yet both try to insert and one
    // loses the race on the unique index. The document exists by now, so a single retry
    // always takes the plain $inc path.
    if (!isDuplicateKey(e)) throw e;
    doc = await bump();
  }
  const count = doc?.count ?? 1;
  return { allowed: count <= limit, remaining: Math.max(0, limit - count) };
}

function isDuplicateKey(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: number }).code === 11000;
}
