export type RankLevel = "S" | "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C";

export interface Rank {
  level: RankLevel;
  /** 0..100 — lower is better (percentile) */
  percentile: number;
}

export interface UserStats {
  login: string;
  name: string;
  avatarUrl: string;
  bio: string;
  location: string;
  company: string;
  websiteUrl: string;
  followers: number;
  following: number;
  publicRepos: number;
  createdAt: string;
  totalStars: number;
  totalForks: number;
  totalCommits: number; // all-time (search API) when available, else this-year contributions
  commitsThisYear: number;
  totalPRs: number;
  mergedPRs: number;
  totalIssues: number;
  totalReviews: number;
  contributedTo: number;
  rank: Rank;
}

export interface LangSlice {
  name: string;
  color: string;
  size: number;
  percent: number;
}

export interface LangStats {
  languages: LangSlice[];
  total: number;
  /** "bytes" when computed from GraphQL language sizes; "repos" when only primary languages were available */
  basis: "bytes" | "repos";
}

export interface CalendarDay {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface StreakRange {
  count: number;
  start: string | null;
  end: string | null;
}

export interface StreakStats {
  totalContributions: number;
  firstContribution: string | null;
  currentStreak: StreakRange;
  longestStreak: StreakRange;
  /** last 365 days, oldest first */
  calendar: CalendarDay[];
  /** all-time span used for the totals ("2019-2026") */
  since: string;
}

export interface RepoInfo {
  owner: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string | null;
  languageColor: string | null;
  isArchived: boolean;
  isTemplate: boolean;
  isFork: boolean;
  topics: string[];
  updatedAt: string;
}

export interface TopRepo {
  name: string;
  stars: number;
  forks: number;
  language: string | null;
  languageColor: string | null;
  description: string;
}

export interface UserBundle {
  stats: UserStats;
  langs: LangStats;
  streak: StreakStats;
  topRepos: TopRepo[];
  fetchedAt: string;
  source: "graphql" | "rest";
}
