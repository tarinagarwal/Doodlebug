import type { RepoInfo } from "../github/types";
import { Sketch } from "./draw";
import { frame } from "./frame";
import { icon } from "./icons";
import { bool, type CommonParams } from "./params";
import { fmtNum, measure, text, truncate, wrap } from "./text";

export function repoCard(repo: RepoInfo, sp: URLSearchParams, c: CommonParams): string {
  const t = c.theme;
  const W = 400;
  const showOwner = bool(sp, "show_owner", false);
  const sk = new Sketch(c.seed + 61);
  const body: string[] = [];
  const name = showOwner ? `${repo.owner}/${repo.name}` : repo.name;
  const descLines = repo.description ? wrap(repo.description, W - 60, 14, "hand", 3) : ["No description, but probably something cool."];
  const top = 34;
  const H = top + 26 + descLines.length * 19 + 46;

  // header
  body.push(icon(sk, "repo", 26, top - 18, 22, t.ink));
  body.push(text(56, top, truncate(name, W - 130, 22, "title"), { size: 22, font: "title", fill: t.ink, weight: 700 }));
  const nameW = measure(truncate(name, W - 130, 22, "title"), 22, "title");
  body.push(sk.underline(56, 56 + nameW + 4, top + 5, { stroke: t.accent, strokeWidth: 2.4 }));
  const badges: string[] = [];
  if (repo.isArchived) badges.push("archived");
  if (repo.isTemplate) badges.push("template");
  if (repo.isFork) badges.push("fork");
  if (badges.length) {
    const label = badges.join(" · ");
    const bw = measure(label, 12) + 14;
    body.push(sk.roundRect(W - 30 - bw, top - 14, bw, 20, 6, { stroke: t.muted, strokeWidth: 1.2, roughness: 1, double: false }));
    body.push(text(W - 30 - bw / 2, top, label, { size: 12, fill: t.muted, anchor: "middle" }));
  }

  // description
  descLines.forEach((l, i) => body.push(text(30, top + 30 + i * 19, l, { size: 14, fill: repo.description ? t.ink : t.muted })));

  // footer: language, stars, forks
  const fy = H - 24;
  let x = 30;
  if (repo.language) {
    body.push(sk.circle(x + 6, fy - 5, 11, { stroke: t.ink, strokeWidth: 1.2, fill: repo.languageColor ?? t.accent2, fillStyle: "solid", roughness: 0.8, double: false }));
    body.push(text(x + 18, fy, repo.language, { size: 14, fill: t.ink }));
    x += 26 + measure(repo.language, 14) + 20;
  }
  body.push(icon(sk, "star", x, fy - 14, 16, t.accent, { fill: t.accent, strokeWidth: 1.4 }));
  body.push(text(x + 21, fy, fmtNum(repo.stars), { size: 14, fill: t.ink }));
  x += 21 + measure(fmtNum(repo.stars), 14) + 20;
  body.push(icon(sk, "fork", x, fy - 14, 16, t.ink));
  body.push(text(x + 21, fy, fmtNum(repo.forks), { size: 14, fill: t.ink }));

  if (repo.topics.length) {
    let tx = W - 30;
    const shown = repo.topics.slice(0, 3);
    for (const tp of shown.reverse()) {
      const w = measure(tp, 11) + 12;
      tx -= w;
      body.push(sk.roundRect(tx, fy - 12, w, 17, 5, { stroke: t.accent2, strokeWidth: 1, fill: t.accent2, fillStyle: "solid", fillOpacity: 0.18, roughness: 0.8, double: false }));
      body.push(text(tx + w / 2, fy, tp, { size: 11, fill: t.ink, anchor: "middle" }));
      tx -= 6;
    }
  }

  return frame({ width: W, height: H, theme: t, seed: c.seed, hideBorder: c.hideBorder, doodles: c.doodles, bottomDoodle: false, animate: c.animate, desc: `${repo.owner}/${repo.name}` }, body.join(""));
}
