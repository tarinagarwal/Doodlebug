import type { CalendarDay, RepoInfo, UserBundle } from "@/lib/github/types";

/**
 * A deterministic stand-in for a live GitHub fetch. Card renderers are pure functions of
 * (bundle, params), so every rendering test runs against this — no database, no network.
 */

function calendar(days: number, pattern: (i: number) => number): CalendarDay[] {
  const out: CalendarDay[] = [];
  const start = new Date("2026-01-01T00:00:00Z");
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setUTCDate(d.getUTCDate() + i);
    out.push({ date: d.toISOString().slice(0, 10), count: pattern(i) });
  }
  return out;
}

export function makeBundle(over: Partial<UserBundle> = {}): UserBundle {
  return {
    stats: {
      login: "octocat",
      name: "The Octocat",
      avatarUrl: "https://avatars.githubusercontent.com/u/583231",
      bio: "Professional cat",
      location: "San Francisco",
      company: "@github",
      websiteUrl: "https://github.blog",
      followers: 14_231,
      following: 9,
      publicRepos: 8,
      createdAt: "2011-01-25T18:44:36Z",
      totalStars: 3_812,
      totalForks: 1_204,
      totalCommits: 12_940,
      commitsThisYear: 1_337,
      totalPRs: 421,
      mergedPRs: 388,
      totalIssues: 96,
      totalReviews: 152,
      contributedTo: 37,
      rank: { level: "A+", percentile: 8.4 },
    },
    langs: {
      languages: [
        { name: "TypeScript", color: "#3178c6", size: 900_000, percent: 45 },
        { name: "Python", color: "#3572A5", size: 500_000, percent: 25 },
        { name: "Go", color: "#00ADD8", size: 300_000, percent: 15 },
        { name: "Rust", color: "#dea584", size: 200_000, percent: 10 },
        { name: "Shell", color: "#89e051", size: 100_000, percent: 5 },
      ],
      total: 2_000_000,
      basis: "bytes",
    },
    streak: {
      totalContributions: 8_412,
      firstContribution: "2011-02-03",
      currentStreak: { count: 42, start: "2026-01-01", end: "2026-02-11" },
      longestStreak: { count: 128, start: "2024-03-01", end: "2024-07-06" },
      calendar: calendar(365, (i) => (i % 7 === 0 ? 0 : (i % 11) + 1)),
      since: "2011",
    },
    topRepos: [
      { name: "Spoon-Knife", stars: 12_000, forks: 140_000, language: "HTML", languageColor: "#e34c26", description: "This repo is for demonstration purposes only." },
      { name: "Hello-World", stars: 2_600, forks: 2_400, language: null, languageColor: null, description: "My first repository on GitHub!" },
    ],
    fetchedAt: "2026-02-11T12:00:00Z",
    source: "graphql",
    ...over,
  };
}

export function makeRepo(over: Partial<RepoInfo> = {}): RepoInfo {
  return {
    owner: "octocat",
    name: "Hello-World",
    description: "My first repository on GitHub!",
    stars: 2_600,
    forks: 2_400,
    language: "TypeScript",
    languageColor: "#3178c6",
    isArchived: false,
    isTemplate: false,
    isFork: false,
    topics: ["demo", "example", "hello-world"],
    updatedAt: "2026-02-01T09:30:00Z",
    ...over,
  };
}

/** An account with nothing in it — the shape that has historically broken layout maths. */
export function emptyBundle(): UserBundle {
  return makeBundle({
    stats: { ...makeBundle().stats, followers: 0, following: 0, publicRepos: 0, totalStars: 0, totalForks: 0, totalCommits: 0, commitsThisYear: 0, totalPRs: 0, mergedPRs: 0, totalIssues: 0, totalReviews: 0, contributedTo: 0, rank: { level: "C", percentile: 99.9 } },
    langs: { languages: [], total: 0, basis: "repos" },
    streak: {
      totalContributions: 0,
      firstContribution: null,
      currentStreak: { count: 0, start: null, end: null },
      longestStreak: { count: 0, start: null, end: null },
      calendar: calendar(365, () => 0),
      since: "2011",
    },
    topRepos: [],
  });
}

/** Strips the embedded base64 font payloads so snapshots stay readable. */
export function stripFonts(svg: string): string {
  return svg.replace(/base64,[A-Za-z0-9+/=]+/g, "base64,<font>");
}
