import { ghGraphql, ghHtml, ghRest, GitHubError } from "./client";
import { calculateRank, computeStreaks, langColor, todayIso } from "./compute";
import type { CalendarDay, LangSlice, LangStats, RepoInfo, StreakStats, TopRepo, UserBundle, UserStats } from "./types";

/* ============================ helpers ============================ */

function parseContribHtml(html: string): CalendarDay[] {
  const days = new Map<string, { id: string; level: number }>();
  const tdRe = /<td\b[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = tdRe.exec(html))) {
    const tag = m[0];
    const id = /\bid="([^"]+)"/.exec(tag)?.[1] ?? "";
    const level = Number(/\bdata-level="(\d)"/.exec(tag)?.[1] ?? 0);
    days.set(m[1], { id, level });
  }
  const tipCounts = new Map<string, number>();
  const tipRe = /<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g;
  while ((m = tipRe.exec(html))) {
    const text = m[2].trim();
    const num = /^([\d,]+)\s+contribution/i.exec(text);
    tipCounts.set(m[1], num ? Number(num[1].replace(/,/g, "")) : 0);
  }
  const out: CalendarDay[] = [];
  for (const [date, { id, level }] of days) {
    const c = tipCounts.get(id);
    out.push({ date, count: c ?? (level > 0 ? level : 0) });
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : 1));
}

function yearsSince(createdAt: string, cap: number): number[] {
  const start = new Date(createdAt).getUTCFullYear();
  const now = new Date().getUTCFullYear();
  const years: number[] = [];
  for (let y = now; y >= start && years.length < cap; y--) years.push(y);
  return years.reverse();
}

function mergeCalendars(cals: CalendarDay[][]): CalendarDay[] {
  const map = new Map<string, number>();
  for (const cal of cals) for (const d of cal) map.set(d.date, Math.max(map.get(d.date) ?? 0, d.count));
  return [...map.entries()].map(([date, count]) => ({ date, count })).sort((a, b) => (a.date < b.date ? -1 : 1));
}

function last365(days: CalendarDay[]): CalendarDay[] {
  const today = todayIso();
  const cutoff = new Date(today + "T00:00:00Z");
  cutoff.setUTCDate(cutoff.getUTCDate() - 365);
  const cut = cutoff.toISOString().slice(0, 10);
  const map = new Map(days.map((d) => [d.date, d.count]));
  const out: CalendarDay[] = [];
  const cur = new Date(cut + "T00:00:00Z");
  cur.setUTCDate(cur.getUTCDate() + 1);
  while (cur.toISOString().slice(0, 10) <= today) {
    const iso = cur.toISOString().slice(0, 10);
    out.push({ date: iso, count: map.get(iso) ?? 0 });
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

function buildStreak(allDays: CalendarDay[], createdAt: string, yearsCovered: number[]): StreakStats {
  const s = computeStreaks(allDays);
  const since = yearsCovered.length ? `${yearsCovered[0]}` : new Date(createdAt).getUTCFullYear().toString();
  return { ...s, calendar: last365(allDays), since };
}

async function searchCount(q: string, token?: string): Promise<number> {
  try {
    const r = await ghRest<{ total_count: number }>(`/search/issues?q=${encodeURIComponent(q)}&per_page=1`, token);
    return r.total_count ?? 0;
  } catch {
    return -1;
  }
}

async function allTimeCommits(login: string, token?: string): Promise<number> {
  try {
    const r = await ghRest<{ total_count: number }>(`/search/commits?q=${encodeURIComponent(`author:${login}`)}&per_page=1`, token);
    return r.total_count ?? -1;
  } catch {
    return -1;
  }
}

/* ============================ GraphQL path ============================ */

const USER_QUERY = `
query($login: String!, $after: String) {
  user(login: $login) {
    login name avatarUrl bio location company websiteUrl createdAt
    followers { totalCount }
    following { totalCount }
    repositories(first: 100, after: $after, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes {
        name description stargazerCount forkCount isFork isArchived isPrivate
        primaryLanguage { name color }
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } }
      }
    }
    contributionsCollection {
      totalCommitContributions restrictedContributionsCount totalPullRequestReviewContributions
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
    }
    pullRequests { totalCount }
    mergedPRs: pullRequests(states: MERGED) { totalCount }
    issues { totalCount }
    repositoriesContributedTo(contributionTypes: [COMMIT, ISSUE, PULL_REQUEST, REPOSITORY], first: 1) { totalCount }
  }
}`;

const REPOS_PAGE_QUERY = `
query($login: String!, $after: String) {
  user(login: $login) {
    repositories(first: 100, after: $after, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        name description stargazerCount forkCount isFork isArchived isPrivate
        primaryLanguage { name color }
        languages(first: 10, orderBy: {field: SIZE, direction: DESC}) { edges { size node { name color } } }
      }
    }
  }
}`;

interface GqlRepo {
  name: string;
  description: string | null;
  stargazerCount: number;
  forkCount: number;
  isFork: boolean;
  isArchived: boolean;
  isPrivate: boolean;
  primaryLanguage: { name: string; color: string | null } | null;
  languages: { edges: { size: number; node: { name: string; color: string | null } }[] };
}
interface GqlUser {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  websiteUrl: string | null;
  createdAt: string;
  followers: { totalCount: number };
  following: { totalCount: number };
  repositories: { totalCount: number; pageInfo: { hasNextPage: boolean; endCursor: string | null }; nodes: GqlRepo[] };
  contributionsCollection: {
    totalCommitContributions: number;
    restrictedContributionsCount: number;
    totalPullRequestReviewContributions: number;
    contributionCalendar: { totalContributions: number; weeks: { contributionDays: { date: string; contributionCount: number }[] }[] };
  };
  pullRequests: { totalCount: number };
  mergedPRs: { totalCount: number };
  issues: { totalCount: number };
  repositoriesContributedTo: { totalCount: number };
}

async function fetchYearCalendarsGql(login: string, years: number[], token: string): Promise<CalendarDay[][]> {
  if (!years.length) return [];
  const parts = years
    .map(
      (y) =>
        `y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") { contributionCalendar { weeks { contributionDays { date contributionCount } } } }`,
    )
    .join("\n");
  const q = `query($login: String!) { user(login: $login) { ${parts} } }`;
  const data = await ghGraphql<{ user: Record<string, { contributionCalendar: { weeks: { contributionDays: { date: string; contributionCount: number }[] }[] } }> }>(q, { login }, token);
  return years.map((y) => {
    const cal = data.user[`y${y}`]?.contributionCalendar;
    return (cal?.weeks ?? []).flatMap((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })));
  });
}

async function fetchViaGraphql(login: string, token: string): Promise<UserBundle> {
  const first = await ghGraphql<{ user: GqlUser | null }>(USER_QUERY, { login, after: null }, token);
  if (!first.user) throw new GitHubError("not_found", "GitHub user not found", 404);
  const u = first.user;
  const repos: GqlRepo[] = [...u.repositories.nodes];
  let page = u.repositories.pageInfo;
  let guard = 0;
  while (page.hasNextPage && guard < 4) {
    const next = await ghGraphql<{ user: { repositories: { pageInfo: typeof page; nodes: GqlRepo[] } } }>(REPOS_PAGE_QUERY, { login, after: page.endCursor }, token);
    repos.push(...next.user.repositories.nodes);
    page = next.user.repositories.pageInfo;
    guard++;
  }

  const years = yearsSince(u.createdAt, 12);
  const [yearCals, commitsAll] = await Promise.all([fetchYearCalendarsGql(login, years, token).catch(() => [] as CalendarDay[][]), allTimeCommits(login, token)]);
  const thisYearCal = u.contributionsCollection.contributionCalendar.weeks.flatMap((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })));
  const allDays = mergeCalendars([...yearCals, thisYearCal]);

  const ownRepos = repos.filter((r) => !r.isFork);
  const totalStars = repos.reduce((a, r) => a + r.stargazerCount, 0);
  const totalForks = repos.reduce((a, r) => a + r.forkCount, 0);
  const commitsThisYear = u.contributionsCollection.totalCommitContributions + u.contributionsCollection.restrictedContributionsCount;

  // languages by bytes
  const bytes = new Map<string, { size: number; color: string }>();
  for (const r of ownRepos) {
    for (const e of r.languages.edges) {
      const prev = bytes.get(e.node.name);
      bytes.set(e.node.name, { size: (prev?.size ?? 0) + e.size, color: e.node.color ?? langColor(e.node.name) });
    }
  }
  const langs = toLangStats([...bytes.entries()].map(([name, v]) => ({ name, size: v.size, color: v.color })), "bytes");

  const stats: UserStats = {
    login: u.login,
    name: u.name || u.login,
    avatarUrl: u.avatarUrl,
    bio: u.bio ?? "",
    location: u.location ?? "",
    company: u.company ?? "",
    websiteUrl: u.websiteUrl ?? "",
    followers: u.followers.totalCount,
    following: u.following.totalCount,
    publicRepos: u.repositories.totalCount,
    createdAt: u.createdAt,
    totalStars,
    totalForks,
    totalCommits: commitsAll >= 0 ? commitsAll : commitsThisYear,
    commitsThisYear,
    totalPRs: u.pullRequests.totalCount,
    mergedPRs: u.mergedPRs.totalCount,
    totalIssues: u.issues.totalCount,
    totalReviews: u.contributionsCollection.totalPullRequestReviewContributions,
    contributedTo: u.repositoriesContributedTo.totalCount,
    rank: calculateRank({
      allCommits: commitsAll >= 0,
      commits: commitsAll >= 0 ? commitsAll : commitsThisYear,
      prs: u.pullRequests.totalCount,
      issues: u.issues.totalCount,
      reviews: u.contributionsCollection.totalPullRequestReviewContributions,
      stars: totalStars,
      followers: u.followers.totalCount,
    }),
  };

  const topRepos: TopRepo[] = [...ownRepos]
    .sort((a, b) => b.stargazerCount - a.stargazerCount)
    .slice(0, 6)
    .map((r) => ({
      name: r.name,
      stars: r.stargazerCount,
      forks: r.forkCount,
      language: r.primaryLanguage?.name ?? null,
      languageColor: r.primaryLanguage?.color ?? null,
      description: r.description ?? "",
    }));

  return { stats, langs, streak: buildStreak(allDays, u.createdAt, years), topRepos, fetchedAt: new Date().toISOString(), source: "graphql" };
}

/* ============================ REST + HTML path ============================ */

interface RestUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
}
interface RestRepo {
  name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
  archived: boolean;
  language: string | null;
  size: number;
  topics?: string[];
  updated_at: string;
  is_template?: boolean;
}

async function fetchViaRest(login: string, token?: string): Promise<UserBundle> {
  const [u, ...pages] = await Promise.all([
    ghRest<RestUser>(`/users/${encodeURIComponent(login)}`, token),
    ...[1, 2, 3].map((p) => ghRest<RestRepo[]>(`/users/${encodeURIComponent(login)}/repos?per_page=100&type=owner&sort=pushed&page=${p}`, token).catch(() => [] as RestRepo[])),
  ]);
  const repos: RestRepo[] = (pages as RestRepo[][]).flat();
  const years = yearsSince(u.created_at, 6);
  const [prs, merged, issues, commitsAll, ...yearHtml] = await Promise.all([
    searchCount(`author:${login} type:pr`, token),
    searchCount(`author:${login} type:pr is:merged`, token),
    searchCount(`author:${login} type:issue`, token),
    allTimeCommits(login, token),
    ...years.map((y) => ghHtml(`https://github.com/users/${encodeURIComponent(login)}/contributions?from=${y}-01-01&to=${y}-12-31`).catch(() => "")),
  ]);
  const yearCals = (yearHtml as string[]).filter(Boolean).map(parseContribHtml);
  let allDays = mergeCalendars(yearCals);
  if (!allDays.length) {
    // last resort: default graph (last year)
    const html = await ghHtml(`https://github.com/users/${encodeURIComponent(login)}/contributions`).catch(() => "");
    allDays = html ? parseContribHtml(html) : [];
  }
  const thisYear = new Date().getUTCFullYear().toString();
  const commitsThisYear = allDays.filter((d) => d.date.startsWith(thisYear)).reduce((a, d) => a + d.count, 0);

  const ownRepos = repos.filter((r) => !r.fork);
  const totalStars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const totalForks = repos.reduce((a, r) => a + r.forks_count, 0);
  const byLang = new Map<string, number>();
  for (const r of ownRepos) if (r.language) byLang.set(r.language, (byLang.get(r.language) ?? 0) + Math.max(1, r.size));
  const langs = toLangStats([...byLang.entries()].map(([name, size]) => ({ name, size, color: langColor(name) })), "repos");

  const commits = commitsAll >= 0 ? commitsAll : commitsThisYear;
  const stats: UserStats = {
    login: u.login,
    name: u.name || u.login,
    avatarUrl: u.avatar_url,
    bio: u.bio ?? "",
    location: u.location ?? "",
    company: u.company ?? "",
    websiteUrl: u.blog ?? "",
    followers: u.followers,
    following: u.following,
    publicRepos: u.public_repos,
    createdAt: u.created_at,
    totalStars,
    totalForks,
    totalCommits: commits,
    commitsThisYear,
    totalPRs: Math.max(0, prs),
    mergedPRs: Math.max(0, merged),
    totalIssues: Math.max(0, issues),
    totalReviews: 0,
    contributedTo: -1,
    rank: calculateRank({ allCommits: commitsAll >= 0, commits, prs: Math.max(0, prs), issues: Math.max(0, issues), reviews: 0, stars: totalStars, followers: u.followers }),
  };
  const topRepos: TopRepo[] = [...ownRepos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6)
    .map((r) => ({ name: r.name, stars: r.stargazers_count, forks: r.forks_count, language: r.language, languageColor: langColor(r.language), description: r.description ?? "" }));

  return { stats, langs, streak: buildStreak(allDays, u.created_at, years), topRepos, fetchedAt: new Date().toISOString(), source: "rest" };
}

function toLangStats(items: { name: string; size: number; color: string }[], basis: LangStats["basis"]): LangStats {
  const total = items.reduce((a, l) => a + l.size, 0) || 1;
  const languages: LangSlice[] = items
    .sort((a, b) => b.size - a.size)
    .map((l) => ({ name: l.name, color: l.color, size: l.size, percent: Math.round((l.size / total) * 1000) / 10 }));
  return { languages, total, basis };
}

/* ============================ public API ============================ */

export async function fetchUserBundle(login: string, token?: string): Promise<UserBundle> {
  if (token) {
    try {
      return await fetchViaGraphql(login, token);
    } catch (e) {
      // A bad token should not brick the card — fall back to public data.
      if (e instanceof GitHubError && (e.kind === "unauthorized" || e.kind === "other")) return fetchViaRest(login);
      throw e;
    }
  }
  return fetchViaRest(login, process.env.GITHUB_TOKEN || undefined);
}

export async function fetchRepo(owner: string, name: string, token?: string): Promise<RepoInfo> {
  const t = token || process.env.GITHUB_TOKEN || undefined;
  const r = await ghRest<RestRepo & { owner: { login: string } }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`, t);
  return {
    owner: r.owner.login,
    name: r.name,
    description: r.description ?? "",
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    languageColor: langColor(r.language),
    isArchived: r.archived,
    isTemplate: Boolean(r.is_template),
    isFork: r.fork,
    topics: r.topics ?? [],
    updatedAt: r.updated_at,
  };
}

/** Validates a PAT and returns the login it belongs to. */
export async function validateToken(token: string): Promise<{ login: string; scopes: string[] }> {
  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "Doodlebug/1.0" },
    cache: "no-store",
  });
  if (!res.ok) throw new GitHubError(res.status === 401 ? "unauthorized" : "other", "Token rejected by GitHub", res.status);
  const j = (await res.json()) as { login: string };
  const scopes = (res.headers.get("x-oauth-scopes") || "").split(",").map((s) => s.trim()).filter(Boolean);
  return { login: j.login, scopes };
}
