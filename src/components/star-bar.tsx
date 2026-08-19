const REPO_OWNER = "tarinagarwal";
const REPO_NAME = "Doodlebug";
const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

/** A wobbly, hand-drawn star with a wink of sparkle — matches the card aesthetic. */
function CuteStar({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <g stroke="#2b2b2b" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
        {/* deliberately off-perfect points so it reads as drawn rather than generated */}
        <path
          d="M12 2.6 C12.9 5 13.7 6.9 14.8 8.4 C16.6 8.7 18.7 9 21.2 9.3 C19.5 11 18 12.5 16.5 13.9 C16.9 16.2 17.4 18.3 17.8 20.8 C15.7 19.6 13.8 18.6 12 17.5 C10.1 18.6 8.2 19.7 6.1 20.8 C6.6 18.3 7 16.2 7.4 13.9 C5.9 12.5 4.4 11 2.7 9.3 C5.2 9 7.3 8.7 9.1 8.4 C10.2 6.9 11 5 12 2.6 Z"
          fill="#f7b32b"
        />
        <path d="M10.2 10.8 c0.6 0.5 1.3 0.8 2 0.8" strokeWidth="1.1" fill="none" opacity="0.55" />
      </g>
      <path d="M20.4 3.2 l0.9 1.9 1.9 0.9 -1.9 0.9 -0.9 1.9 -0.9 -1.9 -1.9 -0.9 1.9 -0.9 Z" fill="#2a9d8f" />
    </svg>
  );
}

function formatStars(n: number): string {
  if (n >= 10_000) return (n / 1000).toFixed(0) + "k";
  if (n >= 1_000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString("en-US");
}

/**
 * Deliberately a plain fetch on Next's data cache rather than the Redis-backed `getRepo`.
 *
 * This runs in the root layout, so it renders on every page. Routing it through the card
 * cache would make it a `no-store` call and force statically renderable pages — the home page
 * and the themes gallery — to become dynamic. One revalidating fetch per hour costs nothing
 * and keeps those pages static.
 */
async function fetchStars(): Promise<number | null> {
  const token = process.env.GITHUB_TOKEN;
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "Doodlebug/1.0",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { stargazers_count?: number };
    return typeof json.stargazers_count === "number" ? json.stargazers_count : null;
  } catch {
    return null;
  }
}

/**
 * Thin bar above the header. It sticks along with the nav rather than scrolling away, so the
 * whole site chrome moves as one block — see `--db-chrome` in globals.css, which every other
 * fixed element offsets against.
 *
 * The star count is best-effort: a failure drops the number, not the bar.
 */
export async function StarBar() {
  const stars = await fetchStars();

  return (
    <div className="border-b-2 border-ink/70 bg-[#fff3cf]">
      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
        className="group mx-auto flex h-9 w-full items-center justify-center gap-2 px-3 text-[0.86rem] leading-none sm:text-[0.95rem]"
      >
        <CuteStar />
        <span className="truncate">
          <b>Doodlebug is open source</b>
          <span className="hidden sm:inline"> — if it drew you something nice, star the repo</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 rounded-full border-2 border-ink bg-[#fffdf7] px-2 py-0.5 text-[0.8rem] leading-none shadow-[1.5px_1.5px_0_#2b2b2b] transition group-hover:-translate-y-px group-hover:shadow-[2.5px_2.5px_0_#2b2b2b]">
          <svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2.6 L14.8 8.4 L21.2 9.3 L16.5 13.9 L17.8 20.8 L12 17.5 L6.1 20.8 L7.4 13.9 L2.7 9.3 L9.1 8.4 Z" fill="#f7b32b" stroke="#2b2b2b" strokeWidth="1.8" strokeLinejoin="round" />
          </svg>
          <span className="tabular-nums">{stars === null ? "Star" : formatStars(stars)}</span>
        </span>
      </a>
    </div>
  );
}
