export interface Theme {
  key: string;
  label: string;
  /** page/paper colour */
  bg: string;
  /** pen colour (strokes + text) */
  ink: string;
  /** primary highlight (marker) */
  accent: string;
  /** secondary highlight */
  accent2: string;
  /** secondary text */
  muted: string;
  /** background decoration */
  grid: "none" | "dots" | "lines" | "grid";
  /** colour of the grid decoration */
  gridColor: string;
  dark: boolean;
}

export const THEMES: Record<string, Theme> = {
  paper: { key: "paper", label: "Paper", bg: "#fffdf7", ink: "#2b2b2b", accent: "#f7b32b", accent2: "#2a9d8f", muted: "#8a8070", grid: "none", gridColor: "#e9e2d0", dark: false },
  notebook: { key: "notebook", label: "Notebook", bg: "#fcfcf7", ink: "#1f2a44", accent: "#e63946", accent2: "#457b9d", muted: "#6b7280", grid: "lines", gridColor: "#bcd3ea", dark: false },
  grid: { key: "grid", label: "Graph paper", bg: "#f7fbff", ink: "#22313f", accent: "#ff7b54", accent2: "#3aa17e", muted: "#6b7c8a", grid: "grid", gridColor: "#cfe3f5", dark: false },
  sticky: { key: "sticky", label: "Sticky note", bg: "#fff59d", ink: "#3d3400", accent: "#f28c28", accent2: "#6a994e", muted: "#7a6f2a", grid: "none", gridColor: "#f0e57a", dark: false },
  kraft: { key: "kraft", label: "Kraft paper", bg: "#dfc39c", ink: "#3b2a1a", accent: "#b23a48", accent2: "#2f6f73", muted: "#7a5c3a", grid: "dots", gridColor: "#cfae82", dark: false },
  sakura: { key: "sakura", label: "Sakura", bg: "#fff0f3", ink: "#4a2b3a", accent: "#ff8fab", accent2: "#7bb7a5", muted: "#9a7a88", grid: "dots", gridColor: "#f6d3dc", dark: false },
  forest: { key: "forest", label: "Forest", bg: "#eef5ea", ink: "#1f3b2b", accent: "#d67f2c", accent2: "#4d8b5f", muted: "#6b8a75", grid: "none", gridColor: "#d5e5cf", dark: false },
  ocean: { key: "ocean", label: "Ocean", bg: "#e9f6fb", ink: "#10394d", accent: "#f2a541", accent2: "#1e88a8", muted: "#5b7d8c", grid: "dots", gridColor: "#c8e4ef", dark: false },
  candy: { key: "candy", label: "Candy", bg: "#fdf1ff", ink: "#3a1e4d", accent: "#ff5da2", accent2: "#37b6ff", muted: "#8f6fa3", grid: "none", gridColor: "#f0d9f7", dark: false },
  chalkboard: { key: "chalkboard", label: "Chalkboard", bg: "#26402f", ink: "#f4f1e8", accent: "#ffd166", accent2: "#8ecae6", muted: "#b9c7bb", grid: "none", gridColor: "#33513e", dark: true },
  blueprint: { key: "blueprint", label: "Blueprint", bg: "#1e4a8a", ink: "#eaf2ff", accent: "#ffd166", accent2: "#a8dadc", muted: "#b6c9e6", grid: "grid", gridColor: "#2c5c9f", dark: true },
  midnight: { key: "midnight", label: "Midnight", bg: "#1b1b2f", ink: "#eae6ff", accent: "#ff6b6b", accent2: "#4ecdc4", muted: "#a49fc4", grid: "dots", gridColor: "#2c2c48", dark: true },
  graphite: { key: "graphite", label: "Graphite", bg: "#2b2b2b", ink: "#f0f0f0", accent: "#ffd60a", accent2: "#80ed99", muted: "#b0b0b0", grid: "none", gridColor: "#3a3a3a", dark: true },
  dracula: { key: "dracula", label: "Dracula", bg: "#282a36", ink: "#f8f8f2", accent: "#ff79c6", accent2: "#50fa7b", muted: "#9aa0c9", grid: "none", gridColor: "#343746", dark: true },
};

export const THEME_KEYS = Object.keys(THEMES);

const HEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
export function parseHex(v: string | null | undefined): string | null {
  if (!v) return null;
  const m = HEX.exec(v.trim());
  if (!m) return null;
  return "#" + m[1];
}

/** Resolve theme + optional per-colour overrides from query params. */
export function resolveTheme(params: URLSearchParams): Theme {
  const base = THEMES[(params.get("theme") || "paper").toLowerCase()] ?? THEMES.paper;
  const t: Theme = { ...base };
  const bg = parseHex(params.get("bg"));
  const ink = parseHex(params.get("ink"));
  const accent = parseHex(params.get("accent"));
  const accent2 = parseHex(params.get("accent2"));
  const muted = parseHex(params.get("muted"));
  if (bg) t.bg = bg;
  if (ink) t.ink = ink;
  if (accent) t.accent = accent;
  if (accent2) t.accent2 = accent2;
  if (muted) t.muted = muted;
  const grid = params.get("grid");
  if (grid && ["none", "dots", "lines", "grid"].includes(grid)) t.grid = grid as Theme["grid"];
  return t;
}
