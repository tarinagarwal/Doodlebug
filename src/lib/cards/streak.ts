import type { UserBundle } from "../github/types";
import { Sketch } from "./draw";
import { frame } from "./frame";
import { icon } from "./icons";
import { type CommonParams } from "./params";
import { fmtDate, fmtNum, fmtRange, text } from "./text";
import { possessive } from "./stats";

export function streakCard(b: UserBundle, sp: URLSearchParams, c: CommonParams): string {
  const t = c.theme;
  const s = b.streak;
  const W = 495,
    H = 215;
  const sk = new Sketch(c.seed + 37);
  const body: string[] = [];
  const title = c.title ?? `${possessive(b.stats.name || b.stats.login)} Streak`;
  const titleIcon = icon(sk, "fire", 0, 0, 24, t.ink);
  const top = c.hideTitle ? 26 : 54;
  const colW = W / 3;
  const midY = top + 66;

  // dividers
  body.push(sk.line(colW, top + 6, colW, H - 26, { stroke: t.muted, strokeWidth: 1.2, roughness: 1.6, double: false, opacity: 0.7 }));
  body.push(sk.line(colW * 2, top + 6, colW * 2, H - 26, { stroke: t.muted, strokeWidth: 1.2, roughness: 1.6, double: false, opacity: 0.7 }));

  // total contributions
  const c1 = colW / 2;
  body.push(text(c1, midY, fmtNum(s.totalContributions), { size: 38, font: "title", fill: t.ink, anchor: "middle", weight: 700 }));
  body.push(text(c1, midY + 28, "Total Contributions", { size: 15, fill: t.ink, anchor: "middle" }));
  body.push(text(c1, midY + 48, s.firstContribution ? `${fmtDate(s.firstContribution)} – Present` : "–", { size: 12.5, fill: t.muted, anchor: "middle" }));

  // current streak with a flame ring
  const c2 = colW * 1.5;
  const R = 40;
  const cy = midY - 12;
  body.push(sk.circle(c2, cy, R * 2, { stroke: t.accent, strokeWidth: 3.2, roughness: 1.6, fill: t.bg, fillStyle: "solid" }));
  body.push(sk.circle(c2, cy, R * 2 - 12, { stroke: t.accent2, strokeWidth: 1.2, roughness: 1.8, double: false, dash: "3 5", opacity: 0.8 }));
  body.push(`<g transform="translate(${c2 + R - 14} ${cy - R - 8})">${icon(sk, "fire", 0, 0, 22, t.accent, { fill: t.accent, strokeWidth: 1.6 })}</g>`);
  body.push(text(c2, cy + 13, fmtNum(s.currentStreak.count), { size: 40, font: "title", fill: t.ink, anchor: "middle", weight: 700 }));
  body.push(text(c2, cy + R + 22, "Current Streak", { size: 15, fill: t.ink, anchor: "middle" }));
  body.push(text(c2, cy + R + 41, s.currentStreak.count ? fmtRange(s.currentStreak.start, s.currentStreak.end) : "no streak yet — start today!", { size: 12.5, fill: t.muted, anchor: "middle" }));

  // longest streak
  const c3 = colW * 2.5;
  body.push(text(c3, midY, fmtNum(s.longestStreak.count), { size: 38, font: "title", fill: t.ink, anchor: "middle", weight: 700 }));
  body.push(text(c3, midY + 28, "Longest Streak", { size: 15, fill: t.ink, anchor: "middle" }));
  body.push(text(c3, midY + 48, s.longestStreak.count ? fmtRange(s.longestStreak.start, s.longestStreak.end) : "–", { size: 12.5, fill: t.muted, anchor: "middle" }));

  if (c.doodles) {
    body.push(sk.star(colW - 24, top + 16, 6, { stroke: t.accent, fill: t.accent, fillStyle: "solid", strokeWidth: 1.2 }));
    body.push(sk.heart(W - 46, H - 34, 6, { stroke: t.accent, fill: t.accent, fillStyle: "solid", strokeWidth: 1.2 }));
  }

  return frame({ width: W, height: H, theme: t, seed: c.seed, title, titleIcon, hideBorder: c.hideBorder, hideTitle: c.hideTitle, doodles: c.doodles, animate: c.animate }, body.join(""));
}
