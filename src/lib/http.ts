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
  const doc = await RateBucket.findOneAndUpdate(
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
  const count = doc?.count ?? 1;
  const resetAt = doc?.resetAt ? new Date(doc.resetAt) : freshReset;
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), resetAt };
}
