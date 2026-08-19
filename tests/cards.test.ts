import { describe, expect, it } from "vitest";
import { activityCard, graphCard } from "@/lib/cards/activity";
import { bannerCard } from "@/lib/cards/banner";
import { achievementsCard, linkCard, projectCard } from "@/lib/cards/custom";
import { errorCard } from "@/lib/cards/frame";
import { langsCard } from "@/lib/cards/langs";
import { CARD_TYPES } from "@/lib/cards/meta";
import { noteCard, skillsCard } from "@/lib/cards/misc";
import { commonParams } from "@/lib/cards/params";
import { repoCard } from "@/lib/cards/repo";
import { statsCard } from "@/lib/cards/stats";
import { streakCard } from "@/lib/cards/streak";
import { THEME_KEYS, THEMES, resolveTheme } from "@/lib/cards/theme";
import { trophiesCard } from "@/lib/cards/trophies";
import type { UserBundle } from "@/lib/github/types";
import { emptyBundle, makeBundle, makeRepo, stripFonts } from "./fixtures";

type Render = (query: string, bundle?: UserBundle) => string;

/** One entry per public card type, so a new type without coverage fails the roster test. */
const RENDERERS: Record<string, Render> = {
  stats: (q, b = makeBundle()) => statsCard(b, sp(q), common(q)),
  langs: (q, b = makeBundle()) => langsCard(b, sp(q), common(q)),
  streak: (q, b = makeBundle()) => streakCard(b, sp(q), common(q)),
  activity: (q, b = makeBundle()) => activityCard(b, sp(q), common(q)),
  graph: (q, b = makeBundle()) => graphCard(b, sp(q), common(q)),
  trophies: (q, b = makeBundle()) => trophiesCard(b, sp(q), common(q)),
  banner: (q, b = makeBundle()) => bannerCard(b, sp(q), common(q)),
  repo: (q) => repoCard(makeRepo(), sp(q), common(q)),
  note: (q) => noteCard(sp(q), common(q)),
  skills: (q) => skillsCard(sp(q), common(q)),
  project: (q) => projectCard(null, sp(q), common(q)),
  achievements: (q) => achievementsCard(sp(q), common(q)),
  link: (q) => linkCard(sp(q), common(q)),
};

function sp(query: string): URLSearchParams {
  return new URLSearchParams(query);
}
function common(query: string) {
  return commonParams(sp(query), "test-seed");
}

/** Structural checks every card must satisfy, whatever it draws. */
function expectValidSvg(svg: string) {
  expect(svg.startsWith("<svg")).toBe(true);
  expect(svg.endsWith("</svg>")).toBe(true);
  expect(svg).not.toMatch(/undefined|NaN|Infinity/);
  // Balanced enough to catch a renderer that forgets to close a group.
  const open = (svg.match(/<g\b/g) ?? []).length;
  const close = (svg.match(/<\/g>/g) ?? []).length;
  expect(open).toBe(close);
  const width = Number(/\bwidth="(\d+(?:\.\d+)?)"/.exec(svg)?.[1]);
  const height = Number(/\bheight="(\d+(?:\.\d+)?)"/.exec(svg)?.[1]);
  expect(width).toBeGreaterThan(0);
  expect(height).toBeGreaterThan(0);
}

describe("card roster", () => {
  it("covers every public card type", () => {
    expect(Object.keys(RENDERERS).sort()).toEqual([...CARD_TYPES].sort());
  });
});

describe("every card renders valid SVG", () => {
  for (const [type, render] of Object.entries(RENDERERS)) {
    it(`${type} — defaults`, () => expectValidSvg(render("")));

    it(`${type} — every theme`, () => {
      for (const theme of THEME_KEYS) expectValidSvg(render(`theme=${theme}`));
    });

    it(`${type} — hidden chrome`, () => {
      expectValidSvg(render("hide_border=true&hide_title=true&doodles=false&animate=false"));
    });
  }
});

describe("degenerate data", () => {
  // Regression guard: rough.js loops forever on a zero-length arc, which took the whole
  // process down when a language slice rounded to 0%. The suite timeout catches a hang.
  it("draws donut and pie layouts with zero-sized slices", () => {
    const zeroSlices = makeBundle({
      langs: {
        languages: [
          { name: "TypeScript", color: "#3178c6", size: 1_000_000, percent: 100 },
          { name: "Makefile", color: "#427819", size: 0, percent: 0 },
          { name: "Dockerfile", color: "#384d54", size: 0, percent: 0 },
        ],
        total: 1_000_000,
        basis: "bytes",
      },
    });
    for (const layout of ["bars", "donut", "pie", "compact"]) {
      expectValidSvg(RENDERERS.langs(`layout=${layout}`, zeroSlices));
    }
  });

  it("renders data cards for an account with no activity at all", () => {
    const empty = emptyBundle();
    for (const type of ["stats", "langs", "streak", "activity", "graph", "trophies", "banner"]) {
      expectValidSvg(RENDERERS[type]("", empty));
    }
  });

  it("survives a language list with a single 100% entry", () => {
    const one = makeBundle({
      langs: { languages: [{ name: "Rust", color: "#dea584", size: 10, percent: 100 }], total: 10, basis: "bytes" },
    });
    for (const layout of ["bars", "donut", "pie", "compact"]) expectValidSvg(RENDERERS.langs(`layout=${layout}`, one));
  });

  it("clamps out-of-range numeric params instead of drawing nothing", () => {
    expectValidSvg(RENDERERS.activity("weeks=99999"));
    expectValidSvg(RENDERERS.activity("weeks=-40"));
    expectValidSvg(RENDERERS.graph("days=0"));
    expectValidSvg(RENDERERS.graph("days=abc"));
    expectValidSvg(RENDERERS.note("width=999999"));
  });

  it("handles absurdly long text without overflowing the document", () => {
    const long = "x".repeat(5_000);
    expectValidSvg(RENDERERS.note(`text=${long}`));
    expectValidSvg(RENDERERS.project(`name=${long}&desc=${long}`));
    expectValidSvg(RENDERERS.skills(`skills=${Array.from({ length: 200 }, (_, i) => `lang${i}`).join(",")}`));
    expectValidSvg(RENDERERS.achievements(`items=${Array.from({ length: 100 }, (_, i) => `Win ${i}`).join(";")}`));
  });
});

describe("untrusted input", () => {
  const HOSTILE = '<script>alert(1)</script>"&\'<>';

  it("escapes hostile text in every card that accepts free text", () => {
    const cards = [
      RENDERERS.note(`text=${encodeURIComponent(HOSTILE)}&author=${encodeURIComponent(HOSTILE)}`),
      RENDERERS.project(`name=${encodeURIComponent(HOSTILE)}&desc=${encodeURIComponent(HOSTILE)}&tags=${encodeURIComponent(HOSTILE)}`),
      RENDERERS.link(`label=${encodeURIComponent(HOSTILE)}&sub=${encodeURIComponent(HOSTILE)}`),
      RENDERERS.achievements(`items=${encodeURIComponent(HOSTILE)}`),
      RENDERERS.skills(`skills=${encodeURIComponent(HOSTILE)}`),
      RENDERERS.stats(`title=${encodeURIComponent(HOSTILE)}`),
    ];
    for (const svg of cards) {
      // The payload may legitimately appear as *text*; what must never happen is it
      // appearing as markup, so assert on the escaping rather than on the substring.
      expect(svg).not.toContain("<script");
      expect(svg).not.toContain("</script");
      if (svg.includes("alert(1)")) expect(svg).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
      expectValidSvg(svg);
    }
  });

  it("ignores an unknown font instead of emitting a broken font-family", () => {
    const svg = RENDERERS.note("font=../../etc/passwd&text=hi");
    expect(svg).not.toContain('font-family="undefined"');
    expect(svg).toContain("PatrickHand");
    expectValidSvg(svg);
  });

  it("ignores an unknown icon name", () => {
    expectValidSvg(RENDERERS.link("icon=not-a-real-icon"));
    expectValidSvg(RENDERERS.project("icon=<img>"));
  });

  it("rejects colour overrides that are not hex", () => {
    const t = resolveTheme(sp("bg=javascript:alert(1)&ink=red&accent=%23ff0000"));
    expect(t.bg).toBe(THEMES.paper.bg);
    expect(t.ink).toBe(THEMES.paper.ink);
    expect(t.accent).toBe("#ff0000");
  });
});

describe("determinism", () => {
  it("produces identical output for identical input", () => {
    for (const [type, render] of Object.entries(RENDERERS)) {
      expect(render("theme=notebook"), type).toBe(render("theme=notebook"));
    }
  });

  it("produces different strokes for different seeds", () => {
    const a = statsCard(makeBundle(), sp(""), commonParams(sp("seed=1"), "stats:octocat"));
    const b = statsCard(makeBundle(), sp(""), commonParams(sp("seed=2"), "stats:octocat"));
    expect(a).not.toBe(b);
  });
});

describe("golden output", () => {
  // Fonts are stripped; what is snapshotted is the geometry and text the renderers emit.
  it("stats card", () => expect(stripFonts(RENDERERS.stats("theme=paper&show=followers"))).toMatchSnapshot());
  it("langs donut", () => expect(stripFonts(RENDERERS.langs("theme=notebook&layout=donut"))).toMatchSnapshot());
  it("error card", () => expect(stripFonts(errorCard(THEMES.paper, "User not found", "GitHub doesn't know \"nope\"", "Check the spelling"))).toMatchSnapshot());
});
