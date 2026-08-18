import type { Metadata } from "next";
import Link from "next/link";
import { CARD_META, ICON_NAMES } from "@/lib/cards/meta";
import { THEMES } from "@/lib/cards/theme";
import { appUrl } from "@/lib/verification";
import { Squiggle } from "@/components/doodles";

export const metadata: Metadata = { title: "Docs" };

const DEMO = "tarinagarwal";

function example(type: string): string {
  switch (type) {
    case "repo":
      return `/api/card/repo?username=${DEMO}&repo=Doodlebug&theme=sakura`;
    case "banner":
      return `/api/card/banner?username=${DEMO}&theme=paper&text=full-stack%20dev%20%C2%B7%20game%20dev`;
    case "skills":
      return `/api/card/skills?skills=TypeScript,React,Node.js,Python,MongoDB,Docker&theme=kraft`;
    case "note":
      return `/api/card/note?text=Hi!%20I%20build%20things%20and%20occasionally%20break%20them.&author=${DEMO}&theme=sticky`;
    case "langs":
      return `/api/card/langs?username=${DEMO}&theme=notebook&layout=donut`;
    case "trophies":
      return `/api/card/trophies?username=${DEMO}&theme=chalkboard&columns=4`;
    case "activity":
      return `/api/card/activity?username=${DEMO}&theme=grid&weeks=26`;
    case "graph":
      return `/api/card/graph?username=${DEMO}&theme=midnight&days=45`;
    case "streak":
      return `/api/card/streak?username=${DEMO}&theme=forest`;
    default:
      return `/api/card/stats?username=${DEMO}&theme=paper`;
  }
}

export default function DocsPage() {
  const origin = appUrl();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <h1 className="title-hand text-6xl">Docs</h1>
      <p className="mt-2 max-w-2xl text-lg text-ink-soft">
        Every card is a plain URL that returns an SVG. Compose it in the <Link href="/dashboard" className="underline-squiggle">builder</Link> or by hand using the params below.
      </p>

      <section className="mt-8 sketch p-5">
        <h2 className="title-hand text-3xl">Base URL</h2>
        <pre className="code mt-2">{`${origin}/api/card/<type>?username=<github-login>&theme=<theme>&…`}</pre>
        <ul className="mt-3 list-disc pl-6 text-ink-soft">
          <li>
            Boolean params accept <code className="code">true</code>/<code className="code">false</code>. Lists are comma separated.
          </li>
          <li>Responses are cached for 30–60 minutes and served with cache headers that GitHub&apos;s image proxy respects.</li>
          <li>
            If the username belongs to a Doodlebug account with a saved token, that token is used automatically — otherwise data comes from GitHub&apos;s public API and public contribution graph.
          </li>
          <li>Errors are returned as an error card (still an image), so your README never shows a broken picture.</li>
        </ul>
      </section>

      <nav className="mt-8 flex flex-wrap gap-2">
        {CARD_META.map((c) => (
          <a key={c.type} href={`#${c.type}`} className="btn btn-sm">
            {c.label}
          </a>
        ))}
        <a href="#themes" className="btn btn-sm">
          Themes
        </a>
        <a href="#icons" className="btn btn-sm">
          Icons
        </a>
      </nav>

      {CARD_META.map((c, i) => (
        <section key={c.type} id={c.type} className={`mt-10 ${i % 2 ? "sketch-2" : "sketch"} p-5 md:p-6 scroll-mt-24`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="title-hand text-4xl">{c.label}</h2>
            <code className="code">/api/card/{c.type}</code>
          </div>
          <p className="mt-1 text-ink-soft">{c.blurb}</p>
          <div className="mt-4 overflow-x-auto">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={example(c.type)} alt={`${c.label} example`} className="h-auto max-w-full" loading="lazy" />
          </div>
          <pre className="code mt-3">{`![${c.label}](${origin}${example(c.type)})`}</pre>
          <table className="mt-4 w-full text-[0.98rem]">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-1 pr-3 font-normal">param</th>
                <th className="py-1 pr-3 font-normal">what it does</th>
                <th className="py-1 font-normal">example</th>
              </tr>
            </thead>
            <tbody>
              {c.params.map((p) => (
                <tr key={p.name} className="border-t border-dashed border-ink/30 align-top">
                  <td className="py-1.5 pr-3">
                    <code className="code">{p.name}</code>
                  </td>
                  <td className="py-1.5 pr-3 text-ink-soft">{p.desc}</td>
                  <td className="py-1.5 text-muted">{p.example ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <section id="themes" className="mt-10 sketch-3 p-5 md:p-6 scroll-mt-24">
        <h2 className="title-hand text-4xl">Themes</h2>
        <p className="mt-1 text-ink-soft">
          Use <code className="code">theme=&lt;key&gt;</code>. Override individual colours with <code className="code">bg</code>, <code className="code">ink</code>, <code className="code">accent</code>, <code className="code">accent2</code>, <code className="code">muted</code> (hex without #).
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(THEMES).map((t) => (
            <div key={t.key} className="sketch-flat p-3" style={{ background: t.bg, color: t.ink, borderColor: t.ink }}>
              <div className="flex items-center justify-between">
                <b>{t.label}</b>
                <code className="text-xs opacity-80">{t.key}</code>
              </div>
              <div className="mt-2 flex gap-1.5">
                {[t.bg, t.ink, t.accent, t.accent2, t.muted].map((cc, j) => (
                  <span key={j} className="h-5 w-8 rounded border border-black/30" style={{ background: cc }} title={cc} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="icons" className="mt-10 sketch p-5 md:p-6 scroll-mt-24">
        <h2 className="title-hand text-4xl">Icons</h2>
        <p className="mt-1 text-ink-soft">
          Names usable in <code className="code">banner?icons=</code> and <code className="code">skills?icons=Skill:icon</code>:
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {ICON_NAMES.map((n) => (
            <code key={n} className="code">
              {n}
            </code>
          ))}
        </div>
      </section>

      <section className="mt-10 sketch-2 p-5 md:p-6">
        <h2 className="title-hand text-4xl">Self-hosting</h2>
        <p className="mt-1 text-ink-soft">
          Doodlebug is a Next.js app. Clone{" "}
          <a className="underline-squiggle" href="https://github.com/tarinagarwal/Doodlebug" target="_blank" rel="noreferrer">
            the repo
          </a>
          , copy <code className="code">.env.example</code> to <code className="code">.env.local</code>, fill in MongoDB + SMTP, and deploy to Vercel. Set <code className="code">GITHUB_TOKEN</code> to give public cards a higher rate limit.
        </p>
        <Squiggle className="mt-4" />
      </section>
    </div>
  );
}
