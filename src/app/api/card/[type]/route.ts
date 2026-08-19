import { NextRequest } from "next/server";
import { isCardType, renderCard } from "@/lib/cards";
import { errorCard } from "@/lib/cards/frame";
import { resolveTheme } from "@/lib/cards/theme";
import { clientIp } from "@/lib/http";
import { memRateLimit } from "@/lib/ratelimit";
import { recordRender } from "@/lib/stats";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * Flood backstop only, and deliberately generous.
 *
 * README traffic reaches us through a small pool of GitHub camo IPs, so a tight per-IP
 * limit punishes everyone reading a popular card rather than an abuser. Serving a cached
 * card is cheap; what actually costs us is a live GitHub fetch, and that is limited
 * separately (and much more tightly) in the data layer.
 */
const FLOOD_LIMIT = 1200;
const FLOOD_WINDOW_MS = 60_000;

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

export async function GET(req: NextRequest, ctx: { params: Promise<{ type: string }> }) {
  const { type } = await ctx.params;
  const sp = req.nextUrl.searchParams;
  const theme = resolveTheme(sp);
  if (!isCardType(type)) {
    return svgResponse(errorCard(theme, "Unknown card", `No card called "${type.slice(0, 30)}"`, "Try stats, langs, streak, activity, graph, trophies, repo, banner, skills or note"), 60, 404);
  }

  // In-memory: no database round-trip ahead of the cache lookup.
  const ip = clientIp(req);
  if (!memRateLimit(`card:${ip}`, FLOOD_LIMIT, FLOOD_WINDOW_MS)) {
    return svgResponse(errorCard(theme, "Slow down", "Too many card requests from this network", "Try again in a minute"), 30, 429);
  }

  const result = await renderCard(type, sp, { clientKey: ip });

  // Buffered in memory and flushed in one bulk write after the response is sent.
  if (result.ok) recordRender(type, theme.key);

  return svgResponse(result.svg, result.cacheSeconds, 200);
}
