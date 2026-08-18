import type { UserBundle } from "../github/types";
import { Sketch } from "./draw";
import { frame } from "./frame";
import { icon, ICONS } from "./icons";
import { mascot } from "./mascot";
import { bool, int, list, str, type CommonParams } from "./params";
import { measure, text, truncate, wrap } from "./text";

/**
 * Wide profile banner: big handwritten name, tagline, scattered doodles.
 * Works without any GitHub data (bundle optional).
 */
export function bannerCard(b: UserBundle | null, sp: URLSearchParams, c: CommonParams): string {
  const t = c.theme;
  const W = int(sp, "width", 900, 400, 1400);
  const H = int(sp, "height", 230, 140, 500);
  const name = str(sp, "name", 40) ?? b?.stats.name ?? b?.stats.login ?? "Hello, world";
  const tagline = str(sp, "text", 140) ?? (b?.stats.bio ? b.stats.bio : "");
  const sub = str(sp, "subtitle", 100);
  const align = (sp.get("align") || "center").toLowerCase();
  const showMascot = bool(sp, "mascot", true);
  const iconNames = list(sp, "icons");
  const icons = (iconNames.length ? iconNames : ["code", "rocket", "coffee", "star", "heart", "bolt", "branch", "sparkle"]).filter((n) => n in ICONS).slice(0, 12);
  const sk = new Sketch(c.seed + 83);
  const body: string[] = [];

  // scattered doodles along edges (deterministic positions)
  const margin = 40;
  icons.forEach((n, i) => {
    const frac = (i + 0.5) / icons.length;
    const topSide = i % 2 === 0;
    const x = margin + frac * (W - margin * 2) + sk.jitter(20);
    const y = topSide ? 22 + sk.jitter(6) : H - 46 + sk.jitter(6);
    const size = 20 + sk.rand() * 8;
    const col = i % 3 === 0 ? t.accent : i % 3 === 1 ? t.accent2 : t.ink;
    body.push(`<g transform="rotate(${sk.jitter(18)} ${x + size / 2} ${y + size / 2})">${icon(sk, n, x, y, size, col, { strokeWidth: 1.6 })}</g>`);
  });
  // sparkles
  for (let i = 0; i < 6; i++) {
    body.push(sk.sparkle(30 + sk.rand() * (W - 60), 30 + sk.rand() * (H - 60), 3 + sk.rand() * 3, i % 2 ? t.accent : t.accent2, 1.2));
  }

  // name
  const nameSize = Math.min(64, Math.max(34, (W - 260) / Math.max(6, name.length) * 1.7));
  const cx = align === "left" ? 60 : W / 2;
  const anchor = align === "left" ? "start" : "middle";
  const ny = H / 2 - (tagline ? 6 : -10) - (sub ? 8 : 0);
  const nameW = measure(name, nameSize, "title");
  const hx = align === "left" ? cx - 8 : cx - nameW / 2 - 8;
  body.push(sk.highlight(hx, ny - nameSize * 0.55, nameW + 16, nameSize * 0.5, t.accent, 0.5));
  body.push(text(cx, ny, name, { size: nameSize, font: "title", fill: t.ink, anchor, weight: 700 }));
  body.push(sk.underline(hx + 4, hx + nameW + 10, ny + 10, { stroke: t.ink, strokeWidth: 2.4 }));
  // tagline
  if (tagline) {
    const lines = wrap(tagline, W - 200, 20, "hand", 2);
    lines.forEach((l, i) => body.push(text(cx, ny + 40 + i * 24, l, { size: 20, fill: t.ink, anchor })));
    if (sub) body.push(text(cx, ny + 40 + lines.length * 24, truncate(sub, W - 200, 15), { size: 15, fill: t.muted, anchor }));
  } else if (sub) {
    body.push(text(cx, ny + 34, truncate(sub, W - 200, 16), { size: 16, fill: t.muted, anchor }));
  }
  // arrow pointing at the name from the left, plus mascot on the right
  if (c.doodles) body.push(sk.arrow(hx - 70, ny - 40, hx - 12, ny - 12, t.accent2, 0.35));
  if (showMascot) body.push(mascot(sk, W - 118, H / 2 - 52, 0.95, t.ink, t.accent, t.accent2, t.bg));

  return frame({ width: W, height: H, theme: t, seed: c.seed, hideBorder: c.hideBorder, doodles: false, animate: c.animate, desc: `Banner for ${name}` }, body.join(""));
}
