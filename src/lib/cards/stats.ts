import type { UserBundle } from "../github/types";
import { Sketch } from "./draw";
import { frame } from "./frame";
import { icon } from "./icons";
import { bool, list, type CommonParams } from "./params";
import { fmtNum, measure, text } from "./text";

interface Row {
  key: string;
  icon: string;
  label: string;
  value: number;
}

export function statsCard(b: UserBundle, sp: URLSearchParams, c: CommonParams): string {
  const s = b.stats;
  const t = c.theme;
  const hide = new Set(list(sp, "hide"));
  const show = new Set(list(sp, "show"));
  const showIcons = bool(sp, "show_icons", true);
  const hideRank = bool(sp, "hide_rank", false);
  const commitsMode = (sp.get("commits") || "all").toLowerCase(); // all | year
  const useYear = commitsMode === "year" || s.totalCommits < 0;
  const thisYear = new Date().getUTCFullYear();

  const rows: Row[] = [];
  if (!hide.has("stars")) rows.push({ key: "stars", icon: "star", label: "Total Stars Earned", value: s.totalStars });
  if (!hide.has("commits")) rows.push({ key: "commits", icon: "commit", label: useYear ? `Total Commits (${thisYear})` : "Total Commits", value: useYear ? s.commitsThisYear : s.totalCommits });
  if (!hide.has("prs")) rows.push({ key: "prs", icon: "pr", label: "Total PRs", value: s.totalPRs });
  if (show.has("merged") || show.has("prs_merged")) rows.push({ key: "merged", icon: "check", label: "Merged PRs", value: s.mergedPRs });
  if (!hide.has("issues")) rows.push({ key: "issues", icon: "issue", label: "Total Issues", value: s.totalIssues });
  if (show.has("reviews")) rows.push({ key: "reviews", icon: "eye", label: "PR Reviews", value: s.totalReviews });
  if (!hide.has("contribs") && s.contributedTo >= 0) rows.push({ key: "contribs", icon: "branch", label: "Contributed to (last yr)", value: s.contributedTo });
  if (show.has("followers")) rows.push({ key: "followers", icon: "people", label: "Followers", value: s.followers });
  if (show.has("repos")) rows.push({ key: "repos", icon: "repo", label: "Public Repos", value: s.publicRepos });
  if (show.has("forks")) rows.push({ key: "forks", icon: "fork", label: "Total Forks", value: s.totalForks });
  if (!rows.length) rows.push({ key: "stars", icon: "star", label: "Total Stars Earned", value: s.totalStars });

  const rowH = 27;
  const W = 495;
  const top = c.hideTitle ? 30 : 60;
  const H = Math.max(hideRank ? 0 : 175, top + rows.length * rowH + 22);
  const sk = new Sketch(c.seed + 11);
  const body: string[] = [];

  const labelX = showIcons ? 58 : 32;
  const valueX = hideRank ? W - 40 : 318;

  rows.forEach((row, i) => {
    const y = top + i * rowH + 12;
    if (showIcons) body.push(icon(sk, row.icon, 30, y - 15, 19, t.accent2));
    body.push(text(labelX, y, row.label + ":", { size: 16, fill: t.ink }));
    const v = fmtNum(row.value);
    body.push(text(valueX, y + 2, v, { size: 22, font: "title", fill: t.ink, anchor: "end", weight: 700 }));
    // subtle dotted leader
    const lw = measure(row.label + ":", 16);
    const vw = measure(v, 22, "title");
    const x1 = labelX + lw + 8;
    const x2 = valueX - vw - 8;
    if (x2 - x1 > 20) body.push(`<line x1="${x1}" y1="${y - 4}" x2="${x2}" y2="${y - 4}" stroke="${t.muted}" stroke-width="1" stroke-dasharray="1 5" opacity="0.7"/>`);
  });

  if (!hideRank) {
    const cx = W - 92;
    const cy = top + Math.max(rows.length * rowH, 100) / 2 - 2;
    const R = 46;
    // ring
    body.push(sk.circle(cx, cy, R * 2, { stroke: t.ink, strokeWidth: 2.2, roughness: 1.6, fill: t.bg, fillStyle: "solid" }));
    // progress arc (percentile: lower = better → fill more)
    const pct = Math.max(0.05, Math.min(1, 1 - s.rank.percentile / 100));
    const start = -Math.PI / 2;
    const stop = start + Math.PI * 2 * pct;
    body.push(sk.arc(cx, cy, R * 2 - 12, R * 2 - 12, start, stop, false, { stroke: t.accent, strokeWidth: 6, roughness: 1.4, double: false, opacity: 0.9 }));
    body.push(text(cx, cy + 6, s.rank.level, { size: 36, font: "title", fill: t.ink, anchor: "middle", weight: 700 }));
    body.push(text(cx, cy + 24, `top ${Math.max(1, Math.round(s.rank.percentile))}%`, { size: 12, fill: t.muted, anchor: "middle" }));
    if (c.doodles) {
      body.push(sk.sparkle(cx + R + 4, cy - R + 6, 4, t.accent2));
      body.push(sk.star(cx - R - 6, cy + R - 4, 5, { stroke: t.accent, fill: t.accent, fillStyle: "solid", strokeWidth: 1.2 }));
    }
  }

  const title = c.title ?? `${possessive(s.name || s.login)} GitHub Stats`;
  const titleIcon = icon(sk, "graph", 0, 0, 24, t.ink);
  return frame(
    { width: W, height: H, theme: t, seed: c.seed, title, titleIcon, hideBorder: c.hideBorder, hideTitle: c.hideTitle, doodles: c.doodles, animate: c.animate, desc: `GitHub stats for ${s.login}` },
    body.join(""),
  );
}

export function possessive(name: string): string {
  const n = name.trim();
  return /s$/i.test(n) ? `${n}'` : `${n}'s`;
}

