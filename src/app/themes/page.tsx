import type { Metadata } from "next";
import Link from "next/link";
import { THEMES } from "@/lib/cards/theme";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = pageMetadata({
  title: "15 GitHub README card themes, light and dark",
  description:
    "Every Doodlebug theme side by side: paper, notebook, chalkboard, blueprint, midnight, dracula and an auto light/dark theme, with live previews.",
  path: "/themes",
  og: "themes",
});

export const revalidate = 3600;

const DEMO_USER = "tarinagarwal";

export default function ThemesPage() {
  const themes = Object.values(THEMES);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <JsonLd data={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Themes", path: "/themes" }])} />
      <h1 className="title-hand text-4xl sm:text-5xl md:text-6xl">Themes</h1>
      <p className="mt-3 max-w-2xl text-base text-ink-soft sm:text-lg">
        Every theme, drawn on the same card. Add <code className="code break-all">?theme=</code> to any card URL — or override individual colours with{" "}
        <code className="code">bg</code>, <code className="code">ink</code>, <code className="code">accent</code>, <code className="code">accent2</code> and <code className="code">muted</code>.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((t, i) => (
          <figure key={t.key} className={i % 3 === 0 ? "sketch p-3" : i % 3 === 1 ? "sketch-2 p-3" : "sketch-3 p-3"}>
            <div className="overflow-hidden rounded-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/card/stats?username=${DEMO_USER}&theme=${t.key}&hide=contribs&show=followers`}
                alt={`${t.label} theme example`}
                width={495}
                height={175}
                className="h-auto w-full"
                loading="lazy"
              />
            </div>
            <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="title-hand text-2xl leading-tight">{t.label}</div>
                <code className="code break-all text-xs">theme={t.key}</code>
              </div>
              <div className="flex shrink-0 gap-1" aria-hidden="true">
                {[t.bg, t.ink, t.accent, t.accent2].map((c, n) => (
                  <span key={n} className="h-5 w-5 rounded-full border-2 border-ink/50" style={{ background: c }} />
                ))}
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="sketch-dashed mt-10 bg-[#fffdf7] p-5 md:p-6">
        <h2 className="title-hand text-2xl sm:text-3xl">Light and dark from one URL</h2>
        <p className="mt-2 text-ink-soft">
          <code className="code">theme=auto</code> draws the card in the paper palette and recolours it when the reader prefers dark, so a single URL suits both.
          Worth knowing: an SVG loaded through <code className="code">&lt;img&gt;</code> follows the browser or OS setting rather than GitHub&apos;s own light/dark
          toggle, so it matches most readers but not every one.
        </p>
        <pre className="code mt-3">{`![stats](https://doodlebug.tarinagarwal.in/api/card/stats?username=octocat&theme=auto)`}</pre>
      </div>

      <div className="mt-10 text-center">
        <Link href="/docs" className="btn btn-primary btn-lg">
          See every parameter
        </Link>
      </div>
    </div>
  );
}
