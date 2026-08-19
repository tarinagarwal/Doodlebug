import { NextResponse } from "next/server";
import { z } from "zod";
import { kvRateLimit } from "./kv";

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
 * Cross-instance fixed-window rate limiter (Redis when configured, MongoDB otherwise).
 *
 * Use this for low-volume, correctness-sensitive routes (login, signup, password reset).
 * High-volume paths should prefer `memRateLimit` from ./ratelimit — see that module.
 */
export async function rateLimit(key: string, limit: number, windowSec: number): Promise<{ allowed: boolean; remaining: number }> {
  return kvRateLimit(key, limit, windowSec * 1000);
}

/**
 * Wraps `rateLimit` so an unreachable limit store can never take a route down.
 * Fails open — availability matters more than a perfectly enforced limit here.
 */
export async function rateLimitSafe(key: string, limit: number, windowSec: number): Promise<{ allowed: boolean }> {
  try {
    return await rateLimit(key, limit, windowSec);
  } catch (e) {
    console.error("[rateLimit] store unavailable", key, e);
    return { allowed: true };
  }
}
