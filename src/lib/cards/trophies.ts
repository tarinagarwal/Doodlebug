import type { UserBundle } from "../github/types";
import { Sketch } from "./draw";
import { frame } from "./frame";
import { icon } from "./icons";
import { int, list, type CommonParams } from "./params";
import { fmtNum, text } from "./text";

interface Trophy {
  key: string;
  label: string;
  icon: string;
  value: number;
  tiers: number[]; // ascending thresholds → C, B, A, S, SS
}

const TIER_NAMES = ["C", "B", "A", "S", "SS"];

function tierOf(v: number, tiers: number[]): number {
  let t = -1;
  tiers.forEach((th, i) => {
    if (v >= th) t = i;
  });
  return t; // -1 = none
}

export function trophiesCard(b: UserBundle, sp: URLSearchParams, c: CommonParams): string {
  const t = c.theme;
  const s = b.stats;
  const hide = new Set(list(sp, "hide"));
  const columns = int(sp, "columns", 7, 1, 9);
  const all: Trophy[] = [
    { key: "stars", label: "Stargazer", icon: "star", value: s.totalStars, tiers: [1, 10, 50, 200, 1000] },
    { key: "commits", label: "Committer", icon: "commit", value: s.totalCommits, tiers: [10, 100, 500, 2000, 5000] },
    { key: "prs", label: "PR Hero", icon: "pr", value: s.totalPRs, tiers: [1, 10, 50, 200, 500] },
    { key: "issues", label: "Issue Hunter", icon: "issue", value: s.totalIssues, tiers: [1, 10, 50, 100, 300] },
    { key: "followers", label: "Popular", icon: "people", value: s.followers, tiers: [1, 10, 50, 200, 1000] },
    { key: "repos", label: "Builder", icon: "repo", value: s.publicRepos, tiers: [1, 10, 30, 80, 200] },
    { key: "streak", label: "On Fire", icon: "fire", value: b.streak.longestStreak.count, tiers: [3, 7, 30, 100, 365] },
    { key: "reviews", label: "Reviewer", icon: "eye", value: s.totalReviews, tiers: [1, 5, 20, 50, 100] },
    { key: "forks", label: "Forked", icon: "fork", value: s.totalForks, tiers: [1, 5, 20, 100, 500] },
  ];
  const chosen = all.filter((tr) => !hide.has(tr.key) && !(tr.key === "reviews" && tr.value <= 0 && !sp.get("show")?.includes("reviews")) && !(tr.key === "forks" && !sp.get("show")?.includes("forks")));
  const cellW = 110,
    cellH = 118;
  const cols = Math.min(columns, chosen.length);
  const rows = Math.ceil(chosen.length / cols);
  const hasTitle = Boolean(c.title) && !c.hideTitle;
  const top = hasTitle ? 56 : 18;
  const W = cols * cellW + 36;
  const H = top + rows * cellH + 14;
  const sk = new Sketch(c.seed + 71);
  const body: string[] = [];
  const tierColors = [t.muted, "#c07a3a", "#a9a9a9", t.accent, t.accent2];

  chosen.forEach((tr, i) => {
    const col = i % cols,
      row = Math.floor(i / cols);
    const x = 18 + col * cellW,
      y = top + row * cellH;
    const cx = x + cellW / 2;
    const tier = tierOf(tr.value, tr.tiers);
    const color = tier >= 0 ? tierColors[tier] : t.muted;
    // shield
    const sh = `M${cx - 30},${y + 14} L${cx + 30},${y + 14} L${cx + 30},${y + 50} Q${cx + 30},${y + 72} ${cx},${y + 82} Q${cx - 30},${y + 72} ${cx - 30},${y + 50} Z`;
    body.push(sk.path(sh, { stroke: t.ink, strokeWidth: 1.8, fill: tier >= 0 ? color : t.bg, fillStyle: tier >= 3 ? "hachure" : "solid", hachureGap: 5, fillWeight: 1.6, roughness: 1.2, fillOpacity: tier >= 0 ? 0.55 : 1 }));
    body.push(icon(sk, tr.icon, cx - 13, y + 22, 26, t.ink, { strokeWidth: 1.6 }));
    body.push(text(cx, y + 72, tier >= 0 ? TIER_NAMES[tier] : "–", { size: 20, font: "title", fill: t.ink, anchor: "middle", weight: 700 }));
    if (tier >= 3) body.push(sk.sparkle(cx + 30, y + 14, 5, t.accent));
    body.push(text(cx, y + 98, tr.label, { size: 13.5, fill: t.ink, anchor: "middle" }));
    body.push(text(cx, y + 113, fmtNum(tr.value), { size: 12, fill: t.muted, anchor: "middle" }));
  });

  return frame(
    { width: W, height: H, theme: t, seed: c.seed, title: hasTitle ? c.title : undefined, hideBorder: c.hideBorder, doodles: c.doodles, animate: c.animate, desc: `GitHub trophies for ${s.login}` },
    body.join(""),
  );
}
