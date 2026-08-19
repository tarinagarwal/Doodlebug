import { describe, expect, it } from "vitest";
import { commonParams } from "@/lib/cards/params";
import { statsCard } from "@/lib/cards/stats";
import { noteCard } from "@/lib/cards/misc";
import { resolveTheme, THEMES } from "@/lib/cards/theme";
import { makeBundle } from "./fixtures";

const sp = (q: string) => new URLSearchParams(q);
const render = (q: string) => statsCard(makeBundle(), sp(q), commonParams(sp(q), "auto-test"));

/** Pulls the prefers-color-scheme block out of a card's inline stylesheet. */
function darkBlock(svg: string): string | null {
  const m = /@media \(prefers-color-scheme:dark\)\{(.*?)\}\s*<\/style>/s.exec(svg);
  if (m) return m[1];
  const loose = /@media \(prefers-color-scheme:dark\)\{((?:\[[^\]]*\]\{[^}]*\})+)\}/.exec(svg);
  return loose ? loose[1] : null;
}

describe("theme=auto", () => {
  it("is a real theme with a dark counterpart", () => {
    expect(THEMES.auto).toBeDefined();
    expect(THEMES.auto.autoDark).toBeTruthy();
  });

  it("draws in the light palette so a card without CSS still reads correctly", () => {
    const svg = render("theme=auto");
    expect(svg).toContain(THEMES.paper.bg);
    expect(svg).not.toContain("<script");
  });

  it("emits a dark-mode block that remaps the theme colours", () => {
    const svg = render("theme=auto");
    const block = darkBlock(svg);
    expect(block).toBeTruthy();
    const dark = THEMES.auto.autoDark!;
    // Background and ink are the two that must flip, or the card is unreadable in dark mode.
    expect(block).toContain(`[fill="${THEMES.paper.bg}"]{fill:${dark.bg}}`);
    expect(block).toContain(`[stroke="${THEMES.paper.ink}"]{stroke:${dark.ink}}`);
  });

  it("never declares the same light colour twice", () => {
    const block = darkBlock(render("theme=auto"))!;
    const fills = [...block.matchAll(/\[fill="([^"]+)"\]/g)].map((m) => m[1].toLowerCase());
    expect(new Set(fills).size).toBe(fills.length);
  });

  it("leaves other themes untouched", () => {
    for (const key of ["paper", "midnight", "chalkboard"]) {
      expect(render(`theme=${key}`)).not.toContain("prefers-color-scheme");
    }
  });

  it("keeps an explicit colour override in both schemes", () => {
    // Overriding a colour and then having it silently revert in dark mode would be worse
    // than not supporting overrides at all.
    const t = resolveTheme(sp("theme=auto&accent=ff0000"));
    expect(t.accent).toBe("#ff0000");
    expect(t.autoDark?.accent).toBe("#ff0000");

    const block = darkBlock(render("theme=auto&accent=ff0000"));
    expect(block ?? "").not.toContain('[fill="#ff0000"]');
  });

  it("does not leak the dark palette into a base theme object", () => {
    resolveTheme(sp("theme=auto&bg=000000"));
    expect(THEMES.auto.autoDark?.bg).toBe("#1b1b2f");
  });

  it("applies to every card type, not just stats", () => {
    const svg = noteCard(sp("theme=auto&text=hello"), commonParams(sp("theme=auto&text=hello"), "note"));
    expect(svg).toContain("prefers-color-scheme:dark");
  });
});
