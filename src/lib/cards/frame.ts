import { caveatBoldBase64, kalamBase64, patrickHandBase64 } from "@/fonts/embedded";
import { Sketch } from "./draw";
import { esc, measure, r, text, truncate } from "./text";
import type { Theme } from "./theme";

export interface FrameOptions {
  width: number;
  height: number;
  theme: Theme;
  seed: number;
  title?: string;
  titleIcon?: string; // rendered by caller (markup) — placed left of title
  hideBorder?: boolean;
  hideTitle?: boolean;
  /** which embedded fonts to include */
  fonts?: ("hand" | "title" | "kalam")[];
  /** decorative doodles in corners */
  doodles?: boolean;
  /** extra defs markup */
  defs?: string;
  /** accessible description */
  desc?: string;
  /** compact padding */
  padding?: number;
  /** animate=false disables the draw-in animation */
  animate?: boolean;
  /** set false to skip the bottom-left squiggle (cards that draw text there) */
  bottomDoodle?: boolean;
}

export function fontFaces(fonts: FrameOptions["fonts"] = ["hand", "title"]): string {
  const faces: string[] = [];
  if (fonts.includes("hand")) faces.push(`@font-face{font-family:'PatrickHand';src:url(data:font/woff2;base64,${patrickHandBase64}) format('woff2');font-weight:400;font-style:normal;}`);
  if (fonts.includes("title")) faces.push(`@font-face{font-family:'CaveatBold';src:url(data:font/woff2;base64,${caveatBoldBase64}) format('woff2');font-weight:700;font-style:normal;}`);
  if (fonts.includes("kalam")) faces.push(`@font-face{font-family:'Kalam';src:url(data:font/woff2;base64,${kalamBase64}) format('woff2');font-weight:400;font-style:normal;}`);
  return faces.join("");
}

/**
 * Recolour rules for `prefers-color-scheme: dark`.
 *
 * The body is drawn once, in the light palette. A CSS rule beats a presentation attribute on
 * specificity, so matching each literal colour with an attribute selector re-paints the card
 * without duplicating a single path. If the media query never matches — or CSS is dropped
 * entirely — the light card that is already there stays correct.
 */
function darkModeCss(t: Theme): string {
  const d = t.autoDark;
  if (!d) return "";
  const pairs: [string, string][] = [
    [t.bg, d.bg],
    [t.ink, d.ink],
    [t.accent, d.accent],
    [t.accent2, d.accent2],
    [t.muted, d.muted],
    [t.gridColor, d.gridColor],
  ];
  const seen = new Set<string>();
  const rules: string[] = [];
  for (const [light, dark] of pairs) {
    // Two theme roles can resolve to the same literal; the first mapping wins so a single
    // colour is never re-declared with conflicting values.
    if (!light || light === dark || seen.has(light.toLowerCase())) continue;
    seen.add(light.toLowerCase());
    rules.push(`[fill="${light}"]{fill:${dark}}[stroke="${light}"]{stroke:${dark}}`);
  }
  return rules.length ? `@media (prefers-color-scheme:dark){${rules.join("")}}` : "";
}

function gridPattern(theme: Theme, id: string): { defs: string; fill: string } {
  const c = theme.gridColor;
  switch (theme.grid) {
    case "dots":
      return { defs: `<pattern id="${id}" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="1.1" fill="${c}"/></pattern>`, fill: `url(#${id})` };
    case "lines":
      return { defs: `<pattern id="${id}" width="24" height="24" patternUnits="userSpaceOnUse"><line x1="0" y1="23.5" x2="24" y2="23.5" stroke="${c}" stroke-width="1"/></pattern>`, fill: `url(#${id})` };
    case "grid":
      return {
        defs: `<pattern id="${id}" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0 H0 V20" fill="none" stroke="${c}" stroke-width="0.8"/></pattern>`,
        fill: `url(#${id})`,
      };
    default:
      return { defs: "", fill: "none" };
  }
}

/**
 * Wraps body markup in a complete hand-drawn card SVG.
 * Returns the SVG string.
 */
export function frame(o: FrameOptions, body: string): string {
  const { width: W, height: H, theme: t } = o;
  const sk = new Sketch(o.seed);
  const pad = o.padding ?? 8;
  const gid = `g${o.seed % 9973}`;
  const grid = gridPattern(t, gid);
  const parts: string[] = [];

  // background paper
  parts.push(`<rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="${t.bg}"/>`);
  if (grid.fill !== "none") parts.push(`<rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="${grid.fill}"/>`);
  if (t.grid === "lines") {
    // red margin line like a notebook
    parts.push(`<line x1="34" y1="0" x2="34" y2="${H}" stroke="${t.accent}" stroke-width="1.2" opacity="0.5"/>`);
  }

  // hand-drawn border with offset "shadow" stroke
  if (!o.hideBorder) {
    parts.push(
      sk.roundRect(pad + 3, pad + 4, W - pad * 2 - 4, H - pad * 2 - 4, 10, { stroke: t.ink, strokeWidth: 2, roughness: 1.3, opacity: 0.22, double: false }),
    );
    parts.push(sk.roundRect(pad, pad, W - pad * 2, H - pad * 2, 10, { stroke: t.ink, strokeWidth: 2.2, roughness: 1.4 }));
  }

  // title
  let bodyOffset = 0;
  if (o.title && !o.hideTitle) {
    const tx = pad + 22 + (o.titleIcon ? 30 : 0);
    const ty = pad + 32;
    const size = 26;
    const title = truncate(o.title, W - tx - 30, size, "title");
    const tw = measure(title, size, "title");
    parts.push(sk.highlight(tx - 6, ty - 14, tw + 12, 16, t.accent, 0.5));
    if (o.titleIcon) parts.push(`<g transform="translate(${pad + 18} ${ty - 20})">${o.titleIcon}</g>`);
    parts.push(text(tx, ty, title, { size, font: "title", fill: t.ink, weight: 700 }));
    parts.push(sk.underline(tx - 4, tx + tw + 6, ty + 7, { stroke: t.ink, strokeWidth: 1.8 }));
    bodyOffset = 0;
  }

  // corner doodles
  if (o.doodles !== false) {
    parts.push(sk.sparkle(W - pad - 22, pad + 18, 5, t.accent2));
    parts.push(sk.sparkle(W - pad - 34, pad + 30, 3, t.accent));
    if (o.bottomDoodle !== false) parts.push(sk.squiggle(pad + 16, H - pad - 12, 42, 3, t.accent2));
  }

  const anim = o.animate === false ? "" : `<style>@keyframes db-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}} .db-body{animation:db-in .55s ease-out both}</style>`;
  const desc = o.desc ? `<desc>${esc(o.desc)}</desc>` : "";

  const dark = darkModeCss(t);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.title ?? "Doodlebug card")}">${desc}<defs><style>${fontFaces(o.fonts)}${dark}</style>${grid.defs}${o.defs ?? ""}</defs>${anim}${parts.join("")}<g class="db-body" transform="translate(0 ${r(bodyOffset)})">${body}</g></svg>`;
}

/** Card shown when something goes wrong (user not found, rate limit, ...). */
export function errorCard(theme: Theme, title: string, message: string, hint?: string): string {
  const W = 420,
    H = 130;
  const sk = new Sketch(7);
  const body: string[] = [];
  body.push(sk.circle(48, 66, 40, { stroke: theme.ink, fill: theme.accent, fillStyle: "solid", fillOpacity: 0.7, roughness: 1.4 }));
  body.push(text(48, 76, ":(", { size: 30, font: "title", fill: theme.ink, anchor: "middle" }));
  body.push(text(100, 60, truncate(title, 290, 24, "title"), { size: 24, font: "title", fill: theme.ink }));
  body.push(text(100, 84, truncate(message, 300, 15), { size: 15, fill: theme.ink }));
  if (hint) body.push(text(100, 104, truncate(hint, 300, 13), { size: 13, fill: theme.muted }));
  return frame({ width: W, height: H, theme, seed: 7, doodles: false, fonts: ["hand", "title"] }, body.join(""));
}
