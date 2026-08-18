import Link from "next/link";
import { Arrow, Cloud, Heart, Icon, Sparkle, Squiggle, Star, Underline } from "@/components/doodles";
import { CARD_META } from "@/lib/cards";
import { THEMES } from "@/lib/cards/theme";
import { getCurrentUser } from "@/lib/auth";

const DEMO_USER = "tarinagarwal";

export default async function Home() {
  const user = await getCurrentUser();
  const cta = user ? "/dashboard" : "/signup";
  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6">
      {/* ---------------- Hero ---------------- */}
      <section className="relative grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        <Sparkle className="absolute left-2 top-8 rotate-12" size={30} />
        <Star className="absolute right-6 top-4 -rotate-12 hidden md:block" size={28} color="#ff5da2" />
        <div>
          <p className="mb-3 inline-block sketch-flat bg-[#fde9b6] px-3 py-1 text-sm rotate-1">✎ free · no token required · 13 cards · 14 themes</p>
          <h1 className="title-hand text-6xl leading-[0.95] md:text-7xl lg:text-8xl">
            Your GitHub stats,
            <br />
            <span className="relative inline-block">
              but doodled.
              <Underline className="absolute -bottom-2 left-0 h-3 w-full" />
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-xl text-ink-soft">
            Doodlebug turns your GitHub activity into <span className="hl">hand-drawn</span> stats cards, streak flames, language bars, trophies and banners — ready to paste into your README.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href={cta} className="btn btn-primary btn-lg">
              {user ? "Open my dashboard" : "Start doodling — it's free"} <Icon name="arrowRight" size={20} />
            </Link>
            <Link href="/docs" className="btn btn-lg">
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
            <img src={`/api/card/stats?username=${DEMO_USER}&theme=paper&show=followers`} alt="Example hand-drawn stats card" width={495} height={200} className="h-auto w-full" />
          </div>
          <div className="relative -mt-6 ml-8 w-4/5 -rotate-2 sketch p-2 tape tape-left">
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
        <h2 className="title-hand text-4xl md:text-5xl">
          Thirteen card types. <span className="hl-teal">One wobbly pen.</span>
        </h2>
        <p className="mt-2 max-w-2xl text-lg text-ink-soft">Every card is an SVG generated on the fly with sketchy rough.js strokes and embedded handwriting fonts, so it renders anywhere — including GitHub READMEs.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Demo title="Top languages" src={`/api/card/langs?username=${DEMO_USER}&theme=notebook&layout=donut&langs_count=6`} rotate="rotate-1" />
          <Demo title="Trophies" src={`/api/card/trophies?username=${DEMO_USER}&theme=chalkboard&columns=4`} rotate="rotate-2" />
          <Demo title="Contribution doodle" src={`/api/card/activity?username=${DEMO_USER}&theme=grid&weeks=26`} rotate="rotate-3" />
          <Demo title="Activity graph" src={`/api/card/graph?username=${DEMO_USER}&theme=midnight&days=45`} rotate="rotate-1" />
          <Demo title="Repo pin" src={`/api/card/repo?username=${DEMO_USER}&repo=Doodlebug&theme=sakura`} rotate="rotate-2" />
          <Demo title="Skill stickers" src={`/api/card/skills?skills=TypeScript,React,Node.js,Python,MongoDB,Redis,Docker,AWS,Solidity,Unreal&theme=kraft`} rotate="rotate-3" />
          <Demo title="Project" src={`/api/card/project?name=LGTM%20%E2%80%94%20Looks%20Good%20To%20Meow&desc=Live%20AI%20code%20review%20%2B%20CI%2FCD%20security%20SaaS%3A%206-lens%20review%20pipeline%2C%2036%20security%20detectors%2C%20SBOM%2C%20posture%20analytics%2C%20org%20RBAC%20and%20a%20CLI.&tags=Node.js,TypeScript,React,MongoDB,Redis&link=looksgoodtomeow.in&badge=%2336%20Product%20of%20the%20Day&icon=cat&theme=forest`} rotate="rotate-1" />
          <Demo title="Achievements" src={`/api/card/achievements?items=Winner:%20Gameathon%202K26%20%26%20Buildverse%202025;Runner-up:%20GameForge%2C%20CodeSprint%2C%20Hacksphere%202025;Top%20100:%20Hackhazards%202025%20(8000%2B%20participants)&theme=paper`} rotate="rotate-2" />
        </div>
        <div className="mt-6 sketch-3 p-2 rotate-1">
          <img src={`/api/card/banner?username=${DEMO_USER}&theme=paper&text=full-stack%20dev%20%C2%B7%20game%20dev%20%C2%B7%20doodler`} alt="Example banner" className="h-auto w-full" width={900} height={230} />
        </div>
      </section>

      {/* ---------------- How it works ---------------- */}
      <section className="py-14">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_320px]">
          <div>
            <h2 className="title-hand text-4xl md:text-5xl">How it works</h2>
            <p className="mt-2 max-w-xl text-lg text-ink-soft">No OAuth dance, no build step, no config files in your repo. Just a URL that draws itself.</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/hero.webp" alt="Doodle of a laptop with charts, a rocket, a trophy and a coffee mug" width={1200} height={812} className="mx-auto h-auto w-full max-w-[320px] rotate-2" loading="lazy" />
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Step n={1} title="Sign up (30 seconds)" body="Email + password, verify your inbox, done. Your account is where you save your GitHub username and, optionally, a token." />
          <Step n={2} title="Pick a card, tweak the look" body="Choose a card type, theme and options in the builder. The preview updates live — it's the same SVG GitHub will render." />
          <Step n={3} title="Copy the markdown" body="Paste the snippet into your profile README. Cards refresh themselves every ~30 minutes with fresh data." />
        </div>
      </section>

      {/* ---------------- Themes ---------------- */}
      <section className="py-10">
        <h2 className="title-hand text-4xl md:text-5xl">Themes for every notebook</h2>
        <p className="mt-2 text-lg text-ink-soft">Or override any colour with hex params. Dark themes look great on dark GitHub.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {Object.values(THEMES).map((t) => (
            <div key={t.key} className="sketch-flat flex items-center gap-2 px-3 py-1.5" style={{ background: t.bg, color: t.ink, borderColor: t.ink }}>
              <span className="inline-block h-4 w-4 rounded-full border border-black/30" style={{ background: t.accent }} />
              <span className="inline-block h-4 w-4 rounded-full border border-black/30" style={{ background: t.accent2 }} />
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Features ---------------- */}
      <section className="py-14">
        <h2 className="title-hand text-4xl md:text-5xl">Everything you'd expect, drawn by hand</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CARD_META.map((c, i) => (
            <div key={c.type} className={`${i % 3 === 0 ? "sketch" : i % 3 === 1 ? "sketch-2" : "sketch-3"} p-5`}>
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
        <h2 className="title-hand text-4xl md:text-5xl">Questions people doodle in the margins</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Faq q="Do I need a GitHub token?" a="No. Public data works for everyone. Without a token, Doodlebug uses GitHub's public API and the public contribution graph, which has shared rate limits — heavy traffic can occasionally show a 'rate limited' card. Adding a token in Settings fixes that permanently and adds private-contribution counts." />
          <Faq q="Why do I have to log in to use the site?" a="Your account stores your GitHub username, your (encrypted) token and your preferences, and lets Doodlebug prefer your token whenever anyone loads a card for your username. Card image URLs themselves are public so they render in READMEs." />
          <Faq q="Which token scopes do I need?" a="A fine-grained token with no extra permissions (public data) works. For private contribution counts, grant read access to your repositories, or use a classic token with the repo and read:user scopes." />
          <Faq q="How fresh is the data?" a="Cards refresh every 30 minutes (60 for public fetching) and are served with cache headers GitHub respects. Change a param — like &seed=2 — to force a new image." />
          <Faq q="Can I customise colours?" a="Yes: pick a theme, then override any of bg, ink, accent, accent2 or muted with a hex value, e.g. &accent=ff5da2." />
          <Faq q="Is it really hand-drawn?" a="Every stroke is generated with rough.js and a per-user seed, so your card is unique. Fonts are real handwriting fonts embedded into the SVG." />
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="py-16 text-center">
        <div className="relative mx-auto max-w-2xl sketch-2 bg-[#fffdf7] p-8 md:p-12">
          <Heart className="absolute -right-3 -top-3" size={34} />
          <Sparkle className="absolute -left-4 bottom-4" size={30} color="#2a9d8f" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/mascot.webp" alt="" width={120} height={124} className="mx-auto h-auto w-[120px] float" />
          <h2 className="title-hand mt-2 text-5xl">Ready to doodle?</h2>
          <p className="mt-2 text-lg text-ink-soft">Takes less time than choosing a README emoji.</p>
          <div className="mt-6 flex justify-center gap-3">
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

function Demo({ title, src, rotate }: { title: string; src: string; rotate: string }) {
  return (
    <figure className={`${rotate}`}>
      <div className="sketch p-2 bg-[#fffdf7]">
        <img src={src} alt={title} className="h-auto w-full" loading="lazy" />
      </div>
      <figcaption className="mt-2 text-center text-muted">{title}</figcaption>
    </figure>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="relative sketch p-6 pt-8">
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
