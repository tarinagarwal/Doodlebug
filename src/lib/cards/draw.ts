import rough from "roughjs";
import type { Options } from "roughjs/bin/core";
import type { RoughGenerator } from "roughjs/bin/generator";
import { r } from "./text";

/**
 * Deterministic "hand-drawn" SVG primitives on top of rough.js.
 * Every shape returns a snippet of SVG markup (paths only).
 */
export interface SketchOpts {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillStyle?: "solid" | "hachure" | "zigzag" | "cross-hatch" | "dots" | "dashed" | "zigzag-line";
  fillWeight?: number;
  hachureGap?: number;
  hachureAngle?: number;
  roughness?: number;
  bowing?: number;
  opacity?: number;
  dash?: string;
  extra?: string;
  /** rough.js draws the outline twice by default; set false for a single lighter stroke */
  double?: boolean;
  fillOpacity?: number;
}

export class Sketch {
  private gen: RoughGenerator;
  private seed: number;
  private counter = 0;

  constructor(seed: number) {
    this.gen = rough.generator();
    this.seed = Math.max(1, Math.floor(seed) % 2147483646);
  }

  private nextSeed(): number {
    this.counter++;
    return ((this.seed * 9301 + this.counter * 49297) % 233280) + 1;
  }

  /** small deterministic pseudo-random in [0,1) */
  rand(): number {
    const s = this.nextSeed();
    const x = Math.sin(s * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }
  jitter(amount: number): number {
    return (this.rand() - 0.5) * 2 * amount;
  }

  private opts(o: SketchOpts): Options {
    return {
      seed: this.nextSeed(),
      stroke: o.stroke ?? "#000",
      strokeWidth: o.strokeWidth ?? 1.6,
      fill: o.fill,
      fillStyle: o.fillStyle ?? "solid",
      fillWeight: o.fillWeight ?? 1,
      hachureGap: o.hachureGap ?? 6,
      hachureAngle: o.hachureAngle ?? -41,
      roughness: o.roughness ?? 1.2,
      bowing: o.bowing ?? 1,
      disableMultiStroke: o.double === false,
      disableMultiStrokeFill: true,
      preserveVertices: false,
      curveFitting: 0.95,
      curveStepCount: 9,
    };
  }

  private toSvg(drawable: ReturnType<RoughGenerator["rectangle"]>, o: SketchOpts): string {
    const paths = this.gen.toPaths(drawable);
    const groupAttrs = [
      o.opacity !== undefined ? `opacity="${o.opacity}"` : "",
      `stroke-linecap="round"`,
      `stroke-linejoin="round"`,
      o.extra ?? "",
    ]
      .filter(Boolean)
      .join(" ");
    const inner = paths
      .map((p) => {
        const isFill = p.fill && p.fill !== "none";
        const attrs = [
          `d="${p.d}"`,
          `stroke="${p.stroke}"`,
          `stroke-width="${r(p.strokeWidth)}"`,
          `fill="${isFill ? p.fill : "none"}"`,
          isFill && o.fillOpacity !== undefined ? `fill-opacity="${o.fillOpacity}"` : "",
          !isFill && o.dash ? `stroke-dasharray="${o.dash}"` : "",
        ]
          .filter(Boolean)
          .join(" ");
        return `<path ${attrs}/>`;
      })
      .join("");
    return `<g ${groupAttrs}>${inner}</g>`;
  }

  rect(x: number, y: number, w: number, h: number, o: SketchOpts = {}): string {
    return this.toSvg(this.gen.rectangle(x, y, w, h, this.opts(o)), o);
  }
  /** rectangle with rounded-ish corners approximated by a polygon of arcs (looks softer) */
  roundRect(x: number, y: number, w: number, h: number, rad: number, o: SketchOpts = {}): string {
    const d = `M${x + rad},${y} L${x + w - rad},${y} Q${x + w},${y} ${x + w},${y + rad} L${x + w},${y + h - rad} Q${x + w},${y + h} ${x + w - rad},${y + h} L${x + rad},${y + h} Q${x},${y + h} ${x},${y + h - rad} L${x},${y + rad} Q${x},${y} ${x + rad},${y} Z`;
    return this.path(d, o);
  }
  ellipse(cx: number, cy: number, w: number, h: number, o: SketchOpts = {}): string {
    return this.toSvg(this.gen.ellipse(cx, cy, w, h, this.opts(o)), o);
  }
  circle(cx: number, cy: number, d: number, o: SketchOpts = {}): string {
    return this.toSvg(this.gen.circle(cx, cy, d, this.opts(o)), o);
  }
  line(x1: number, y1: number, x2: number, y2: number, o: SketchOpts = {}): string {
    return this.toSvg(this.gen.line(x1, y1, x2, y2, this.opts(o)), o);
  }
  polygon(pts: [number, number][], o: SketchOpts = {}): string {
    return this.toSvg(this.gen.polygon(pts, this.opts(o)), o);
  }
  linearPath(pts: [number, number][], o: SketchOpts = {}): string {
    return this.toSvg(this.gen.linearPath(pts, this.opts(o)), o);
  }
  curve(pts: [number, number][], o: SketchOpts = {}): string {
    return this.toSvg(this.gen.curve(pts, this.opts(o)), o);
  }
  arc(cx: number, cy: number, w: number, h: number, start: number, stop: number, closed = false, o: SketchOpts = {}): string {
    return this.toSvg(this.gen.arc(cx, cy, w, h, start, stop, closed, this.opts(o)), o);
  }
  path(d: string, o: SketchOpts = {}): string {
    return this.toSvg(this.gen.path(d, this.opts(o)), o);
  }

  /* ---------------- decorative doodles ---------------- */

  /** wobbly marker underline */
  underline(x1: number, x2: number, y: number, o: SketchOpts = {}): string {
    const mid = (x1 + x2) / 2;
    return this.curve(
      [
        [x1, y + this.jitter(1.5)],
        [mid, y + 2 + this.jitter(1.5)],
        [x2, y + this.jitter(1.5)],
      ],
      { strokeWidth: 2.2, roughness: 1.4, double: false, ...o },
    );
  }

  /** marker highlight behind text (a chunky, slightly rotated bar) */
  highlight(x: number, y: number, w: number, h: number, color: string, opacity = 0.55): string {
    const rot = this.jitter(1.2);
    return this.rect(x, y, w, h, {
      stroke: "none",
      fill: color,
      fillStyle: "solid",
      roughness: 0.8,
      fillOpacity: opacity,
      extra: `transform="rotate(${r(rot)} ${r(x + w / 2)} ${r(y + h / 2)})"`,
    });
  }

  /** 4-point sparkle */
  sparkle(cx: number, cy: number, s: number, color: string, sw = 1.6): string {
    const d = `M${cx},${cy - s} Q${cx + s * 0.15},${cy - s * 0.15} ${cx + s},${cy} Q${cx + s * 0.15},${cy + s * 0.15} ${cx},${cy + s} Q${cx - s * 0.15},${cy + s * 0.15} ${cx - s},${cy} Q${cx - s * 0.15},${cy - s * 0.15} ${cx},${cy - s} Z`;
    return this.path(d, { stroke: color, strokeWidth: sw, fill: color, fillStyle: "solid", roughness: 0.6, double: false });
  }

  /** 5-point star outline (optionally filled) */
  star(cx: number, cy: number, s: number, o: SketchOpts = {}): string {
    const pts: [number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? s : s * 0.45;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
    }
    return this.polygon(pts, { roughness: 0.9, ...o });
  }

  /** little squiggle (like a scribble) */
  squiggle(x: number, y: number, w: number, amp = 4, color = "#000"): string {
    const pts: [number, number][] = [];
    const n = Math.max(4, Math.round(w / 8));
    for (let i = 0; i <= n; i++) pts.push([x + (w * i) / n, y + (i % 2 === 0 ? -amp : amp)]);
    return this.curve(pts, { stroke: color, strokeWidth: 1.6, roughness: 0.8, double: false });
  }

  /** hand-drawn arrow from a to b with a curved shaft */
  arrow(x1: number, y1: number, x2: number, y2: number, color = "#000", bend = 0.25): string {
    const mx = (x1 + x2) / 2 + (y2 - y1) * bend;
    const my = (y1 + y2) / 2 - (x2 - x1) * bend;
    const shaft = this.curve([[x1, y1], [mx, my], [x2, y2]], { stroke: color, strokeWidth: 1.8, roughness: 1, double: false });
    const ang = Math.atan2(y2 - my, x2 - mx);
    const hl = 9;
    const p1: [number, number] = [x2 - Math.cos(ang - 0.5) * hl, y2 - Math.sin(ang - 0.5) * hl];
    const p2: [number, number] = [x2 - Math.cos(ang + 0.5) * hl, y2 - Math.sin(ang + 0.5) * hl];
    const head = this.linearPath([p1, [x2, y2], p2], { stroke: color, strokeWidth: 1.8, roughness: 0.8, double: false });
    return shaft + head;
  }

  /** a strip of masking tape */
  tape(cx: number, cy: number, w: number, angle: number, color = "#e8d9a0"): string {
    const h = 14;
    return `<g transform="rotate(${r(angle)} ${r(cx)} ${r(cy)})" opacity="0.85">${this.rect(cx - w / 2, cy - h / 2, w, h, {
      stroke: "rgba(0,0,0,0.18)",
      strokeWidth: 1,
      fill: color,
      fillStyle: "solid",
      roughness: 0.6,
      double: false,
    })}</g>`;
  }

  /** hand-drawn check mark */
  check(x: number, y: number, s: number, color: string): string {
    return this.linearPath(
      [
        [x, y + s * 0.5],
        [x + s * 0.38, y + s * 0.9],
        [x + s, y],
      ],
      { stroke: color, strokeWidth: 2.2, roughness: 0.8, double: false },
    );
  }

  /** small heart */
  heart(cx: number, cy: number, s: number, o: SketchOpts = {}): string {
    const d = `M${cx},${cy + s * 0.75} C${cx - s * 1.2},${cy - s * 0.1} ${cx - s * 0.6},${cy - s * 0.9} ${cx},${cy - s * 0.35} C${cx + s * 0.6},${cy - s * 0.9} ${cx + s * 1.2},${cy - s * 0.1} ${cx},${cy + s * 0.75} Z`;
    return this.path(d, { roughness: 0.7, ...o });
  }
}

export function seedFrom(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) % 100000;
}
