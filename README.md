<div align="center">

<img src="https://doodlebug.tarinagarwal.in/api/card/banner?name=Doodlebug&text=Hand-drawn%20GitHub%20stats%20cards%20for%20your%20README&subtitle=stats%20%C2%B7%20streaks%20%C2%B7%20languages%20%C2%B7%20trophies%20%C2%B7%20banners&icons=code,star,heart,rocket,coffee,fire,sparkle,bolt&theme=paper" alt="Doodlebug" width="100%"/>

# Doodlebug

**Open-source hand-drawn GitHub stats cards for your README.**

Doodlebug turns your GitHub activity into **hand-drawn SVG cards** — every stroke is generated
with [rough.js](https://roughjs.com) and a per-user seed, with real handwriting fonts embedded,
so cards render anywhere (including GitHub READMEs) and no two look exactly alike.

[![License: MIT](https://img.shields.io/badge/License-MIT-f7b32b.svg)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-2b2b2b.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-2b2b2b.svg)](https://www.typescriptlang.org/)
[![rough.js](https://img.shields.io/badge/rough.js-4-2b2b2b.svg)](https://roughjs.com)
[![CI](https://github.com/tarinagarwal/Doodlebug/actions/workflows/ci.yml/badge.svg)](https://github.com/tarinagarwal/Doodlebug/actions/workflows/ci.yml)

**A [DevsBazaar](https://devsbazaar.com) product — open sourced.**

[Live site](https://doodlebug.tarinagarwal.in) ·
[Docs](https://doodlebug.tarinagarwal.in/docs) ·
[Themes](https://doodlebug.tarinagarwal.in/themes) ·
[Report a bug](https://github.com/tarinagarwal/Doodlebug/issues)

</div>

---

## Why Doodlebug exists

Every README has the same stats card on it. They are competently drawn, identical to each
other, and forgettable.

Doodlebug draws yours by hand instead. Nothing is a template: every rectangle, ring, arc and
icon is generated stroke by stroke with rough.js from a seed derived from your username, so
your card is wobbly in a way nobody else's is. The handwriting fonts are embedded in the SVG
rather than linked, which is what lets the result survive GitHub's image proxy.

It is free, it needs no token to get started, and the whole thing — the card engine, the
builder, the accounts, the caching — is in this repository. Run it hosted, or self-host the
lot.

---

## Cards

| | |
|---|---|
| <img src="https://doodlebug.tarinagarwal.in/api/card/stats?username=tarinagarwal&show=followers" alt="stats"/> | <img src="https://doodlebug.tarinagarwal.in/api/card/streak?username=tarinagarwal&theme=sticky" alt="streak"/> |
| <img src="https://doodlebug.tarinagarwal.in/api/card/langs?username=tarinagarwal&theme=notebook&layout=donut" alt="languages"/> | <img src="https://doodlebug.tarinagarwal.in/api/card/graph?username=tarinagarwal&theme=midnight&days=45" alt="graph"/> |
| <img src="https://doodlebug.tarinagarwal.in/api/card/repo?username=tarinagarwal&repo=Doodlebug&theme=sakura" alt="repo"/> | <img src="https://doodlebug.tarinagarwal.in/api/card/skills?skills=TypeScript,React,Node.js,Python,MongoDB,Redis,Docker&theme=kraft" alt="skills"/> |

<img src="https://doodlebug.tarinagarwal.in/api/card/trophies?username=tarinagarwal&theme=chalkboard" alt="trophies"/>

<img src="https://doodlebug.tarinagarwal.in/api/card/activity?username=tarinagarwal&theme=grid&weeks=40" alt="activity"/>

| | |
|---|---|
| <img src="https://doodlebug.tarinagarwal.in/api/card/project?name=LGTM%20%E2%80%94%20Looks%20Good%20To%20Meow&desc=Live%20AI%20code%20review%20%2B%20CI%2FCD%20security%20SaaS%3A%206-lens%20review%20pipeline%2C%2036%20security%20detectors%2C%20SBOM%2C%20posture%20analytics%2C%20org%20RBAC%20and%20a%20CLI.&tags=Node.js,TypeScript,React,MongoDB,Redis&link=looksgoodtomeow.in&badge=%2336%20Product%20of%20the%20Day&icon=cat&theme=forest" alt="project"/> | <img src="https://doodlebug.tarinagarwal.in/api/card/achievements?items=Winner:%20Gameathon%202K26%20%26%20Buildverse%202025;Runner-up:%20GameForge%2C%20CodeSprint%2C%20Hacksphere%202025;Top%20100:%20Hackhazards%202025%20(8000%2B%20participants)&theme=paper&width=440" alt="achievements"/> |

<a href="https://tarinagarwal.in"><img src="https://doodlebug.tarinagarwal.in/api/card/link?label=Portfolio&sub=tarinagarwal.in&icon=globe" alt="portfolio" height="60"/></a> <a href="https://linkedin.com/in/tarin-agarwal-810793267"><img src="https://doodlebug.tarinagarwal.in/api/card/link?label=LinkedIn&icon=linkedin&theme=ocean" alt="linkedin" height="60"/></a> <a href="mailto:tarinagarwal@gmail.com"><img src="https://doodlebug.tarinagarwal.in/api/card/link?label=Email&icon=mail&theme=sakura&style=outline" alt="email" height="60"/></a>

| Type | What it draws |
|---|---|
| `stats` | Stars, commits, PRs, issues (+ optional merged/reviews/followers/repos/forks) and a hand-drawn rank ring |
| `langs` | Top languages as sketched bars, a donut, a pie or a compact strip |
| `streak` | Total contributions, current streak in a flame ring, longest streak |
| `activity` | A wobbly contribution heatmap (8–53 weeks) |
| `graph` | Hand-drawn line chart of daily contributions (7–120 days) |
| `trophies` | Shields ranked C → SS for stars, commits, PRs, issues, followers, repos, streaks |
| `repo` | Pin any repository: description, language, stars, forks, topics |
| `banner` | Wide handwritten header with your name, tagline and doodles |
| `skills` | Your stack as sketched stickers |
| `note` | A taped sticky note with handwritten text |
| `project` | Your own title, description, tags, link and ribbon badge — optionally merged with live repo stats |
| `achievements` | Hackathon wins, awards, certifications as numbered hand-drawn medals |
| `link` | A hand-drawn button for portfolio / LinkedIn / email — wrap it in a link |

## Usage

```
https://doodlebug.tarinagarwal.in/api/card/<type>?username=<login>&theme=<theme>&…
```

```md
[![My stats](https://doodlebug.tarinagarwal.in/api/card/stats?username=octocat&theme=chalkboard)](https://github.com/octocat)
```

Themes: `paper` `notebook` `grid` `sticky` `kraft` `sakura` `forest` `ocean` `candy` `chalkboard` `blueprint` `midnight` `graphite` `dracula` — or override any colour with `bg`, `ink`, `accent`, `accent2`, `muted` (hex without `#`). Browse them all on the [themes page](https://doodlebug.tarinagarwal.in/themes).

`theme=auto` ships a single card that recolours itself: drawn in the paper palette, swapped to midnight under `prefers-color-scheme: dark`. Worth knowing that an SVG loaded through `<img>` follows the reader's browser/OS setting rather than GitHub's own light/dark toggle, so it suits most readers but not every one.

### Saved cards get a short, stable URL

Save a design in the dashboard and it is also served from a fixed address:

```
https://doodlebug.tarinagarwal.in/c/<saved-card-id>.svg
```

Paste that into your README once. Restyling the card in the dashboard updates every README using it — you never edit the markdown again. Query params still work and take precedence, so `?theme=midnight` previews a variant without saving a second card.

Every parameter is documented on the [docs page](https://doodlebug.tarinagarwal.in/docs). The [dashboard](https://doodlebug.tarinagarwal.in/dashboard) has a guided builder (sidebar of card types, quick-start presets, live preview, one-click markdown), and every design can be **saved and edited later** under *My cards*.

### Public data vs. your own token

Cards work for any public GitHub user out of the box using GitHub's public API and the public contribution graph. Those endpoints have shared rate limits, so under heavy traffic a card can temporarily show a "rate limited" doodle.

Create a free Doodlebug account, save your GitHub username and (optionally) a personal access token: it is stored AES-256-GCM encrypted, only decrypted in memory to talk to `api.github.com`, and Doodlebug will use it whenever anyone loads a card for your username. That unlocks the GraphQL API — private-contribution counts, accurate language bytes, review counts and no shared limits.

## Self-hosting

```bash
git clone https://github.com/tarinagarwal/Doodlebug
cd Doodlebug
pnpm install
cp .env.example .env.local   # fill in MongoDB, SMTP, secrets
pnpm dev
```

```bash
pnpm test        # card rendering + library unit tests (vitest, no DB or network needed)
pnpm lint        # eslint
pnpm typecheck   # tsc --noEmit
```

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string (accounts, saved cards) |
| `JWT_SECRET` | Session signing secret (≥32 chars) |
| `ENCRYPTION_KEY` | 64 hex chars — AES-256-GCM key for stored GitHub tokens |
| `APP_URL` | Public URL, used in emails and generated snippets |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `MAIL_FROM` | Verification / password-reset email |
| `GITHUB_TOKEN` | Server-wide fallback token for public fetching. Strongly recommended: a **classic PAT with no scopes ticked** lifts the rate limit from 60/hr to 5,000/hr and switches every visitor onto the GraphQL path |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional Redis for the GitHub cache and rate-limit buckets. Falls back to MongoDB when unset. Use a **regional** database in the same region as your deployment, with **eviction enabled** |
| `OPENAI_API_KEY` | Optional — only for `pnpm gen:assets` (illustration generation) |

Deploys to Vercel with zero config.

## How it is built

- **Next.js 15** (App Router) + TypeScript + Tailwind v4 — the UI itself is hand-drawn too (wobbly borders, tape, marker highlights).
- **rough.js** generator running server-side to sketch every rectangle, ring, arc and icon; deterministic per user via seeded randomness.
- **Embedded fonts** — Patrick Hand, Caveat and Kalam subset to Latin and base64-embedded so SVGs render inside GitHub's image proxy.
- **GitHub data** — GraphQL when a token is available, REST + the public contribution graph otherwise; results cached in MongoDB with stale-while-revalidate semantics.
- **Auth** — email + password, SMTP verification, JWT session cookies, bcrypt, per-IP rate limiting. Sessions carry a `tokenVersion`, so a password reset or change strands every session issued before it — including one an attacker is holding.
- **Card hot path** — no blocking database work: flood protection is an in-process counter, and render stats are buffered in memory and flushed as one bulk write after the response is sent. The tight limit sits on *uncached* GitHub lookups, which is where the cost actually is, so a popular README behind GitHub's camo proxy is never throttled for being popular.
- **Tests** — every card type is rendered against a fixture bundle and checked for well-formed SVG, XML escaping, determinism and degenerate input (empty accounts, zero-width slices, 5,000-character text), plus golden snapshots. CI runs typecheck, lint, tests and a build on every push and PR.

## Contributing

Issues and pull requests are welcome. The card renderers are pure functions of
`(bundle, URLSearchParams)`, so a new card type is one file in `src/lib/cards/` plus an entry
in `src/lib/cards/meta.ts` — and the test suite renders every registered type automatically,
so coverage comes for free.

```bash
pnpm test        # 93 tests, no database or network needed
pnpm lint
pnpm typecheck
```

Please report security vulnerabilities privately to **tarinagarwal@gmail.com** rather than in
a public issue.

Questions, ideas or commercial enquiries: **tarinagarwal@gmail.com**

---

## License

[MIT](LICENSE) — use it, fork it, sell it. No licence fee, no attribution required.

<div align="center">

Built and open sourced by **[DevsBazaar](https://devsbazaar.com)**

</div>
