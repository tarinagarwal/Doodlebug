<div align="center">

<img src="https://doodle-bug.vercel.app/api/card/banner?name=Doodlebug&text=Hand-drawn%20GitHub%20stats%20cards%20for%20your%20README&subtitle=stats%20%C2%B7%20streaks%20%C2%B7%20languages%20%C2%B7%20trophies%20%C2%B7%20banners&icons=code,star,heart,rocket,coffee,fire,sparkle,bolt&theme=paper" alt="Doodlebug" width="100%"/>

**[doodle-bug.vercel.app](https://doodle-bug.vercel.app)** · [Docs](https://doodle-bug.vercel.app/docs) · [Report a bug](https://github.com/tarinagarwal/Doodlebug/issues)

Doodlebug turns your GitHub activity into **hand-drawn SVG cards** — every stroke is generated with [rough.js](https://roughjs.com) and a per-user seed, with real handwriting fonts embedded, so cards render anywhere (including GitHub READMEs) and no two look exactly alike.

</div>

## Cards

| | |
|---|---|
| <img src="https://doodle-bug.vercel.app/api/card/stats?username=tarinagarwal&show=followers" alt="stats"/> | <img src="https://doodle-bug.vercel.app/api/card/streak?username=tarinagarwal&theme=sticky" alt="streak"/> |
| <img src="https://doodle-bug.vercel.app/api/card/langs?username=tarinagarwal&theme=notebook&layout=donut" alt="languages"/> | <img src="https://doodle-bug.vercel.app/api/card/graph?username=tarinagarwal&theme=midnight&days=45" alt="graph"/> |
| <img src="https://doodle-bug.vercel.app/api/card/repo?username=tarinagarwal&repo=Doodlebug&theme=sakura" alt="repo"/> | <img src="https://doodle-bug.vercel.app/api/card/skills?skills=TypeScript,React,Node.js,Python,MongoDB,Redis,Docker&theme=kraft" alt="skills"/> |

<img src="https://doodle-bug.vercel.app/api/card/trophies?username=tarinagarwal&theme=chalkboard" alt="trophies"/>

<img src="https://doodle-bug.vercel.app/api/card/activity?username=tarinagarwal&theme=grid&weeks=40" alt="activity"/>

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

## Usage

```
https://doodle-bug.vercel.app/api/card/<type>?username=<login>&theme=<theme>&…
```

```md
[![My stats](https://doodle-bug.vercel.app/api/card/stats?username=octocat&theme=chalkboard)](https://github.com/octocat)
```

Themes: `paper` `notebook` `grid` `sticky` `kraft` `sakura` `forest` `ocean` `candy` `chalkboard` `blueprint` `midnight` `graphite` `dracula` — or override any colour with `bg`, `ink`, `accent`, `accent2`, `muted` (hex without `#`).

Every parameter is documented on the [docs page](https://doodle-bug.vercel.app/docs), and the [dashboard](https://doodle-bug.vercel.app/dashboard) has a live builder that writes the markdown for you.

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

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string (users, cache, rate limits) |
| `JWT_SECRET` | Session signing secret (≥32 chars) |
| `ENCRYPTION_KEY` | 64 hex chars — AES-256-GCM key for stored GitHub tokens |
| `APP_URL` | Public URL, used in emails and generated snippets |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` `MAIL_FROM` | Verification / password-reset email |
| `GITHUB_TOKEN` | Optional server-wide fallback token for public fetching |
| `OPENAI_API_KEY` | Optional — only for `pnpm gen:assets` (illustration generation) |

Deploys to Vercel with zero config.

## How it is built

- **Next.js 15** (App Router) + TypeScript + Tailwind v4 — the UI itself is hand-drawn too (wobbly borders, tape, marker highlights).
- **rough.js** generator running server-side to sketch every rectangle, ring, arc and icon; deterministic per user via seeded randomness.
- **Embedded fonts** — Patrick Hand, Caveat and Kalam subset to Latin and base64-embedded so SVGs render inside GitHub's image proxy.
- **GitHub data** — GraphQL when a token is available, REST + the public contribution graph otherwise; results cached in MongoDB with stale-while-revalidate semantics.
- **Auth** — email + password, SMTP verification, JWT session cookies, bcrypt, per-IP rate limiting.

## License

MIT © [Tarin Agarwal](https://github.com/tarinagarwal)
