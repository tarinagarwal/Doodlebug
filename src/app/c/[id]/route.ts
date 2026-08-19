import { NextRequest } from "next/server";
import mongoose from "mongoose";
import { isCardType, renderCard } from "@/lib/cards";
import { errorCard } from "@/lib/cards/frame";
import { resolveTheme } from "@/lib/cards/theme";
import { db } from "@/lib/db";
import { clientIp } from "@/lib/http";
import { cacheGet, cacheSet } from "@/lib/kv";
import { SavedCard } from "@/lib/models";
import { memRateLimit } from "@/lib/ratelimit";
import { recordRender } from "@/lib/stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

const FLOOD_LIMIT = 1200;
const FLOOD_WINDOW_MS = 60_000;
/** Short-lived so an edit in the dashboard shows up quickly without a database hit per view. */
const LOOKUP_TTL_MS = 60_000;

interface SavedShape {
  type: string;
  params: string;
}

function svgResponse(svg: string, cacheSeconds: number, status = 200): Response {
  return new Response(svg, {
    status,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": `public, max-age=${cacheSeconds}, s-maxage=${cacheSeconds}, stale-while-revalidate=86400`,
      "X-Doodlebug": "meow",
    },
  });
}

async function loadCard(id: string): Promise<SavedShape | null> {
  const key = `saved:v1:${id}`;
  const cached = await cacheGet<SavedShape | { missing: true }>(key);
  if (cached) return "missing" in cached ? null : cached;

  await db();
  const doc = await SavedCard.findById(id).select("type params").lean<SavedShape | null>();
  const value: SavedShape | { missing: true } = doc ? { type: doc.type, params: doc.params } : { missing: true };
  await cacheSet(key, value, LOOKUP_TTL_MS);
  return doc ? { type: doc.type, params: doc.params } : null;
}

/**
 * Renders a saved card by id: `/c/<id>.svg`.
 *
 * The point is that the URL never changes. Someone pastes this into a README once and can
 * then restyle the card from the dashboard forever without touching the README again.
 * Query parameters still work and take precedence, so `/c/<id>.svg?theme=midnight` lets a
 * reader (or the owner) tweak one rendering without saving a second card.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const raw = (await ctx.params).id;
  const id = raw.replace(/\.svg$/i, "");
  const theme = resolveTheme(req.nextUrl.searchParams);

  const ip = clientIp(req);
  if (!memRateLimit(`card:${ip}`, FLOOD_LIMIT, FLOOD_WINDOW_MS)) {
    return svgResponse(errorCard(theme, "Slow down", "Too many card requests from this network", "Try again in a minute"), 30, 429);
  }

  if (!mongoose.isValidObjectId(id)) {
    return svgResponse(errorCard(theme, "Not a card", "That does not look like a saved card id", "Copy the link again from your dashboard"), 300, 404);
  }

  let saved: SavedShape | null;
  try {
    saved = await loadCard(id);
  } catch (e) {
    console.error("[saved card]", id, e);
    return svgResponse(errorCard(theme, "Oops, ink spilled", "Could not load that saved card", "Try again in a minute"), 60, 200);
  }

  if (!saved || !isCardType(saved.type)) {
    return svgResponse(errorCard(theme, "Card not found", "This saved card was deleted or never existed", "Check the link in your dashboard"), 300, 404);
  }

  // Saved params first, request query second — so an explicit ?theme= wins over the saved one.
  const merged = new URLSearchParams(saved.params);
  for (const [k, v] of req.nextUrl.searchParams) merged.set(k, v);

  const result = await renderCard(saved.type, merged, { clientKey: ip });
  if (result.ok) recordRender(saved.type, resolveTheme(merged).key);
  return svgResponse(result.svg, result.cacheSeconds, 200);
}
