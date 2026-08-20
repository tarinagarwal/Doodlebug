import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, Cloud, Heart, Icon, Sparkle, Squiggle, Star, Underline } from "@/components/doodles";
import { CARD_META } from "@/lib/cards";
import { THEMES } from "@/lib/cards/theme";
import { getCurrentUser } from "@/lib/auth";
import { getRenderTotals } from "@/lib/stats";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { FAQS, faqSchema, softwareApplicationSchema, webSiteSchema } from "@/lib/schema";

const DEMO_USER = "tarinagarwal";

export const metadata: Metadata = pageMetadata({
  title: "Doodlebug — hand-drawn GitHub stats cards for your README",
  description:
    "Turn your GitHub activity into hand-drawn SVG cards for your README: stats, streaks, top languages, trophies and banners. Free and open source.",
  path: "/",
  og: "home",
});

export default async function Home() {
  const [user, totals] = await Promise.all([getCurrentUser(), getRenderTotals()]);
  const cta = user ? "/dashboard" : "/signup";
  const cardCount = CARD_META.length;
  const themeCount = Object.keys(THEMES).length;
  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6">
      <JsonLd data={[webSiteSchema(), softwareApplicationSchema(), faqSchema()]} />
      {/* ---------------- Hero ---------------- */}
      <section className="relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        <Sparkle className="absolute left-2 top-8 rotate-12 hidden sm:block" size={30} />
        <Star className="absolute right-6 top-4 -rotate-12 hidden md:block" size={28} color="#ff5da2" />
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <p className="inline-block sketch-flat bg-[#fde9b6] px-3 py-1 text-sm rotate-1">
              ✎ free · open source · no token required · {cardCount} cards · {themeCount} themes
            </p>
            {totals.cards > 0 ? (
              <p className="inline-block sketch-flat bg-[#cfe9e5] px-3 py-1 text-sm -rotate-1">
                {totals.cards.toLocaleString("en-US")} cards drawn in the last {totals.days} days
              </p>
            ) : null}
          </div>
          <h1 className="title-hand text-5xl leading-[0.95] sm:text-6xl md:text-7xl lg:text-8xl">
            Your GitHub stats,
            <br />
            <span className="relative inline-block">
              but doodled.
              <Underline className="absolute -bottom-2 left-0 h-3 w-full" />
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-ink-soft sm:text-xl">
            Doodlebug turns your GitHub activity into <span className="hl">hand-drawn</span> stats cards, streak flames, language bars, trophies and banners — ready to paste into your README.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={cta} className="btn btn-primary btn-lg w-full sm:w-auto">
              {user ? "Open my dashboard" : "Start doodling — it's free"} <Icon name="arrowRight" size={20} />
            </Link>
            <Link href="/docs" className="btn btn-lg w-full sm:w-auto">
              Read the docs
            </Link>
          </div>
          <p className="mt-4 text-muted">
            Works with public data out of the box. Add your own token later for private-contribution counts and zero rate limits.
          </p>
        </div>
        <div className="relative">
          <Cloud className="absolute -top-6 right-2 hidden md:block" />
          <div className="relative rotate-2 sketch-2 tape p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/card/stats?username=${DEMO_USER}&theme=paper&show=followers`} alt="Example hand-drawn stats card" width={495} height={200} className="h-auto w-full" />
          </div>
          <div className="relative -mt-6 ml-8 w-4/5 -rotate-2 sketch p-2 tape tape-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/card/streak?username=${DEMO_USER}&theme=sticky`} alt="Example hand-drawn streak card" width={495} height={195} className="h-auto w-full" />
          </div>
          <div className="absolute -bottom-14 -left-10 float hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/mascot.webp" alt="Doodlebug mascot" width={150} height={156} className="h-auto w-[150px] drop-shadow-[3px_4px_0_rgba(43,43,43,0.25)]" />
          </div>
          <Arrow className="absolute -left-20 top-16 hidden lg:block" />
        </div>
      </section>

      {/* ---------------- Marquee of cards ---------------- */}
      <section className="py-10">
        <h2 className="title-hand text-3xl sm:text-4xl md:text-5xl">
          {cardCount} card types. <span className="hl-teal">One wobbly pen.</span>
        </h2>
        <p className="mt-2 max-w-2xl text-base text-ink-soft sm:text-lg">Every card is an SVG generated on the fly with sketchy rough.js strokes and embedded handwriting fonts, so it renders anywhere — including GitHub READMEs.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Demo title="Top languages" w={340} h={210} src={`/api/card/langs?username=${DEMO_USER}&theme=notebook&layout=donut&langs_count=6`} rotate="rotate-1" />
          <Demo title="Trophies" w={476} h={268} src={`/api/card/trophies?username=${DEMO_USER}&theme=chalkboard&columns=4`} rotate="rotate-2" />
          <Demo title="Contribution doodle" w={481} h={229} src={`/api/card/activity?username=${DEMO_USER}&theme=grid&weeks=26`} rotate="rotate-3" />
          <Demo title="Activity graph" w={495} h={220} src={`/api/card/graph?username=${DEMO_USER}&theme=midnight&days=45`} rotate="rotate-1" />
          <Demo title="Repo pin" w={400} h={193} src={`/api/card/repo?username=${DEMO_USER}&repo=Doodlebug&theme=sakura`} rotate="rotate-2" />
          <Demo title="Skill stickers" w={495} h={158} src={`/api/card/skills?skills=TypeScript,React,Node.js,Python,MongoDB,Redis,Docker,AWS,Solidity,Unreal&theme=kraft`} rotate="rotate-3" />
          <Demo title="Project" w={440} h={170} src={`/api/card/project?name=LGTM%20%E2%80%94%20Looks%20Good%20To%20Meow&desc=Live%20AI%20code%20review%20%2B%20CI%2FCD%20security%20SaaS%3A%206-lens%20review%20pipeline%2C%2036%20security%20detectors%2C%20SBOM%2C%20posture%20analytics%2C%20org%20RBAC%20and%20a%20CLI.&tags=Node.js,TypeScript,React,MongoDB,Redis&link=looksgoodtomeow.in&badge=%2336%20Product%20of%20the%20Day&icon=cat&theme=forest`} rotate="rotate-1" />
          <Demo title="Achievements" w={495} h={234} src={`/api/card/achievements?items=Winner:%20Gameathon%202K26%20%26%20Buildverse%202025;Runner-up:%20GameForge%2C%20CodeSprint%2C%20Hacksphere%202025;Top%20100:%20Hackhazards%202025%20(8000%2B%20participants)&theme=paper`} rotate="rotate-2" />
        </div>
        <div className="mt-6 sketch-3 p-2 rotate-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/card/banner?username=${DEMO_USER}&theme=paper&text=full-stack%20dev%20%C2%B7%20game%20dev%20%C2%B7%20doodler`} alt="Example Doodlebug banner card with a name, tagline and doodle icons" className="h-auto w-full" width={900} height={230} loading="lazy" />
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="py-14">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_320px]">
          <div>
            <h2 className="title-hand text-3xl sm:text-4xl md:text-5xl">How it works</h2>
            <p className="mt-2 max-w-xl text-base text-ink-soft sm:text-lg">No OAuth dance, no build step, no config files in your repo. Just a URL that draws itself.</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/hero.webp" alt="Doodle of a laptop with charts, a rocket, a trophy and a coffee mug" width={1200} height={812} className="mx-auto h-auto w-full max-w-[320px] rotate-2" loading="lazy" />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Step n={1} title="Sign up (30 seconds)" body="Email + password, verify your inbox, done. Your account is where you save your GitHub username and, optionally, a token." />
          <Step n={2} title="Pick a card, tweak the look" body="Choose a card in the sidebar, hit a quick-start preset or tweak the options. The preview updates live — it's the same SVG GitHub will render. Save it to edit later." />
          <Step n={3} title="Copy the markdown" body="Paste the snippet into your profile README. Cards refresh themselves every ~30 minutes with fresh data — and a saved card gets a short link you can restyle later without touching the README again." />
        </div>
      </section>

      {/* ---------------- Themes ---------------- */}
      <section className="py-10">
        <h2 className="title-hand text-3xl sm:text-4xl md:text-5xl">Themes for every notebook</h2>
        <p className="mt-2 text-base text-ink-soft sm:text-lg">
          Or override any colour with hex params. Dark themes look great on dark GitHub — and{" "}
          <code className="code">theme=auto</code> ships one card that switches to a dark palette by itself.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {Object.values(THEMES).map((t) => (
            <div key={t.key} className="sketch-flat flex items-center gap-2 px-3 py-1.5" style={{ background: t.bg, color: t.ink, borderColor: t.ink }}>
              <span className="inline-block h-4 w-4 rounded-full border border-black/30" style={{ background: t.accent }} />
              <span className="inline-block h-4 w-4 rounded-full border border-black/30" style={{ background: t.accent2 }} />
              <span>{t.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Link href="/themes" className="btn">
            See every theme side by side <Icon name="arrowRight" size={18} />
          </Link>
        </div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section className="py-14">
        <h2 className="title-hand text-3xl sm:text-4xl md:text-5xl">Everything you&apos;d expect, drawn by hand</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARD_META.map((c, i) => (
            <div key={c.type} className={`${i % 3 === 0 ? "sketch" : i % 3 === 1 ? "sketch-2" : "sketch-3"} p-4 sm:p-5`}>
              <div className="flex items-center justify-between">
                <h3 className="title-hand text-2xl">{c.label}</h3>
                <code className="code">{c.type}</code>
              </div>
              <p className="mt-2 text-ink-soft">{c.blurb}</p>
            </div>
          ))}
          <div className="sketch p-5 bg-[#fde9b6]">
            <h3 className="title-hand text-2xl">Bring your own token</h3>
            <p className="mt-2 text-ink-soft">Optional. Stored AES-256-GCM encrypted, only ever decrypted in memory to fetch your data. Unlocks private-contribution counts and dodges GitHub&apos;s public rate limits.</p>
          </div>
          <div className="sketch-2 p-5 bg-[#cfe9e5]">
            <h3 className="title-hand text-2xl">Save &amp; edit later</h3>
            <p className="mt-2 text-ink-soft">Every design you build can be saved to your dashboard — come back, tweak the wording or theme, and copy the updated markdown.</p>
          </div>
          <div className="sketch-3 p-5 bg-[#cfe9e5]">
            <h3 className="title-hand text-2xl">Cached &amp; cheap</h3>
            <p className="mt-2 text-ink-soft">Data is cached for 30–60 minutes and served with proper cache headers, so your README loads instantly and GitHub is not hammered.</p>
          </div>
          <div className="sketch-3 p-5 bg-[#ffd6e6]">
            <h3 className="title-hand text-2xl">Open source</h3>
            <p className="mt-2 text-ink-soft">
              Read the code, self-host it, or send a PR.{" "}
              <a className="underline-squiggle" href="https://github.com/tarinagarwal/Doodlebug" target="_blank" rel="noreferrer">
                github.com/tarinagarwal/Doodlebug
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="py-10">
        <h2 className="title-hand text-3xl sm:text-4xl md:text-5xl">Questions people doodle in the margins</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {FAQS.map((f) => (
            <Faq key={f.q} q={f.q} a={f.a} />
          ))}
        </div>
      </section>

      {/* ---------------- Open source ---------------- */}
      <section className="py-10">
        <div className="sketch-dashed bg-[#fffdf7] p-5 sm:p-6 md:p-8">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h2 className="title-hand text-3xl sm:text-4xl md:text-5xl">
                Open source, <span className="hl-teal">all of it</span>
              </h2>
              <p className="mt-3 max-w-2xl text-base text-ink-soft sm:text-lg">
                The card engine, the builder, the accounts, the caching — every line that draws these cards is on GitHub under the MIT licence. Read
                it, fork it, run your own copy, or sell what you build with it. There is no paid tier holding features back, because there is no paid
                tier.
              </p>
              <p className="mt-3 text-base text-ink-soft sm:text-lg">
                Doodlebug is a{" "}
                <a href="https://devsbazaar.com" target="_blank" rel="noreferrer" className="underline-squiggle text-ink">
                  DevsBazaar
                </a>{" "}
                product, open sourced.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href="https://github.com/tarinagarwal/Doodlebug" target="_blank" rel="noreferrer" className="btn btn-primary">
                  <Icon name="github" size={18} /> Star on GitHub
                </a>
                <a href="https://devsbazaar.com" target="_blank" rel="noreferrer" className="btn">
                  More from DevsBazaar <Icon name="external" size={16} />
                </a>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/mascot.webp" alt="The Doodlebug mascot waving beside the open-source notice" width={150} height={156} className="mx-auto hidden h-auto w-[150px] float md:block" loading="lazy" />
          </div>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="py-16 text-center">
        <div className="relative mx-auto max-w-2xl sketch-2 bg-[#fffdf7] p-6 sm:p-8 md:p-12">
          <Heart className="absolute -right-3 -top-3" size={34} />
          <Sparkle className="absolute -left-4 bottom-4" size={30} color="#2a9d8f" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/mascot.webp" alt="The Doodlebug mascot, a smiling hand-drawn beetle holding a pencil" width={120} height={124} className="mx-auto h-auto w-[120px] float" />
          <h2 className="title-hand mt-2 text-4xl sm:text-5xl">Ready to doodle?</h2>
          <p className="mt-2 text-base text-ink-soft sm:text-lg">Takes less time than choosing a README emoji.</p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={cta} className="btn btn-primary btn-lg">
              {user ? "Go to dashboard" : "Create free account"}
            </Link>
            <Link href="/docs" className="btn btn-lg">
              Docs
            </Link>
          </div>
          <Squiggle className="mx-auto mt-6" />
        </div>
      </section>
    </div>
  );
}

function Demo({ title, src, rotate, w, h }: { title: string; src: string; rotate: string; w: number; h: number }) {
  return (
    <figure className={`${rotate}`}>
      <div className="sketch p-2 bg-[#fffdf7]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={title} width={w} height={h} className="h-auto w-full" loading="lazy" />
      </div>
      <figcaption className="mt-2 text-center text-muted">{title}</figcaption>
    </figure>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="relative sketch p-5 pt-8 sm:p-6">
      <div className="absolute -left-3 -top-4 flex h-11 w-11 items-center justify-center rounded-full border-[2.5px] border-ink bg-accent title-hand text-2xl shadow-[3px_3px_0_#2b2b2b]">{n}</div>
      <h3 className="title-hand text-2xl">{title}</h3>
      <p className="mt-2 text-ink-soft">{body}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <details className="sketch-flat bg-[#fffdf7] p-4 open:bg-[#fff8e6]">
      <summary className="cursor-pointer title-hand text-2xl">{q}</summary>
      <p className="mt-2 text-ink-soft">{a}</p>
    </details>
  );
}
