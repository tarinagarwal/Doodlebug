import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "./db";
import { RateBucket } from "./models";

export function json(data: unknown, init?: number | ResponseInit): NextResponse {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

export function err(message: string, status = 400, extra?: Record<string, unknown>): NextResponse {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function parseBody<T extends z.ZodTypeAny>(
  req: Request,
  schema: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; res: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, res: err("Invalid JSON body") };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, res: err(first ? `${first.path.join(".") || "body"}: ${first.message}` : "Invalid input") };
  }
  return { ok: true, data: parsed.data };
}

export function clientIp(req: Request): string {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

/**
 * Fixed-window rate limiter backed by MongoDB (works across serverless instances).
 *
 * Use this for low-volume, correctness-sensitive routes (login, signup, password reset).
 * High-volume paths should prefer `memRateLimit` from ./ratelimit — see that module.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  await db();
  const now = new Date();
  const freshReset = new Date(now.getTime() + windowSec * 1000);
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
  const resetAt = doc?.resetAt ? new Date(doc.resetAt) : freshReset;
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetAt };
}

function isDuplicateKey(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: number }).code === 11000;
}

/**
 * Wraps `rateLimit` so an unreachable/failing limit store can never take a route down.
 * Fails open — availability matters more than a perfectly enforced limit here.
 */
export async function rateLimitSafe(
  key: string,
  limit: number,
  windowSec: number,
): Promise<{ allowed: boolean }> {
  try {
    return await rateLimit(key, limit, windowSec);
  } catch (e) {
    console.error("[rateLimit] store unavailable", key, e);
    return { allowed: true };
  }
}
