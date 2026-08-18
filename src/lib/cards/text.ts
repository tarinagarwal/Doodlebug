/**
 * Server-side text helpers: escaping, approximate measurement (no canvas available),
 * wrapping and truncation. Widths are approximations tuned for the embedded fonts.
 */

export type FontKey = "hand" | "title" | "kalam";

export const FONT_FAMILY: Record<FontKey, string> = {
  hand: "'PatrickHand','Patrick Hand','Comic Sans MS','Segoe Print',cursive,sans-serif",
  title: "'CaveatBold','Caveat','Patrick Hand','Comic Sans MS','Segoe Print',cursive,sans-serif",
  kalam: "'Kalam','Patrick Hand','Comic Sans MS',cursive,sans-serif",
};

// average advance width as a fraction of font-size
const AVG: Record<FontKey, number> = { hand: 0.47, title: 0.4, kalam: 0.5 };
const NARROW = new Set("iljtfr!.,:;'|I1 ()[]".split(""));
const WIDE = new Set("mwMW@%&".split(""));

export function measure(text: string, size: number, font: FontKey = "hand"): number {
  const avg = AVG[font];
  let w = 0;
  for (const ch of text) {
    if (NARROW.has(ch)) w += avg * 0.55;
    else if (WIDE.has(ch)) w += avg * 1.45;
    else if (/[A-Z0-9]/.test(ch)) w += avg * 1.15;
    else w += avg;
  }
  return w * size;
}

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

export function truncate(text: string, maxWidth: number, size: number, font: FontKey = "hand"): string {
  if (measure(text, size, font) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && measure(out + "…", size, font) > maxWidth) out = out.slice(0, -1);
  return out.trimEnd() + "…";
}

export function wrap(text: string, maxWidth: number, size: number, font: FontKey = "hand", maxLines = 3): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  let i = 0;
  for (; i < words.length; i++) {
    const w = words[i];
    const test = cur ? cur + " " + w : w;
    if (measure(test, size, font) <= maxWidth || !cur) {
      cur = test;
    } else {
      lines.push(cur);
      cur = w;
      if (lines.length === maxLines) break;
    }
  }
  if (lines.length < maxLines) {
    if (cur) lines.push(cur);
    return lines;
  }
  // overflow: cram the rest into the last line and truncate with an ellipsis
  const rest = [cur, ...words.slice(i + 1)].filter(Boolean).join(" ");
  if (rest) lines[maxLines - 1] = truncate(lines[maxLines - 1] + " " + rest, maxWidth, size, font);
  return lines;
}

export interface TextOpts {
  size?: number;
  font?: FontKey;
  fill?: string;
  anchor?: "start" | "middle" | "end";
  weight?: number | string;
  rotate?: number;
  opacity?: number;
  extra?: string;
  baseline?: "auto" | "middle" | "hanging" | "central";
}

export function text(x: number, y: number, str: string, o: TextOpts = {}): string {
  const size = o.size ?? 16;
  const font = o.font ?? "hand";
  const attrs = [
    `x="${r(x)}"`,
    `y="${r(y)}"`,
    `font-family="${FONT_FAMILY[font]}"`,
    `font-size="${size}"`,
    o.fill ? `fill="${o.fill}"` : "",
    o.anchor ? `text-anchor="${o.anchor}"` : "",
    o.weight ? `font-weight="${o.weight}"` : "",
    o.opacity !== undefined ? `opacity="${o.opacity}"` : "",
    o.baseline ? `dominant-baseline="${o.baseline}"` : "",
    o.rotate ? `transform="rotate(${o.rotate} ${r(x)} ${r(y)})"` : "",
    o.extra ?? "",
  ]
    .filter(Boolean)
    .join(" ");
  return `<text ${attrs}>${esc(str)}</text>`;
}

export function r(n: number): string {
  return (Math.round(n * 100) / 100).toString();
}

export function fmtNum(n: number): string {
  if (n < 0) return "–";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(/\.0$/, "") + "M";
  if (n >= 10_000) return (n / 1000).toFixed(n >= 100_000 ? 0 : 1).replace(/\.0$/, "") + "k";
  return n.toLocaleString("en-US");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(iso: string | null, withYear = true): string {
  if (!iso) return "–";
  const [y, m, d] = iso.split("-").map(Number);
  return `${MONTHS[(m || 1) - 1]} ${d}${withYear ? ", " + y : ""}`;
}
export function fmtRange(a: string | null, b: string | null): string {
  if (!a || !b) return "–";
  if (a === b) return fmtDate(a);
  const sameYear = a.slice(0, 4) === b.slice(0, 4);
  return `${fmtDate(a, !sameYear)} – ${fmtDate(b)}`;
}
