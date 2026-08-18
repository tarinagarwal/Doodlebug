/**
 * Client-safe metadata about cards: types, docs and builder controls.
 * (No server-only imports here.)
 */
export const CARD_TYPES = ["stats", "langs", "streak", "activity", "graph", "trophies", "repo", "banner", "skills", "note"] as const;
export type CardType = (typeof CARD_TYPES)[number];

export interface ParamDoc {
  name: string;
  desc: string;
  example?: string;
}

export type Control =
  | { kind: "text"; key: string; label: string; placeholder?: string; hint?: string; max?: number }
  | { kind: "number"; key: string; label: string; min: number; max: number; def: number; hint?: string }
  | { kind: "toggle"; key: string; label: string; def: boolean; hint?: string; invert?: boolean }
  | { kind: "select"; key: string; label: string; options: { value: string; label: string }[]; def: string; hint?: string }
  | { kind: "multi"; key: string; label: string; options: { value: string; label: string }[]; hint?: string };

export interface CardMeta {
  type: CardType;
  label: string;
  blurb: string;
  needsUser: boolean;
  params: ParamDoc[];
  controls: Control[];
}

const COMMON_PARAMS: ParamDoc[] = [
  { name: "theme", desc: "Colour theme", example: "chalkboard" },
  { name: "bg / ink / accent / accent2 / muted", desc: "Override any theme colour (hex, no #)", example: "accent=ff5da2" },
  { name: "grid", desc: "Background decoration: none, dots, lines, grid" },
  { name: "hide_border", desc: "Remove the sketched border", example: "true" },
  { name: "hide_title", desc: "Remove the title" },
  { name: "title", desc: "Custom title text" },
  { name: "doodles", desc: "false removes decorative sparkles/squiggles" },
  { name: "animate", desc: "false disables the fade-in" },
  { name: "seed", desc: "Any string — changes the wobble pattern" },
];

const COMMON_CONTROLS: Control[] = [
  { kind: "text", key: "title", label: "Custom title", placeholder: "leave empty for default", max: 60 },
  { kind: "toggle", key: "hide_title", label: "Hide title", def: false },
  { kind: "toggle", key: "hide_border", label: "Hide border", def: false },
  { kind: "toggle", key: "doodles", label: "Decorative doodles", def: true, invert: true },
  { kind: "toggle", key: "animate", label: "Fade-in animation", def: true, invert: true },
];

export const CARD_META: CardMeta[] = [
  {
    type: "stats",
    label: "Stats",
    blurb: "Stars, commits, PRs, issues and a hand-drawn rank ring.",
    needsUser: true,
    params: [
      { name: "hide", desc: "Comma list: stars, commits, prs, issues, contribs" },
      { name: "show", desc: "Extras: merged, reviews, followers, repos, forks" },
      { name: "commits", desc: "all (default, all-time) or year" },
      { name: "hide_rank", desc: "Hide the rank ring" },
      { name: "show_icons", desc: "false to hide row icons" },
      ...COMMON_PARAMS,
    ],
    controls: [
      {
        kind: "multi",
        key: "hide",
        label: "Hide rows",
        options: [
          { value: "stars", label: "Stars" },
          { value: "commits", label: "Commits" },
          { value: "prs", label: "PRs" },
          { value: "issues", label: "Issues" },
          { value: "contribs", label: "Contributed to" },
        ],
      },
      {
        kind: "multi",
        key: "show",
        label: "Extra rows",
        options: [
          { value: "merged", label: "Merged PRs" },
          { value: "reviews", label: "Reviews" },
          { value: "followers", label: "Followers" },
          { value: "repos", label: "Repos" },
          { value: "forks", label: "Forks" },
        ],
      },
      { kind: "select", key: "commits", label: "Commit count", def: "all", options: [{ value: "all", label: "All-time" }, { value: "year", label: "This year" }] },
      { kind: "toggle", key: "hide_rank", label: "Hide rank ring", def: false },
      { kind: "toggle", key: "show_icons", label: "Row icons", def: true, invert: true },
      ...COMMON_CONTROLS,
    ],
  },
  {
    type: "langs",
    label: "Top languages",
    blurb: "Your most used languages as sketched bars, a donut, a pie or a compact strip.",
    needsUser: true,
    params: [
      { name: "layout", desc: "bars (default), donut, pie, compact" },
      { name: "langs_count", desc: "1–12 languages", example: "8" },
      { name: "hide", desc: "Comma list of languages to skip", example: "html,css" },
      ...COMMON_PARAMS,
    ],
    controls: [
      {
        kind: "select",
        key: "layout",
        label: "Layout",
        def: "bars",
        options: [
          { value: "bars", label: "Bars" },
          { value: "donut", label: "Donut" },
          { value: "pie", label: "Pie" },
          { value: "compact", label: "Compact" },
        ],
      },
      { kind: "number", key: "langs_count", label: "Languages", min: 1, max: 12, def: 6 },
      { kind: "text", key: "hide", label: "Hide languages", placeholder: "html,css,jupyter notebook", hint: "comma separated" },
      ...COMMON_CONTROLS,
    ],
  },
  {
    type: "streak",
    label: "Streak",
    blurb: "Total contributions, current streak in a flame ring, and longest streak.",
    needsUser: true,
    params: [...COMMON_PARAMS],
    controls: [...COMMON_CONTROLS],
  },
  {
    type: "activity",
    label: "Contribution doodle",
    blurb: "A wobbly heatmap of your recent contributions.",
    needsUser: true,
    params: [{ name: "weeks", desc: "8–53 weeks to show", example: "40" }, { name: "legend", desc: "false to hide the less/more legend" }, ...COMMON_PARAMS],
    controls: [{ kind: "number", key: "weeks", label: "Weeks", min: 8, max: 53, def: 30 }, { kind: "toggle", key: "legend", label: "Legend", def: true, invert: true }, ...COMMON_CONTROLS],
  },
  {
    type: "graph",
    label: "Activity graph",
    blurb: "A hand-drawn line chart of daily contributions.",
    needsUser: true,
    params: [{ name: "days", desc: "7–120 days", example: "60" }, ...COMMON_PARAMS],
    controls: [{ kind: "number", key: "days", label: "Days", min: 7, max: 120, def: 30 }, ...COMMON_CONTROLS],
  },
  {
    type: "trophies",
    label: "Trophies",
    blurb: "Sketched shields ranked C → SS for stars, commits, PRs, streaks…",
    needsUser: true,
    params: [
      { name: "columns", desc: "1–9 shields per row" },
      { name: "hide", desc: "Comma list: stars, commits, prs, issues, followers, repos, streak" },
      { name: "show", desc: "Extras: reviews, forks" },
      { name: "title", desc: "Optional title (no title by default)" },
      ...COMMON_PARAMS.filter((p) => p.name !== "title"),
    ],
    controls: [
      { kind: "number", key: "columns", label: "Columns", min: 1, max: 9, def: 7 },
      {
        kind: "multi",
        key: "hide",
        label: "Hide trophies",
        options: [
          { value: "stars", label: "Stargazer" },
          { value: "commits", label: "Committer" },
          { value: "prs", label: "PR Hero" },
          { value: "issues", label: "Issue Hunter" },
          { value: "followers", label: "Popular" },
          { value: "repos", label: "Builder" },
          { value: "streak", label: "On Fire" },
        ],
      },
      {
        kind: "multi",
        key: "show",
        label: "Extra trophies",
        options: [
          { value: "reviews", label: "Reviewer" },
          { value: "forks", label: "Forked" },
        ],
      },
      { kind: "text", key: "title", label: "Title", placeholder: "none by default", max: 60 },
      ...COMMON_CONTROLS.filter((c) => c.key !== "title" && c.key !== "hide_title"),
    ],
  },
  {
    type: "repo",
    label: "Repo pin",
    blurb: "Pin any repository: description, language, stars, forks, topics.",
    needsUser: true,
    params: [{ name: "repo", desc: "Repository name (required)", example: "my-project" }, { name: "show_owner", desc: "Prefix owner/" }, ...COMMON_PARAMS.filter((p) => !["title", "hide_title"].includes(p.name))],
    controls: [
      { kind: "text", key: "repo", label: "Repository name", placeholder: "my-project", hint: "must belong to the username above" },
      { kind: "toggle", key: "show_owner", label: "Show owner/", def: false },
      ...COMMON_CONTROLS.filter((c) => c.key !== "title" && c.key !== "hide_title"),
    ],
  },
  {
    type: "banner",
    label: "Banner",
    blurb: "A wide hand-drawn header for the top of your README.",
    needsUser: false,
    params: [
      { name: "name", desc: "Big text (defaults to your GitHub name)" },
      { name: "text", desc: "Tagline (defaults to your bio)" },
      { name: "subtitle", desc: "Small secondary line" },
      { name: "icons", desc: "Comma list of doodle icons", example: "code,rocket,coffee,star" },
      { name: "mascot", desc: "false to hide the Doodlebug mascot" },
      { name: "align", desc: "center (default) or left" },
      { name: "width / height", desc: "Size in px (default 900×230)" },
      ...COMMON_PARAMS.filter((p) => !["title", "hide_title"].includes(p.name)),
    ],
    controls: [
      { kind: "text", key: "name", label: "Name", placeholder: "defaults to your GitHub name", max: 40 },
      { kind: "text", key: "text", label: "Tagline", placeholder: "defaults to your bio", max: 140 },
      { kind: "text", key: "subtitle", label: "Subtitle", placeholder: "optional small line", max: 100 },
      { kind: "text", key: "icons", label: "Doodle icons", placeholder: "code,rocket,coffee,star,heart", hint: "see icon list in docs" },
      { kind: "select", key: "align", label: "Align", def: "center", options: [{ value: "center", label: "Center" }, { value: "left", label: "Left" }] },
      { kind: "toggle", key: "mascot", label: "Show mascot", def: true, invert: true },
      { kind: "number", key: "width", label: "Width", min: 400, max: 1400, def: 900 },
      { kind: "number", key: "height", label: "Height", min: 140, max: 500, def: 230 },
      { kind: "toggle", key: "hide_border", label: "Hide border", def: false },
      { kind: "toggle", key: "animate", label: "Fade-in animation", def: true, invert: true },
    ],
  },
  {
    type: "skills",
    label: "Skill stickers",
    blurb: "Your stack as sketched stickers — no GitHub data required.",
    needsUser: false,
    params: [
      { name: "skills", desc: "Comma list", example: "TypeScript,React,Go" },
      { name: "icons", desc: "name:icon pairs", example: "Go:bolt,React:code" },
      { name: "columns", desc: "Fixed columns (default: flow)" },
      { name: "width", desc: "Card width" },
      ...COMMON_PARAMS,
    ],
    controls: [
      { kind: "text", key: "skills", label: "Skills", placeholder: "TypeScript,React,Node.js,Python", hint: "comma separated, up to 40", max: 600 },
      { kind: "text", key: "icons", label: "Icons", placeholder: "React:code,Docker:folder", hint: "skill:icon pairs" },
      { kind: "number", key: "columns", label: "Columns (0 = flow)", min: 0, max: 12, def: 0 },
      { kind: "number", key: "width", label: "Width", min: 240, max: 1200, def: 495 },
      ...COMMON_CONTROLS,
    ],
  },
  {
    type: "note",
    label: "Sticky note",
    blurb: "A taped note with handwritten text. Great for a hello or a quote.",
    needsUser: false,
    params: [
      { name: "text", desc: "Note text (required)" },
      { name: "author", desc: "Signature line" },
      { name: "size", desc: "Font size 12–36" },
      { name: "font", desc: "hand, title or kalam" },
      { name: "width", desc: "Card width" },
      ...COMMON_PARAMS.filter((p) => !["title", "hide_title"].includes(p.name)),
    ],
    controls: [
      { kind: "text", key: "text", label: "Text", placeholder: "Hi! I build things and break them.", max: 400 },
      { kind: "text", key: "author", label: "Signed", placeholder: "— you", max: 40 },
      { kind: "number", key: "size", label: "Font size", min: 12, max: 36, def: 18 },
      { kind: "select", key: "font", label: "Font", def: "hand", options: [{ value: "hand", label: "Patrick Hand" }, { value: "title", label: "Caveat" }, { value: "kalam", label: "Kalam" }] },
      { kind: "number", key: "width", label: "Width", min: 200, max: 900, def: 360 },
      { kind: "toggle", key: "hide_border", label: "Hide border", def: false },
      { kind: "toggle", key: "doodles", label: "Decorative doodles", def: true, invert: true },
    ],
  },
];

export const ICON_NAMES = ["star", "fork", "commit", "pr", "issue", "eye", "heart", "fire", "trophy", "calendar", "book", "people", "rocket", "code", "repo", "clock", "pin", "bug", "coffee", "bolt", "branch", "check", "folder", "sparkle", "graph", "cat", "pencil", "moon", "globe", "mail", "hash", "smile"];

export function isCardType(s: string): s is CardType {
  return (CARD_TYPES as readonly string[]).includes(s);
}
