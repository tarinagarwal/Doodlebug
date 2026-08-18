import type { RepoInfo } from "../github/types";
import { Sketch } from "./draw";
import { frame } from "./frame";
import { icon, ICONS } from "./icons";
import { int, str, type CommonParams } from "./params";
import { fmtNum, measure, text, truncate, wrap } from "./text";

/** A single clickable-looking link sticker (wrap the <img> in an <a> in your README). */
export function linkCard(sp: URLSearchParams, c: CommonParams): string {
  const t = c.theme;
  const label = str(sp, "label", 40) ?? "My link";
  const sub = str(sp, "sub", 60);
  const ic = (sp.get("icon") || "globe").toLowerCase();
  const iconName = ic in ICONS ? ic : "globe";
  const size = int(sp, "size", 18, 12, 30);
  const style = (sp.get("style") || "sticker").toLowerCase(); // sticker | outline
  const sk = new Sketch(c.seed + 131);
  const padX = 16;
  const iconS = size + 6;
  const labelW = measure(label, size);
  const subW = sub ? measure(sub, 12) : 0;
  const W = Math.max(int(sp, "width", 0, 0, 600) || 0, Math.round(padX * 2 + iconS + 12 + Math.max(labelW, subW) + 48));
  const H = sub ? 74 : 58;
  const body: string[] = [];
  const fillColor = style === "outline" ? t.bg : t.accent;
  body.push(sk.roundRect(14, 12, W - 28, H - 24, 10, { stroke: t.ink, strokeWidth: 2, fill: fillColor, fillStyle: "solid", fillOpacity: style === "outline" ? 1 : 0.9, roughness: 1.2 }));
  body.push(icon(sk, iconName, padX + 6, H / 2 - iconS / 2, iconS, t.ink, { strokeWidth: 1.7 }));
  const tx = padX + 6 + iconS + 12;
  if (sub) {
    body.push(text(tx, H / 2 - 2, label, { size, fill: t.ink }));
    body.push(text(tx, H / 2 + 14, sub, { size: 12, fill: t.muted }));
  } else {
    body.push(text(tx, H / 2 + size * 0.35, label, { size, fill: t.ink }));
  }
  // little arrow at the right
  body.push(icon(sk, "external", W - padX - 26, H / 2 - 9, 18, t.ink, { strokeWidth: 1.5 }));
  return frame({ width: W, height: H, theme: t, seed: c.seed, hideBorder: true, doodles: false, animate: c.animate, desc: label, padding: 4 }, body.join(""));
}

/**
 * Custom project card: your own title/description/tags/link, optionally merged with live repo stats.
 */
export function projectCard(repo: RepoInfo | null, sp: URLSearchParams, c: CommonParams): string {
  const t = c.theme;
  const W = int(sp, "width", 440, 300, 900);
  const title = str(sp, "name", 50) ?? repo?.name ?? "My project";
  const desc = str(sp, "desc", 400) ?? repo?.description ?? "";
  const link = str(sp, "link", 80);
  const badge = str(sp, "badge", 40); // e.g. "#36 Product of the Day"
  const ic = (sp.get("icon") || "rocket").toLowerCase();
  const iconName = ic in ICONS ? ic : "rocket";
  const tags = (sp.get("tags") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12);
  const sk = new Sketch(c.seed + 137);
  const body: string[] = [];
  const top = 36;
  const descLines = desc ? wrap(desc, W - 60, 14, "hand", int(sp, "lines", 4, 1, 8)) : [];

  // tags flow (may wrap to 2 rows)
  const tagRows: { name: string; w: number; x: number; row: number }[] = [];
  let tx = 30,
    row = 0;
  for (const tg of tags) {
    const w = measure(tg, 11.5) + 18;
    if (tx + w > W - 30) {
      row++;
      tx = 30;
      if (row > 1) break;
    }
    tagRows.push({ name: tg, w, x: tx, row });
    tx += w + 6;
  }
  const tagRowsN = tagRows.length ? tagRows[tagRows.length - 1].row + 1 : 0;
  const badgeWEst = badge ? measure(badge, 12) + 16 : 0;
  const badgeInHeader = Boolean(badge) && measure(title, 23, "title") <= W - 100 - badgeWEst;
  const badgeInFooter = Boolean(badge) && !badgeInHeader;
  const hasFooter = Boolean(link || repo || badgeInFooter);
  const H = top + 26 + descLines.length * 19 + (tagRowsN ? tagRowsN * 24 + 6 : 0) + (hasFooter ? 40 : 18);

  // header
  body.push(icon(sk, iconName, 26, top - 19, 24, t.ink, { strokeWidth: 1.6 }));
  const badgeW = badgeWEst;
  const titleMax = W - 90 - (badgeInHeader ? badgeW : 0);
  const shownTitle = truncate(title, titleMax, 23, "title");
  body.push(text(58, top, shownTitle, { size: 23, font: "title", fill: t.ink, weight: 700 }));
  body.push(sk.underline(58, 58 + measure(shownTitle, 23, "title") + 4, top + 5, { stroke: t.accent, strokeWidth: 2.4 }));
  if (badge && badgeInHeader) {
    body.push(sk.roundRect(W - 30 - badgeW, top - 15, badgeW, 21, 6, { stroke: t.ink, strokeWidth: 1.2, fill: t.accent, fillStyle: "solid", fillOpacity: 0.7, roughness: 1, double: false, extra: `transform="rotate(${sk.jitter(2).toFixed(2)} ${W - 30 - badgeW / 2} ${top - 5})"` }));
    body.push(text(W - 30 - badgeW / 2, top, badge, { size: 12, fill: t.ink, anchor: "middle" }));
  }
  // description
  descLines.forEach((l, i) => body.push(text(30, top + 30 + i * 19, l, { size: 14, fill: t.ink })));
  // tags
  const tagsY = top + 30 + descLines.length * 19 + 4;
  const palette = [t.accent2, t.accent, t.muted];
  tagRows.forEach((tg, i) => {
    const y = tagsY + tg.row * 24;
    const col = palette[i % palette.length];
    body.push(sk.roundRect(tg.x, y - 12, tg.w, 19, 5, { stroke: col, strokeWidth: 1.2, fill: col, fillStyle: "solid", fillOpacity: 0.18, roughness: 0.8, double: false }));
    body.push(text(tg.x + tg.w / 2, y + 1.5, tg.name, { size: 11.5, fill: t.ink, anchor: "middle" }));
  });
  // footer
  if (hasFooter) {
    const fy = H - 22;
    let x = 30;
    if (repo) {
      if (repo.language) {
        body.push(sk.circle(x + 6, fy - 5, 11, { stroke: t.ink, strokeWidth: 1.2, fill: repo.languageColor ?? t.accent2, fillStyle: "solid", roughness: 0.8, double: false }));
        body.push(text(x + 18, fy, repo.language, { size: 13.5, fill: t.ink }));
        x += 26 + measure(repo.language, 13.5) + 18;
      }
      body.push(icon(sk, "star", x, fy - 13, 15, t.accent, { fill: t.accent, strokeWidth: 1.4 }));
      body.push(text(x + 20, fy, fmtNum(repo.stars), { size: 13.5, fill: t.ink }));
      x += 20 + measure(fmtNum(repo.stars), 13.5) + 18;
      body.push(icon(sk, "fork", x, fy - 13, 15, t.ink));
      body.push(text(x + 20, fy, fmtNum(repo.forks), { size: 13.5, fill: t.ink }));
      x += 20 + measure(fmtNum(repo.forks), 13.5) + 18;
    }
    if (badge && badgeInFooter) {
      body.push(sk.roundRect(x, fy - 15, badgeW, 21, 6, { stroke: t.ink, strokeWidth: 1.2, fill: t.accent, fillStyle: "solid", fillOpacity: 0.7, roughness: 1, double: false, extra: `transform="rotate(${sk.jitter(2).toFixed(2)} ${x + badgeW / 2} ${fy - 5})"` }));
      body.push(text(x + badgeW / 2, fy, badge, { size: 12, fill: t.ink, anchor: "middle" }));
      x += badgeW + 14;
    }
    if (link) {
      const shown = truncate(link.replace(/^https?:\/\//, ""), W - x - 60, 13);
      body.push(icon(sk, "external", W - 30 - measure(shown, 13) - 20, fy - 12, 14, t.accent2, { strokeWidth: 1.4 }));
      body.push(text(W - 30, fy, shown, { size: 13, fill: t.accent2, anchor: "end" }));
    }
  }
  return frame({ width: W, height: H, theme: t, seed: c.seed, hideBorder: c.hideBorder, doodles: c.doodles, bottomDoodle: false, animate: c.animate, desc: title }, body.join(""));
}

/**
 * Achievements list: `items=Winner: Gameathon 2K26;Runner-up: GameForge 2025;Top 100: Hackhazards`
 * Each item is "Label: detail" (or just text). Medal colour is picked from the label.
 */
export function achievementsCard(sp: URLSearchParams, c: CommonParams): string {
  const t = c.theme;
  const W = int(sp, "width", 495, 300, 900);
  const raw = sp.get("items") || "Winner: Your first hackathon;Runner-up: Something great;Top 100: A big competition";
  const items = raw
    .split(/;|\n|\|\|/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12)
    .map((s) => {
      const m = /^([^:]{1,28}):\s*(.+)$/.exec(s);
      return m ? { label: m[1].trim(), detail: m[2].trim() } : { label: "", detail: s };
    });
  const title = c.title ?? "Achievements";
  const sk = new Sketch(c.seed + 149);
  const body: string[] = [];
  const top = c.hideTitle ? 26 : 60;
  const rowGap = 8;
  const textX = 84;
  const maxW = W - textX - 30;

  const medalColor = (label: string): string => {
    const l = label.toLowerCase();
    if (/(winner|1st|first|gold|champion)/.test(l)) return "#f5c542";
    if (/(runner|2nd|second|silver)/.test(l)) return "#c0c0c0";
    if (/(3rd|third|bronze)/.test(l)) return "#cd7f32";
    if (/(top|finalist|honou?rable|special)/.test(l)) return t.accent2;
    return t.accent;
  };

  // pre-measure rows
  const rows = items.map((it) => {
    const detailSize = 14;
    const lines = wrap(it.detail, maxW - (it.label ? 0 : 0), detailSize, "hand", 3);
    const h = Math.max(40, (it.label ? 20 : 0) + lines.length * 18 + 6);
    return { ...it, lines, h };
  });
  const H = top + rows.reduce((a, r) => a + r.h + rowGap, 0) + 18;

  let y = top;
  rows.forEach((r, i) => {
    const cy = y + Math.min(r.h, 40) / 2;
    const col = medalColor(r.label);
    // rosette medal: ribbon + circle
    body.push(sk.polygon(
      [
        [46, cy + 6],
        [40, cy + 24],
        [50, cy + 19],
        [58, cy + 24],
        [54, cy + 6],
      ],
      { stroke: t.ink, strokeWidth: 1.2, fill: t.accent2, fillStyle: "solid", fillOpacity: 0.85, roughness: 0.9, double: false },
    ));
    body.push(sk.circle(50, cy, 30, { stroke: t.ink, strokeWidth: 1.8, fill: col, fillStyle: "solid", roughness: 1.1 }));
    body.push(sk.circle(50, cy, 20, { stroke: t.ink, strokeWidth: 1, roughness: 1.2, double: false, dash: "2 3", opacity: 0.7 }));
    body.push(text(50, cy + 5, String(i + 1), { size: 15, font: "title", fill: t.ink, anchor: "middle", weight: 700 }));
    // text
    let ty = y + 16;
    if (r.label) {
      const lw = measure(r.label, 15.5, "title") + 10;
      body.push(sk.highlight(textX - 4, ty - 12, lw, 14, col === "#c0c0c0" ? t.muted : col, 0.45));
      body.push(text(textX, ty, r.label, { size: 15.5, font: "title", fill: t.ink, weight: 700 }));
      ty += 19;
    }
    r.lines.forEach((l, li) => body.push(text(textX, ty + li * 18, l, { size: 14, fill: t.ink })));
    y += r.h + rowGap;
    if (i < rows.length - 1) body.push(`<line x1="${textX}" y1="${(y - rowGap / 2).toFixed(1)}" x2="${W - 30}" y2="${(y - rowGap / 2).toFixed(1)}" stroke="${t.muted}" stroke-width="1" stroke-dasharray="2 6" opacity="0.6"/>`);
  });

  const titleIcon = icon(sk, "trophy", 0, 0, 24, t.ink);
  return frame({ width: W, height: H, theme: t, seed: c.seed, title, titleIcon, hideBorder: c.hideBorder, hideTitle: c.hideTitle, doodles: c.doodles, bottomDoodle: false, animate: c.animate, desc: `${items.length} achievements` }, body.join(""));
}
