import type { Sketch } from "./draw";

/**
 * Doodlebug mascot — a friendly ladybug-ish beetle holding a pencil.
 * Drawn with rough.js so it matches the card style. Box is ~100x100 at scale 1.
 */
export function mascot(sk: Sketch, x: number, y: number, scale: number, ink: string, accent: string, accent2: string, bg: string): string {
  const parts: string[] = [];
  // legs
  const legs: [number, number, number, number][] = [
    [30, 62, 14, 74],
    [30, 70, 12, 84],
    [70, 62, 86, 74],
    [70, 70, 88, 84],
    [34, 78, 22, 92],
    [66, 78, 78, 92],
  ];
  for (const [x1, y1, x2, y2] of legs) parts.push(sk.line(x1, y1, x2, y2, { stroke: ink, strokeWidth: 2.2, roughness: 1, double: false }));
  // body
  parts.push(sk.ellipse(50, 66, 46, 44, { stroke: ink, strokeWidth: 2.4, fill: accent, fillStyle: "solid", roughness: 1.2 }));
  // wing split
  parts.push(sk.line(50, 46, 50, 88, { stroke: ink, strokeWidth: 1.8, roughness: 1.2, double: false }));
  // spots
  for (const [sx, sy, sd] of [
    [38, 60, 8],
    [62, 60, 8],
    [42, 76, 6],
    [60, 78, 7],
  ] as [number, number, number][]) {
    parts.push(sk.circle(sx, sy, sd, { stroke: ink, strokeWidth: 1.4, fill: ink, fillStyle: "solid", roughness: 0.8, double: false }));
  }
  // head
  parts.push(sk.circle(50, 38, 30, { stroke: ink, strokeWidth: 2.4, fill: bg, fillStyle: "solid", roughness: 1.2 }));
  // antennae
  parts.push(sk.curve([[40, 26], [34, 14], [28, 10]], { stroke: ink, strokeWidth: 2, roughness: 1, double: false }));
  parts.push(sk.curve([[60, 26], [66, 14], [72, 10]], { stroke: ink, strokeWidth: 2, roughness: 1, double: false }));
  parts.push(sk.circle(28, 10, 5, { stroke: ink, strokeWidth: 1.2, fill: accent2, fillStyle: "solid", roughness: 0.6, double: false }));
  parts.push(sk.circle(72, 10, 5, { stroke: ink, strokeWidth: 1.2, fill: accent2, fillStyle: "solid", roughness: 0.6, double: false }));
  // eyes
  parts.push(sk.circle(43, 36, 9, { stroke: ink, strokeWidth: 1.4, fill: "#fff", fillStyle: "solid", roughness: 0.6, double: false }));
  parts.push(sk.circle(57, 36, 9, { stroke: ink, strokeWidth: 1.4, fill: "#fff", fillStyle: "solid", roughness: 0.6, double: false }));
  parts.push(sk.circle(44.5, 37, 4, { stroke: ink, strokeWidth: 1, fill: ink, fillStyle: "solid", roughness: 0.4, double: false }));
  parts.push(sk.circle(58.5, 37, 4, { stroke: ink, strokeWidth: 1, fill: ink, fillStyle: "solid", roughness: 0.4, double: false }));
  // smile + blush
  parts.push(sk.curve([[44, 45], [50, 49], [56, 45]], { stroke: ink, strokeWidth: 1.8, roughness: 0.8, double: false }));
  parts.push(sk.ellipse(38, 44, 6, 3, { stroke: "none", fill: accent, fillStyle: "solid", roughness: 0.4, opacity: 0.6 }));
  parts.push(sk.ellipse(62, 44, 6, 3, { stroke: "none", fill: accent, fillStyle: "solid", roughness: 0.4, opacity: 0.6 }));
  // pencil held on the right
  parts.push(sk.polygon(
    [
      [76, 52],
      [96, 32],
      [100, 36],
      [80, 56],
    ],
    { stroke: ink, strokeWidth: 1.6, fill: accent2, fillStyle: "solid", roughness: 0.8, double: false },
  ));
  parts.push(sk.polygon(
    [
      [76, 52],
      [80, 56],
      [72, 58],
    ],
    { stroke: ink, strokeWidth: 1.4, fill: "#f4d7b0", fillStyle: "solid", roughness: 0.6, double: false },
  ));
  return `<g transform="translate(${x} ${y}) scale(${scale})">${parts.join("")}</g>`;
}
