import Link from "next/link";
import { Icon, Sparkle, Squiggle, Star } from "@/components/doodles";

const PERKS = [
  { icon: "cards", title: "13 hand-drawn card types", body: "Stats, streaks, languages, trophies, heatmaps, banners, projects, achievements…" },
  { icon: "palette", title: "14 themes + your own colours", body: "Paper, notebook, chalkboard, blueprint — or override any hex." },
  { icon: "key", title: "Optional GitHub token", body: "Encrypted at rest. Unlocks private-contribution counts and no rate limits." },
  { icon: "bolt", title: "Live builder → copy markdown", body: "Preview is the exact SVG GitHub renders. Cards refresh themselves." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:px-6 lg:grid-cols-[1.1fr_1fr] lg:py-16">
      {/* ---------- left: illustration + perks ---------- */}
      <aside className="order-2 lg:order-1">
        <div className="relative mx-auto max-w-lg lg:mx-0">
          <Sparkle className="absolute -left-4 top-6 rotate-12" size={26} />
          <Star className="absolute right-2 -top-3 -rotate-12" size={24} color="#ff5da2" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/auth.webp" alt="Doodlebug mascot writing in a notebook" width={640} height={640} className="float mx-auto h-auto w-64 md:w-80 lg:w-[22rem]" />
        </div>
        <h2 className="title-hand mt-2 text-4xl md:text-5xl">
          Your README, <span className="hl">but doodled.</span>
        </h2>
        <p className="mt-2 max-w-md text-lg text-ink-soft">One account, unlimited wobbly cards. Free forever — we only email you to verify or reset.</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {PERKS.map((p, i) => (
            <li key={p.title} className={`${i % 2 ? "sketch-2" : "sketch"} p-3.5`}>
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-ink bg-accent">
                  <Icon name={p.icon} size={16} />
                </span>
                <b className="leading-tight">{p.title}</b>
              </div>
              <p className="mt-1.5 text-[0.95rem] text-ink-soft">{p.body}</p>
            </li>
          ))}
        </ul>
        <div className="mt-6 -rotate-1 sketch-3 tape relative p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/api/card/streak?username=tarinagarwal&theme=sticky&title=Your%20streak%20could%20look%20like%20this" alt="Example streak card" className="h-auto w-full" loading="lazy" />
        </div>
        <p className="mt-4 text-sm text-muted">
          Curious first?{" "}
          <Link href="/docs" className="underline-squiggle">
            Read the docs
          </Link>{" "}
          — cards work for any public GitHub user, no login needed to view them.
        </p>
      </aside>

      {/* ---------- right: the form ---------- */}
      <div className="order-1 lg:order-2">
        <div className="relative mx-auto w-full max-w-md sketch-2 tape p-6 md:p-8">
          <Squiggle className="absolute -bottom-3 right-6" width={80} />
          {children}
        </div>
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-muted">
          By continuing you agree to keep your pen wobbly. See our{" "}
          <Link href="/privacy" className="underline-squiggle">
            privacy note
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
