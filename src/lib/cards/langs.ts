import type { UserBundle } from "../github/types";
import { Sketch } from "./draw";
import { frame } from "./frame";
import { icon } from "./icons";
import { int, list, type CommonParams } from "./params";
import { text, truncate } from "./text";

export function langsCard(b: UserBundle, sp: URLSearchParams, c: CommonParams): string {
  const t = c.theme;
  const hide = new Set(list(sp, "hide"));
  const count = int(sp, "langs_count", 6, 1, 12);
  const layout = (sp.get("layout") || "bars").toLowerCase();
  const langs = b.langs.languages.filter((l) => !hide.has(l.name.toLowerCase())).slice(0, count);
  const total = langs.reduce((a, l) => a + l.size, 0) || 1;
  const sk = new Sketch(c.seed + 23);
  const title = c.title ?? "Top Languages";
  const titleIcon = icon(sk, "code", 0, 0, 24, t.ink);
  const body: string[] = [];
  const top = c.hideTitle ? 26 : 58;

  if (!langs.length) {
    const W = 340,
      H = 110;
    body.push(text(W / 2, top + 22, "No language data yet — go write some code!", { size: 15, fill: t.muted, anchor: "middle" }));
    return frame({ width: W, height: H, theme: t, seed: c.seed, title, titleIcon, hideBorder: c.hideBorder, hideTitle: c.hideTitle, doodles: c.doodles, animate: c.animate }, body.join(""));
  }

  if (layout === "donut" || layout === "pie") {
    const W = 340;
    const H = Math.max(180, top + langs.length * 22 + 20);
    const cx = 92,
      cy = top + (H - top) / 2 - 4,
      R = Math.min(60, (H - top) / 2 - 12);
    let ang = -Math.PI / 2;
    langs.forEach((l) => {
      const frac = l.size / total;
      const stop = ang + frac * Math.PI * 2;
      if (layout === "pie") {
        body.push(sk.arc(cx, cy, R * 2, R * 2, ang, stop, true, { stroke: t.ink, strokeWidth: 1.4, fill: l.color, fillStyle: "solid", fillOpacity: 0.85, roughness: 1 }));
      } else {
        body.push(sk.arc(cx, cy, R * 2 - 14, R * 2 - 14, ang + 0.02, stop - 0.02, false, { stroke: l.color, strokeWidth: 12, roughness: 1.2, double: false }));
      }
      ang = stop;
    });
    body.push(sk.circle(cx, cy, R * 2 + 6, { stroke: t.ink, strokeWidth: 1.6, roughness: 1.6, double: false }));
    if (layout === "donut") body.push(text(cx, cy + 8, `${langs.length}`, { size: 30, font: "title", fill: t.ink, anchor: "middle" }));
    // legend
    const lx = 176;
    langs.forEach((l, i) => {
      const y = top + 14 + i * 22;
      body.push(sk.circle(lx, y - 5, 10, { stroke: t.ink, strokeWidth: 1.2, fill: l.color, fillStyle: "solid", roughness: 0.8, double: false }));
      body.push(text(lx + 12, y, truncate(l.name, W - lx - 78, 14), { size: 14, fill: t.ink }));
      body.push(text(W - 30, y, `${Math.round((l.size / total) * 1000) / 10}%`, { size: 15, font: "title", fill: t.ink, anchor: "end" }));
    });
    return frame({ width: W, height: H, theme: t, seed: c.seed, title, titleIcon, hideBorder: c.hideBorder, hideTitle: c.hideTitle, doodles: c.doodles, animate: c.animate }, body.join(""));
  }

  if (layout === "compact") {
    const W = 340;
    const cols = 2;
    const rowsN = Math.ceil(langs.length / cols);
    const H = top + 34 + rowsN * 22 + 10;
    // stacked bar
    const bx = 30,
      by = top + 4,
      bw = W - 60,
      bh = 14;
    let x = bx;
    langs.forEach((l) => {
      const w = Math.max(2, (l.size / total) * bw);
      body.push(sk.rect(x, by, w, bh, { stroke: "none", fill: l.color, fillStyle: "solid", roughness: 0.6, fillOpacity: 0.9 }));
      x += w;
    });
    body.push(sk.rect(bx, by, bw, bh, { stroke: t.ink, strokeWidth: 1.6, roughness: 1.2 }));
    langs.forEach((l, i) => {
      const col = i % cols,
        row = Math.floor(i / cols);
      const lx = bx + col * (bw / cols);
      const y = by + 40 + row * 22;
      body.push(sk.circle(lx + 5, y - 5, 9, { stroke: t.ink, strokeWidth: 1, fill: l.color, fillStyle: "solid", roughness: 0.7, double: false }));
      body.push(text(lx + 16, y, `${truncate(l.name, 80, 14)} ${Math.round((l.size / total) * 1000) / 10}%`, { size: 14, fill: t.ink }));
    });
    return frame({ width: W, height: H, theme: t, seed: c.seed, title, titleIcon, hideBorder: c.hideBorder, hideTitle: c.hideTitle, doodles: c.doodles, animate: c.animate }, body.join(""));
  }

  // bars (default)
  const W = 340;
  const rowH = 30;
  const H = top + langs.length * rowH + 26;
  const bx = 30,
    bw = W - 60;
  const max = langs[0].size;
  langs.forEach((l, i) => {
    const y = top + i * rowH;
    const pct = Math.round((l.size / total) * 1000) / 10;
    body.push(text(bx, y + 10, truncate(l.name, 200, 15), { size: 15, fill: t.ink }));
    body.push(text(bx + bw, y + 10, `${pct}%`, { size: 15, font: "title", fill: t.ink, anchor: "end" }));
    const w = Math.max(6, (l.size / max) * bw);
    body.push(sk.rect(bx, y + 15, w, 9, { stroke: "none", fill: l.color, fillStyle: "hachure", hachureGap: 4, fillWeight: 1.4, roughness: 1 }));
    body.push(sk.rect(bx, y + 15, w, 9, { stroke: t.ink, strokeWidth: 1.4, roughness: 1.1, double: false }));
  });
  return frame({ width: W, height: H, theme: t, seed: c.seed, title, titleIcon, hideBorder: c.hideBorder, hideTitle: c.hideTitle, doodles: c.doodles, animate: c.animate }, body.join(""));
}
