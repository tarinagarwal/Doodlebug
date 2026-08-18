import type { Sketch } from "./draw";

/**
 * Line icons in a 24x24 box, drawn as SVG path data and roughened by rough.js
 * so they match the sketchy look of the rest of the card.
 */
export const ICONS: Record<string, string> = {
  star: "M12 2.5 L14.9 8.6 L21.5 9.4 L16.6 14 L17.9 20.6 L12 17.4 L6.1 20.6 L7.4 14 L2.5 9.4 L9.1 8.6 Z",
  fork: "M7 3.5 a2 2 0 1 0 0.01 0 M17 3.5 a2 2 0 1 0 0.01 0 M12 18.5 a2 2 0 1 0 0.01 0 M7 5.5 V9 c0 2 1.5 3 3.5 3 h3 c2 0 3.5-1 3.5-3 V5.5 M12 12 V16.5",
  commit: "M12 8 a4 4 0 1 0 0.01 0 M2 12 H8 M16 12 H22",
  pr: "M6 4 a2 2 0 1 0 0.01 0 M6 6 V20 M6 20 a2 2 0 1 0 0.01 0 M18 20 a2 2 0 1 0 0.01 0 M18 18 V10 c0-2-1-3-3-3 H11 M13 4.5 L10.5 7 L13 9.5",
  issue: "M12 3 a9 9 0 1 0 0.01 0 M12 7.5 V13 M12 16.2 v0.2",
  eye: "M2 12 C5 6.5 8.5 4.5 12 4.5 C15.5 4.5 19 6.5 22 12 C19 17.5 15.5 19.5 12 19.5 C8.5 19.5 5 17.5 2 12 Z M12 9 a3 3 0 1 0 0.01 0",
  heart: "M12 20 C6 15 3 12 3 8.5 C3 6 5 4 7.5 4 C9.5 4 11 5 12 6.5 C13 5 14.5 4 16.5 4 C19 4 21 6 21 8.5 C21 12 18 15 12 20 Z",
  fire: "M12 22 C7.5 22 4.5 19 4.5 15 C4.5 11.5 7 9.5 8.5 7.5 C9 9.5 10 10.5 11 11 C10.5 7.5 11.5 4.5 14 2 C14 5.5 16 7 17.5 9 C19 11 19.5 13 19.5 15 C19.5 19 16.5 22 12 22 Z M12 22 C10 22 8.5 20.5 8.5 18.5 C8.5 16.5 10 15.5 11 14 C11.5 15 12.5 15.5 13 15 C13.5 16 15.5 17 15.5 18.5 C15.5 20.5 14 22 12 22 Z",
  trophy: "M7 3 H17 V9 C17 12 15 14 12 14 C9 14 7 12 7 9 Z M7 5 H4 C4 8 5 10 7 10.5 M17 5 H20 C20 8 19 10 17 10.5 M12 14 V18 M8 21 H16 M9.5 18 H14.5 L15.5 21 H8.5 Z",
  calendar: "M4 6 H20 V21 H4 Z M4 10 H20 M8 3.5 V7.5 M16 3.5 V7.5 M8 14 h2 M14 14 h2 M8 17.5 h2 M14 17.5 h2",
  book: "M4 4 H10 C11.5 4 12 5 12 6 V20 C12 19 11.5 18 10 18 H4 Z M20 4 H14 C12.5 4 12 5 12 6 V20 C12 19 12.5 18 14 18 H20 Z",
  people: "M9 4 a3.5 3.5 0 1 0 0.01 0 M3 20 C3 15.5 5.5 13.5 9 13.5 C12.5 13.5 15 15.5 15 20 Z M16 5 a3 3 0 1 0 0.01 0 M16 13.5 C19 13.5 21 15.5 21 19.5",
  rocket: "M12 2.5 C15 4.5 16.5 8 16.5 12 L15 17 H9 L7.5 12 C7.5 8 9 4.5 12 2.5 Z M12 9 a2 2 0 1 0 0.01 0 M9 15 L5.5 18 L7 13 M15 15 L18.5 18 L17 13 M10 17.5 L12 21.5 L14 17.5",
  code: "M8 6 L2.5 12 L8 18 M16 6 L21.5 12 L16 18 M14 4 L10 20",
  repo: "M5 3 H19 V17 H8 C6.5 17 5 18 5 19.5 Z M5 19.5 C5 21 6.5 21 8 21 H19 V17 M9 7 h6 M9 10.5 h4",
  clock: "M12 3 a9 9 0 1 0 0.01 0 M12 7 V12.5 L15.5 14.5",
  pin: "M12 21 C12 21 5 13.5 5 9 A7 7 0 0 1 19 9 C19 13.5 12 21 12 21 Z M12 9 a2.5 2.5 0 1 0 0.01 0",
  bug: "M12 7 a4.5 4.5 0 1 0 0.01 0 M8 11 C6.5 13 6.5 17 8 19 C9.5 21 14.5 21 16 19 C17.5 17 17.5 13 16 11 M12 11 V21 M5 8 L8 10 M19 8 L16 10 M4 14 H7.5 M20 14 H16.5 M5.5 20 L8 17.5 M18.5 20 L16 17.5 M9.5 4 L8 2 M14.5 4 L16 2",
  coffee: "M5 8 H17 V15 C17 18 15 20 12 20 H10 C7 20 5 18 5 15 Z M17 10 H19 C20.5 10 21 11 21 12.5 C21 14 20.5 15 19 15 H17 M4 22 H18 M8 5 C8 4 9 3.5 9 2.5 M12 5 C12 4 13 3.5 13 2.5",
  bolt: "M13.5 2.5 L5 13.5 H11.5 L10.5 21.5 L19 10.5 H12.5 Z",
  branch: "M6 4 a2 2 0 1 0 0.01 0 M6 6 V20 M6 20 a2 2 0 1 0 0.01 0 M18 8 a2 2 0 1 0 0.01 0 M18 10 C18 14 6 12 6 16",
  check: "M12 3 a9 9 0 1 0 0.01 0 M7.5 12.5 L10.5 15.5 L16.5 9",
  folder: "M3 6 H9.5 L11.5 8.5 H21 V19.5 H3 Z",
  sparkle: "M12 3 C12.5 8 14 10.5 19 11 C14 11.5 12.5 14 12 19 C11.5 14 10 11.5 5 11 C10 10.5 11.5 8 12 3 Z",
  graph: "M3 20 H21 M3 20 V4 M6 16 L10 10 L13.5 13.5 L19 6",
  cat: "M5 8 L4 3 L9 6 H15 L20 3 L19 8 C21 12 20 18 12 18 C4 18 3 12 5 8 Z M9 11 a0.8 0.8 0 1 0 0.01 0 M15 11 a0.8 0.8 0 1 0 0.01 0 M11 14 H13 L12 15.2 Z M3 13 L8 13.5 M3 15.5 L8 15 M21 13 L16 13.5 M21 15.5 L16 15",
  pencil: "M4 20 L5 15.5 L16 4.5 L19.5 8 L8.5 19 Z M14 6.5 L17.5 10 M4 20 L8.5 19",
  moon: "M15 3 C10 3.5 6.5 7.5 6.5 12.5 C6.5 17.5 10.5 21 15.5 20.5 C12 19.5 10 16.5 10 12.5 C10 8.5 12 5 15 3 Z",
  globe: "M12 3 a9 9 0 1 0 0.01 0 M3 12 H21 M12 3 C9 6 9 18 12 21 M12 3 C15 6 15 18 12 21",
  mail: "M3 6 H21 V18 H3 Z M3 6 L12 13 L21 6",
  hash: "M9 3 L7 21 M17 3 L15 21 M4 9 H21 M3 15 H20",
  smile: "M12 3 a9 9 0 1 0 0.01 0 M8.5 10 v0.3 M15.5 10 v0.3 M8 14.5 C9.5 16.5 14.5 16.5 16 14.5",
  external: "M14 4 H20 V10 M20 4 L11 13 M18 14 V20 H4 V6 H10",
  link: "M10 14 a4 4 0 0 0 5.6 0 l3 -3 a4 4 0 0 0 -5.6 -5.6 l-1.5 1.5 M14 10 a4 4 0 0 0 -5.6 0 l-3 3 a4 4 0 0 0 5.6 5.6 l1.5 -1.5",
  linkedin: "M4 4 H20 V20 H4 Z M8 10.5 V17 M8 7.2 v0.2 M12 17 V10.5 M12 13.5 C12 11 16.5 11 16.5 13.5 V17",
  x: "M5 4 L19 20 M19 4 L5 20",
  instagram: "M4 4 H20 V20 H4 Z M12 8 a4 4 0 1 0 0.01 0 M17 7 v0.2",
  youtube: "M3 7 C3 5 4.5 4.5 12 4.5 C19.5 4.5 21 5 21 7 V17 C21 19 19.5 19.5 12 19.5 C4.5 19.5 3 19 3 17 Z M10 9 L15 12 L10 15 Z",
  briefcase: "M3 8 H21 V20 H3 Z M9 8 V5 H15 V8 M3 13 H21",
  doc: "M6 3 H14 L18 7 V21 H6 Z M14 3 V7 H18 M9 12 h6 M9 15 h6 M9 18 h4",
  phone: "M7 3 H17 V21 H7 Z M11 18 h2",
  discord: "M8 5 C10.5 4 13.5 4 16 5 L18 9 C19 12 19 15 18 18 L14 19.5 L13 17.5 H11 L10 19.5 L6 18 C5 15 5 12 6 9 Z M9.5 13 a1 1 0 1 0 0.01 0 M14.5 13 a1 1 0 1 0 0.01 0",
  medium: "M4 6 H20 V18 H4 Z M8 9 L12 15 L16 9",
  dev: "M4 6 H20 V18 H4 Z M8 9 V15 C10 15 10.5 9 8 9 Z M13 9 L14.5 15 L16 9",
  npm: "M3 7 H21 V17 H3 Z M7 10 V14 M11 10 V14 M15 10 V14 M11 12 H15",
};

export type IconKey = keyof typeof ICONS;

/**
 * Renders an icon at (x, y) with size `s` (px). Applies rough.js so strokes wobble.
 */
export function icon(sk: Sketch, name: string, x: number, y: number, s: number, color: string, opts?: { fill?: string; strokeWidth?: number; roughness?: number }): string {
  const d = ICONS[name] ?? ICONS.star;
  const scale = s / 24;
  const inner = sk.path(d, {
    stroke: color,
    strokeWidth: (opts?.strokeWidth ?? 1.9) / scale,
    roughness: opts?.roughness ?? 0.9,
    fill: opts?.fill,
    fillStyle: "solid",
    double: false,
    bowing: 0.6,
  });
  return `<g transform="translate(${x} ${y}) scale(${scale})">${inner}</g>`;
}
