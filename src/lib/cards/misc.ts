import { Sketch } from "./draw";
import { frame } from "./frame";
import { icon, ICONS } from "./icons";
import { int, list, str, type CommonParams } from "./params";
import { measure, text, wrap } from "./text";

/** Sticky note with handwritten text + tape. No GitHub data needed. */
export function noteCard(sp: URLSearchParams, c: CommonParams): string {
  const t = c.theme;
  const W = int(sp, "width", 360, 200, 900);
  const body = str(sp, "text", 400) ?? "Write something nice here — use ?text=…";
  const author = str(sp, "author", 40);
  const size = int(sp, "size", 18, 12, 36);
  const font = (sp.get("font") || "hand") as "hand" | "title" | "kalam";
  const lines = wrap(body, W - 70, size, font, 12);
  const H = 56 + lines.length * (size * 1.35) + (author ? 34 : 18);
  const sk = new Sketch(c.seed + 97);
  const parts: string[] = [];
  parts.push(sk.tape(W / 2, 12, 90, sk.jitter(6), t.dark ? "#8c7f5a" : "#e8d9a0"));
  lines.forEach((l, i) => parts.push(text(34, 52 + i * size * 1.35, l, { size, font, fill: t.ink })));
  if (author) parts.push(text(W - 34, H - 22, `— ${author}`, { size: 15, font: "title", fill: t.muted, anchor: "end" }));
  if (c.doodles) parts.push(sk.heart(W - 30, 30, 5, { stroke: t.accent, fill: t.accent, fillStyle: "solid", strokeWidth: 1 }));
  return frame({ width: W, height: H, theme: t, seed: c.seed, hideBorder: c.hideBorder, doodles: false, animate: c.animate, fonts: ["hand", "title", "kalam"], desc: body }, parts.join(""));
}

/** Skill stickers: comma list rendered as hand-drawn tags with optional icons */
export function skillsCard(sp: URLSearchParams, c: CommonParams): string {
  const t = c.theme;
  const skills = (sp.get("skills") || sp.get("list") || "TypeScript,React,Node.js,Python")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 40);
  const W = int(sp, "width", 495, 240, 1200);
  const cols = int(sp, "columns", 0, 0, 12); // 0 = flow layout
  const title = c.title ?? "Skills & Tools";
  const iconsFor = new Map<string, string>();
  for (const pair of list(sp, "icons")) {
    const [k, v] = pair.split(":");
    if (k && v && v in ICONS) iconsFor.set(k.toLowerCase(), v);
  }
  const sk = new Sketch(c.seed + 101);
  const parts: string[] = [];
  const size = 15;
  const padX = 12,
    tagH = 30,
    gapX = 10,
    gapY = 12;
  let x = 30,
    y = c.hideTitle ? 30 : 62;
  const maxX = W - 30;
  const palette = [t.accent, t.accent2, t.ink];
  skills.forEach((s, i) => {
    const hasIcon = iconsFor.has(s.toLowerCase());
    const w = measure(s, size) + padX * 2 + (hasIcon ? 20 : 0);
    if (cols > 0) {
      const colW = (W - 60) / cols;
      const ci = i % cols;
      if (ci === 0 && i > 0) y += tagH + gapY;
      x = 30 + ci * colW;
    } else if (x + w > maxX) {
      x = 30;
      y += tagH + gapY;
    }
    const col = palette[i % palette.length];
    const rot = sk.jitter(2.5);
    parts.push(
      `<g transform="rotate(${rot.toFixed(2)} ${(x + w / 2).toFixed(1)} ${(y + tagH / 2).toFixed(1)})">` +
        sk.roundRect(x, y, w, tagH, 8, { stroke: t.ink, strokeWidth: 1.6, fill: col, fillStyle: i % 3 === 2 ? "solid" : "hachure", hachureGap: 5, fillWeight: 1.2, roughness: 1.1, fillOpacity: i % 3 === 2 ? 0.12 : 0.55 }) +
        (hasIcon ? icon(sk, iconsFor.get(s.toLowerCase())!, x + padX - 2, y + 6, 18, t.ink, { strokeWidth: 1.5 }) : "") +
        text(x + padX + (hasIcon ? 20 : 0), y + 20, s, { size, fill: t.ink }) +
        `</g>`,
    );
    if (cols === 0) x += w + gapX;
  });
  const H = y + tagH + 24;
  const titleIcon = icon(sk, "bolt", 0, 0, 24, t.ink);
  return frame({ width: W, height: H, theme: t, seed: c.seed, title, titleIcon, hideBorder: c.hideBorder, hideTitle: c.hideTitle, doodles: c.doodles, animate: c.animate }, parts.join(""));
}
