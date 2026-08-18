import { NextRequest } from "next/server";
import { isCardType, renderCard } from "@/lib/cards";
import { errorCard } from "@/lib/cards/frame";
import { resolveTheme } from "@/lib/cards/theme";
import { clientIp, rateLimit } from "@/lib/http";
import { db } from "@/lib/db";
import { RenderLog } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

  // Per-IP protection (generous — GitHub's camo proxy fetches these)
  try {
    const rl = await rateLimit(`card:${clientIp(req)}`, 240, 60);
    if (!rl.allowed) return svgResponse(errorCard(theme, "Slow down", "Too many card requests from this network", "Try again in a minute"), 30, 429);
  } catch (e) {
    console.error("[card] rate limit store unavailable", e);
  }

  const result = await renderCard(type, sp);

  // fire-and-forget usage log
  if (result.ok) {
    db()
      .then(() => RenderLog.create({ username: result.username ?? undefined, type, theme: theme.key, ip: clientIp(req) }))
      .catch(() => {});
  }
  return svgResponse(result.svg, result.cacheSeconds, 200);
}
