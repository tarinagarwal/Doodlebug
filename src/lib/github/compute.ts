import type { CalendarDay, Rank, RankLevel, StreakRange, StreakStats } from "./types";

/* ---------- Rank (adapted from the widely used github-readme-stats formula) ---------- */
function exponentialCdf(x: number): number {
  return 1 - Math.pow(2, -x);
}
function logNormalCdf(x: number): number {
  return x / (1 + x);
}

export function calculateRank(input: {
  allCommits: boolean;
  commits: number;
  prs: number;
  issues: number;
  reviews: number;
  stars: number;
  followers: number;
}): Rank {
  const COMMITS_MEDIAN = input.allCommits ? 1000 : 250;
  const COMMITS_WEIGHT = 2;
  const PRS_MEDIAN = 50,
    PRS_WEIGHT = 3;
  const ISSUES_MEDIAN = 25,
    ISSUES_WEIGHT = 1;
  const REVIEWS_MEDIAN = 2,
    REVIEWS_WEIGHT = 1;
  const STARS_MEDIAN = 50,
    STARS_WEIGHT = 4;
  const FOLLOWERS_MEDIAN = 10,
    FOLLOWERS_WEIGHT = 1;
  const TOTAL_WEIGHT = COMMITS_WEIGHT + PRS_WEIGHT + ISSUES_WEIGHT + REVIEWS_WEIGHT + STARS_WEIGHT + FOLLOWERS_WEIGHT;

  const rank =
    1 -
    (COMMITS_WEIGHT * exponentialCdf(input.commits / COMMITS_MEDIAN) +
      PRS_WEIGHT * exponentialCdf(input.prs / PRS_MEDIAN) +
      ISSUES_WEIGHT * exponentialCdf(input.issues / ISSUES_MEDIAN) +
      REVIEWS_WEIGHT * exponentialCdf(input.reviews / REVIEWS_MEDIAN) +
      STARS_WEIGHT * logNormalCdf(input.stars / STARS_MEDIAN) +
      FOLLOWERS_WEIGHT * logNormalCdf(input.followers / FOLLOWERS_MEDIAN)) /
      TOTAL_WEIGHT;

  const THRESHOLDS = [1, 12.5, 25, 37.5, 50, 62.5, 75, 87.5, 100];
  const LEVELS: RankLevel[] = ["S", "A+", "A", "A-", "B+", "B", "B-", "C+", "C"];
  const percentile = rank * 100;
  const level = LEVELS[THRESHOLDS.findIndex((t) => percentile <= t)] ?? "C";
  return { level, percentile: Math.round(percentile * 10) / 10 };
}

/* ---------- Streaks from a calendar ---------- */
function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * days: full history (oldest first) or at least last 365 days.
 */
export function computeStreaks(days: CalendarDay[]): Omit<StreakStats, "calendar" | "since"> {
  const sorted = [...days].sort((a, b) => (a.date < b.date ? -1 : 1));
  let total = 0;
  let first: string | null = null;
  let longest: StreakRange = { count: 0, start: null, end: null };
  let run: StreakRange = { count: 0, start: null, end: null };
  const today = todayIso();

  for (const d of sorted) {
    if (d.date > today) continue;
    total += d.count;
    if (d.count > 0) {
      if (!first) first = d.date;
      if (run.count > 0 && run.end && addDays(run.end, 1) === d.date) {
        run = { count: run.count + 1, start: run.start, end: d.date };
      } else {
        run = { count: 1, start: d.date, end: d.date };
      }
      if (run.count > longest.count) longest = { ...run };
    } else if (d.date < today) {
      // a zero day that is not today breaks the run (today may still be pending)
      run = { count: 0, start: null, end: null };
    }
  }

  // Current streak: run must reach today or yesterday
  let current: StreakRange = { count: 0, start: null, end: null };
  if (run.count > 0 && run.end && (run.end === today || run.end === addDays(today, -1))) current = run;

  return { totalContributions: total, firstContribution: first, currentStreak: current, longestStreak: longest };
}

/* ---------- Language colours (subset of GitHub Linguist) for the REST fallback ---------- */
export const LANG_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  HTML: "#e34c26",
  CSS: "#663399",
  SCSS: "#c6538c",
  Shell: "#89e051",
  PowerShell: "#012456",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Solidity: "#AA6746",
  Lua: "#000080",
  Scala: "#c22d40",
  Haskell: "#5e5086",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  R: "#198CE7",
  MATLAB: "#e16737",
  "Jupyter Notebook": "#DA5B0B",
  Dockerfile: "#384d54",
  Makefile: "#427819",
  CMake: "#DA3434",
  HCL: "#844FBA",
  Zig: "#ec915c",
  Nix: "#7e7eff",
  Perl: "#0298c3",
  "Objective-C": "#438eff",
  Assembly: "#6E4C13",
  GDScript: "#355570",
  ShaderLab: "#222c37",
  HLSL: "#aace60",
  GLSL: "#5686a5",
  Astro: "#ff5a03",
  MDX: "#fcb32c",
  EJS: "#a91e50",
  Blade: "#f7523f",
  Vim: "#199f4b",
  TeX: "#3D6117",
  Batchfile: "#C1F12E",
  "Vim Script": "#199f4b",
  Elm: "#60B5CC",
  OCaml: "#ef7a08",
  Erlang: "#B83998",
  Groovy: "#4298b8",
  Julia: "#a270ba",
  Crystal: "#000100",
  Nim: "#ffc200",
  "F#": "#b845fc",
  Prolog: "#74283c",
  Fortran: "#4d41b1",
  COBOL: "#005ca5",
  Pascal: "#E3F171",
  Verilog: "#b2b7f8",
  VHDL: "#adb2cb",
  Cuda: "#3A4E3A",
  "Rich Text Format": "#ccc",
  Handlebars: "#f7931e",
  Pug: "#a86454",
  Less: "#1d365d",
  Stylus: "#ff6347",
  WebAssembly: "#04133b",
  Mojo: "#ff4c1f",
  Odin: "#60AFFE",
  V: "#4f87c4",
  Gleam: "#ffaff3",
  Roc: "#7c38f5",
};

export function langColor(name: string | null | undefined, fallback = "#8b8b8b"): string {
  if (!name) return fallback;
  return LANG_COLORS[name] ?? fallback;
}
