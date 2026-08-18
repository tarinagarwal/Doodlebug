/**
 * Client-safe metadata about cards: types, docs and builder controls.
 * (No server-only imports here.)
 */
export const CARD_TYPES = ["stats", "langs", "streak", "activity", "graph", "trophies", "repo", "banner", "skills", "note", "project", "achievements", "link"] as const;
export type CardType = (typeof CARD_TYPES)[number];

export interface ParamDoc {
  name: string;
  desc: string;
  example?: string;
}

export type ControlGroup = "content" | "display" | "style";
export type Control =
  | { kind: "text"; key: string; label: string; placeholder?: string; hint?: string; max?: number; group?: ControlGroup; multiline?: boolean }
  | { kind: "number"; key: string; label: string; min: number; max: number; def: number; hint?: string; group?: ControlGroup }
  | { kind: "toggle"; key: string; label: string; def: boolean; hint?: string; invert?: boolean; group?: ControlGroup }
  | { kind: "select"; key: string; label: string; options: { value: string; label: string }[]; def: string; hint?: string; group?: ControlGroup }
  | { kind: "multi"; key: string; label: string; options: { value: string; label: string }[]; hint?: string; group?: ControlGroup };

export interface Preset {
  label: string;
  /** raw query params applied on top of defaults (theme included) */
  params: Record<string, string>;
}

export interface CardMeta {
  type: CardType;
  label: string;
  blurb: string;
  /** one-line, plain-English "what do I do here" */
  help: string;
  /** icon name from components/doodles Icon */
  icon: string;
  needsUser: boolean;
  params: ParamDoc[];
  controls: Control[];
  presets: Preset[];
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
  { kind: "text", key: "title", label: "Custom title", placeholder: "leave empty for the default", max: 60, group: "style" },
  { kind: "toggle", key: "hide_title", label: "Hide title", def: false, group: "style" },
  { kind: "toggle", key: "hide_border", label: "Hide border", def: false, group: "style" },
  { kind: "toggle", key: "doodles", label: "Decorative doodles", def: true, invert: true, group: "style" },
  { kind: "toggle", key: "animate", label: "Fade-in animation", def: true, invert: true, group: "style" },
];

export const CARD_META: CardMeta[] = [
  {
    type: "stats",
    label: "Stats",
    blurb: "Stars, commits, PRs, issues and a hand-drawn rank ring.",
    help: "Your headline numbers. Nothing to fill in — just pick a look.",
    icon: "graph",
    presets: [{ label: "Classic", params: {} }, { label: "Everything", params: { show: "merged,reviews,followers,repos,forks" } }, { label: "Minimal", params: { hide_rank: "true", show_icons: "false", doodles: "false" } }, { label: "Dark board", params: { theme: "chalkboard", show: "followers" } }],
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
    help: "Auto-detected from your repos. Choose bars, donut, pie or compact.",
    icon: "code",
    presets: [{ label: "Bars", params: {} }, { label: "Donut", params: { layout: "donut", theme: "notebook" } }, { label: "Pie", params: { layout: "pie", theme: "sakura" } }, { label: "Compact strip", params: { layout: "compact", langs_count: "8" } }],
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
    help: "Contribution streaks. Nothing to fill in.",
    icon: "bolt",
    presets: [{ label: "Sticky note", params: { theme: "sticky" } }, { label: "Paper", params: {} }, { label: "Midnight", params: { theme: "midnight" } }],
    needsUser: true,
    params: [...COMMON_PARAMS],
    controls: [...COMMON_CONTROLS],
  },
  {
    type: "activity",
    label: "Contribution doodle",
    blurb: "A wobbly heatmap of your recent contributions.",
    help: "A wobbly heatmap of your recent contributions.",
    icon: "cards",
    presets: [{ label: "Half year", params: { weeks: "26", theme: "grid" } }, { label: "Full year", params: { weeks: "52" } }, { label: "Last 3 months", params: { weeks: "13", theme: "forest" } }],
    needsUser: true,
    params: [{ name: "weeks", desc: "8–53 weeks to show", example: "40" }, { name: "legend", desc: "false to hide the less/more legend" }, ...COMMON_PARAMS],
    controls: [{ kind: "number", key: "weeks", label: "Weeks", min: 8, max: 53, def: 30 }, { kind: "toggle", key: "legend", label: "Legend", def: true, invert: true }, ...COMMON_CONTROLS],
  },
  {
    type: "graph",
    label: "Activity graph",
    blurb: "A hand-drawn line chart of daily contributions.",
    help: "Daily contributions as a sketched line chart.",
    icon: "graph",
    presets: [{ label: "30 days", params: {} }, { label: "60 days · midnight", params: { days: "60", theme: "midnight" } }, { label: "90 days · ocean", params: { days: "90", theme: "ocean" } }],
    needsUser: true,
    params: [{ name: "days", desc: "7–120 days", example: "60" }, ...COMMON_PARAMS],
    controls: [{ kind: "number", key: "days", label: "Days", min: 7, max: 120, def: 30 }, ...COMMON_CONTROLS],
  },
  {
    type: "trophies",
    label: "Trophies",
    blurb: "Sketched shields ranked C → SS for stars, commits, PRs, streaks…",
    help: "Auto-ranked shields — hide the ones you do not want.",
    icon: "check",
    presets: [{ label: "All 7", params: {} }, { label: "Chalkboard", params: { theme: "chalkboard" } }, { label: "Top 4", params: { hide: "issues,followers,repos", columns: "4" } }],
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
    help: "Type a repository name from the account above.",
    icon: "book",
    presets: [{ label: "Paper", params: {} }, { label: "Sakura", params: { theme: "sakura" } }, { label: "With owner", params: { show_owner: "true", theme: "kraft" } }],
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
    help: "A big header for the top of your README. Add your name and a tagline.",
    icon: "cards",
    presets: [{ label: "Centered", params: {} }, { label: "Left aligned", params: { align: "left" } }, { label: "No mascot", params: { mascot: "false", icons: "code,star,rocket,heart" } }, { label: "Chalkboard", params: { theme: "chalkboard" } }],
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
    help: "List your stack, comma separated. Optional icons per skill.",
    icon: "bolt",
    presets: [{ label: "Web dev", params: { skills: "TypeScript,React,Next.js,Node.js,PostgreSQL,Docker,AWS" } }, { label: "Data / ML", params: { skills: "Python,PyTorch,Pandas,SQL,Spark,Airflow,MLflow", theme: "notebook" } }, { label: "Mobile", params: { skills: "Kotlin,Swift,Flutter,React Native,Firebase", theme: "candy" } }],
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
    help: "Write anything — a hello, a quote, a status update.",
    icon: "mail",
    presets: [{ label: "Sticky", params: { theme: "sticky" } }, { label: "Big Caveat", params: { font: "title", size: "26" } }, { label: "Kalam", params: { font: "kalam", theme: "kraft" } }],
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
      { kind: "text", key: "text", label: "Text", placeholder: "Hi! I build things and break them.", max: 400, multiline: true },
      { kind: "text", key: "author", label: "Signed", placeholder: "— you", max: 40 },
      { kind: "number", key: "size", label: "Font size", min: 12, max: 36, def: 18 },
      { kind: "select", key: "font", label: "Font", def: "hand", options: [{ value: "hand", label: "Patrick Hand" }, { value: "title", label: "Caveat" }, { value: "kalam", label: "Kalam" }] },
      { kind: "number", key: "width", label: "Width", min: 200, max: 900, def: 360 },
      { kind: "toggle", key: "hide_border", label: "Hide border", def: false },
      { kind: "toggle", key: "doodles", label: "Decorative doodles", def: true, invert: true },
    ],
  },

  {
    type: "project",
    label: "Project",
    blurb: "Your own title, description, tags and link — optionally merged with live repo stats.",
    help: "Describe a project in your own words. Add tags, a link and an optional ribbon.",
    icon: "cards",
    presets: [{ label: "Product", params: { icon: "rocket" } }, { label: "Open source", params: { icon: "code", theme: "notebook" } }, { label: "Game", params: { icon: "bolt", theme: "graphite" } }],
    needsUser: false,
    params: [
      { name: "name", desc: "Project title" },
      { name: "desc", desc: "Description (up to ~400 chars)" },
      { name: "tags", desc: "Comma list of tech tags", example: "Node,TypeScript,MongoDB" },
      { name: "link", desc: "URL shown in the footer" },
      { name: "badge", desc: "Small ribbon text", example: "%2336 Product of the Day" },
      { name: "icon", desc: "Header icon name", example: "cat" },
      { name: "username + repo", desc: "Also show language / stars / forks from that repo" },
      { name: "width", desc: "Card width (default 440)" },
      { name: "lines", desc: "Max description lines (default 4)" },
      ...COMMON_PARAMS.filter((p) => !["title", "hide_title"].includes(p.name)),
    ],
    controls: [
      { kind: "text", key: "name", label: "Title", placeholder: "My project", max: 50 },
      { kind: "text", key: "desc", label: "Description", placeholder: "What it is, what it does, why it matters", max: 400, multiline: true },
      { kind: "text", key: "tags", label: "Tags", placeholder: "Node.js,TypeScript,MongoDB", hint: "comma separated" },
      { kind: "text", key: "link", label: "Link", placeholder: "https://...", max: 80 },
      { kind: "text", key: "badge", label: "Ribbon badge", placeholder: "e.g. #36 Product of the Day", max: 40 },
      { kind: "text", key: "icon", label: "Icon", placeholder: "rocket, cat, code, bolt...", max: 20 },
      { kind: "text", key: "repo", label: "Repo (optional)", placeholder: "adds stars/forks/language", hint: "uses the username above", max: 100 },
      { kind: "number", key: "width", label: "Width", min: 300, max: 900, def: 440 },
      { kind: "toggle", key: "hide_border", label: "Hide border", def: false },
      { kind: "toggle", key: "doodles", label: "Decorative doodles", def: true, invert: true },
      { kind: "toggle", key: "animate", label: "Fade-in animation", def: true, invert: true },
    ],
  },
  {
    type: "achievements",
    label: "Achievements",
    blurb: "Hackathon wins, awards, certifications — as numbered hand-drawn medals.",
    help: "One achievement per line as Label: detail (Winner, Runner-up, Top 100, 3rd place...).",
    icon: "check",
    presets: [{ label: "Paper", params: {} }, { label: "Chalkboard", params: { theme: "chalkboard" } }, { label: "Wide", params: { width: "760" } }],
    needsUser: false,
    params: [
      { name: "items", desc: "Semicolon-separated list. Write each item as Label: detail — the medal colour follows the label (winner, runner-up, 3rd, top...)", example: "Winner: Buildverse 2025;Top 100: Hackhazards" },
      { name: "width", desc: "Card width (default 495)" },
      ...COMMON_PARAMS,
    ],
    controls: [
      { kind: "text", key: "items", label: "Achievements", placeholder: "Winner: Buildverse 2025\nRunner-up: GameForge 2025\nTop 100: Hackhazards 2025", hint: "one per line, written as Label: detail", max: 1200, multiline: true },
      { kind: "number", key: "width", label: "Width", min: 300, max: 900, def: 495 },
      ...COMMON_CONTROLS,
    ],
  },
  {
    type: "link",
    label: "Link sticker",
    blurb: "A hand-drawn button for portfolio, LinkedIn, email... wrap it in a link in your README.",
    help: "A hand-drawn button. Wrap the image in a link when you paste it.",
    icon: "external",
    presets: [{ label: "Portfolio", params: { label: "Portfolio", icon: "globe" } }, { label: "LinkedIn", params: { label: "LinkedIn", icon: "linkedin", theme: "ocean" } }, { label: "Email", params: { label: "Email", icon: "mail", theme: "sakura" } }, { label: "Resume", params: { label: "Resume", icon: "doc", style: "outline" } }],
    needsUser: false,
    params: [
      { name: "label", desc: "Button text", example: "Portfolio" },
      { name: "sub", desc: "Small second line", example: "tarinagarwal.in" },
      { name: "icon", desc: "Icon name", example: "globe, linkedin, mail, cat, x, youtube, doc" },
      { name: "style", desc: "sticker (filled, default) or outline" },
      { name: "size", desc: "Font size 12-30" },
      { name: "width", desc: "Fixed width (default: auto)" },
      { name: "theme / colours", desc: "Same as other cards" },
    ],
    controls: [
      { kind: "text", key: "label", label: "Label", placeholder: "Portfolio", max: 40 },
      { kind: "text", key: "sub", label: "Sub line", placeholder: "optional", max: 60 },
      { kind: "text", key: "icon", label: "Icon", placeholder: "globe, linkedin, mail, cat, x...", max: 20 },
      { kind: "select", key: "style", label: "Style", def: "sticker", options: [{ value: "sticker", label: "Sticker" }, { value: "outline", label: "Outline" }] },
      { kind: "number", key: "size", label: "Font size", min: 12, max: 30, def: 18 },
      { kind: "toggle", key: "animate", label: "Fade-in animation", def: true, invert: true },
    ],
  },
];

export const ICON_NAMES = ["external", "link", "linkedin", "x", "instagram", "youtube", "briefcase", "doc", "phone", "discord", "medium", "dev", "npm", "star", "fork", "commit", "pr", "issue", "eye", "heart", "fire", "trophy", "calendar", "book", "people", "rocket", "code", "repo", "clock", "pin", "bug", "coffee", "bolt", "branch", "check", "folder", "sparkle", "graph", "cat", "pencil", "moon", "globe", "mail", "hash", "smile"];

export function isCardType(s: string): s is CardType {
  return (CARD_TYPES as readonly string[]).includes(s);
}
