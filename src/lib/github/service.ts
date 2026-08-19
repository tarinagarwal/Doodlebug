import { after } from "next/server";
import { db } from "../db";
import { User } from "../models";
import { cacheGet, cacheSet } from "../kv";
import { decrypt } from "../crypto";
import { fetchRepo, fetchUserBundle } from "./fetch";
import { GitHubError } from "./client";
import { memRateLimit } from "../ratelimit";
import type { RepoInfo, UserBundle } from "./types";

const FRESH_AUTH_MS = 30 * 60 * 1000;
const FRESH_PUBLIC_MS = 60 * 60 * 1000;
const STALE_MS = 24 * 60 * 60 * 1000;
const NEG_MS = 10 * 60 * 1000;

/**
 * A cache hit costs nothing, so the request limiter on the card route is generous. This is
 * the limit that matters: how many *live* GitHub fetches one caller may trigger. Reaching
 * it needs a caller cycling through logins we have never drawn before, which is exactly the
 * abuse shape worth stopping.
 */
const COLD_FETCH_LIMIT = 30;
const COLD_FETCH_WINDOW_MS = 60 * 1000;

function assertColdFetchAllowed(clientKey: string | undefined, what: string): void {
  if (!clientKey) return;
  if (memRateLimit(`gh-cold:${clientKey}`, COLD_FETCH_LIMIT, COLD_FETCH_WINDOW_MS)) return;
  throw new GitHubError("throttled", `Too many uncached ${what} lookups from this network`);
}

interface Wrapped<T> {
  data: T | null;
  error?: { kind: string; message: string };
  freshUntil: number;
}

export function normalizeLogin(raw: string): string | null {
  const s = raw.trim().replace(/^@/, "");
  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(s)) return null;
  return s.toLowerCase();
}

/** Resolve the best token to use for a given GitHub login. */
export async function resolveToken(login: string): Promise<{ token?: string; owner: boolean }> {
  await db();
  // `githubUsername` is unique among token-bearing accounts (enforced when a token is
  // saved), but sort anyway so a legacy duplicate resolves to the same token every time
  // instead of whichever document Mongo happens to return first.
  const u = await User.findOne({ githubUsername: login, githubTokenEnc: { $exists: true, $ne: null }, emailVerified: true })
    .sort({ githubTokenValidatedAt: -1, _id: 1 })
    .select("githubTokenEnc")
    .lean<{ githubTokenEnc?: string }>();
  if (u?.githubTokenEnc) {
    try {
      return { token: decrypt(u.githubTokenEnc), owner: true };
    } catch {
      /* fallthrough */
    }
  }
  return { token: process.env.GITHUB_TOKEN || undefined, owner: false };
}

async function readCache<T>(key: string): Promise<Wrapped<T> | null> {
  return cacheGet<Wrapped<T>>(key);
}

async function writeCache<T>(key: string, value: Wrapped<T>, ttlMs: number): Promise<void> {
  await cacheSet(key, value, ttlMs);
}

/** Every cache key a login's bundle can live under — both auth states. */
export function bundleCacheKeys(login: string): string[] {
  const l = login.toLowerCase();
  return [`bundle:v2:${l}:auth`, `bundle:v2:${l}:pub`];
}

export interface BundleResult {
  bundle: UserBundle;
  cached: boolean;
  authed: boolean;
}

/**
 * Get a user's stats bundle: fresh cache → live fetch (falls back to stale on error).
 * Throws GitHubError when nothing usable is available.
 */
export async function getBundle(login: string, opts?: { token?: string; bypassCache?: boolean; clientKey?: string }): Promise<BundleResult> {
  const resolved = opts?.token ? { token: opts.token, owner: true } : await resolveToken(login);
  const authed = Boolean(resolved.token);
  const key = `bundle:v2:${login}:${authed ? "auth" : "pub"}`; // keep in sync with bundleCacheKeys()
  const now = Date.now();

  const cached = opts?.bypassCache ? null : await readCache<UserBundle>(key);
  if (cached && cached.freshUntil > now) {
    if (cached.data) return { bundle: cached.data, cached: true, authed };
    if (cached.error) throw new GitHubError(cached.error.kind as GitHubError["kind"], cached.error.message, cached.error.kind === "not_found" ? 404 : 0);
  }

  const refresh = async (): Promise<UserBundle> => {
    const bundle = await fetchUserBundle(login, resolved.token);
    await writeCache(key, { data: bundle, freshUntil: Date.now() + (authed ? FRESH_AUTH_MS : FRESH_PUBLIC_MS) }, STALE_MS);
    return bundle;
  };

  // Stale cache: answer immediately and refresh in the background (GitHub's image proxy has a short timeout).
  if (cached?.data) {
    scheduleBackground(() => refresh());
    return { bundle: cached.data, cached: true, authed };
  }

  try {
    // Nothing usable is cached, so this request is about to hit GitHub for real.
    assertColdFetchAllowed(opts?.clientKey, "profile");
    const bundle = await refresh();
    return { bundle, cached: false, authed };
  } catch (e) {
    const ge = e instanceof GitHubError ? e : new GitHubError("other", (e as Error).message);
    if (ge.kind === "not_found") {
      await writeCache(key, { data: null, error: { kind: ge.kind, message: ge.message }, freshUntil: now + NEG_MS }, NEG_MS);
    }
    throw ge;
  }
}

/** Runs work after the response is sent when supported (Next.js `after`), else fire-and-forget. */
function scheduleBackground(fn: () => Promise<unknown>): void {
  const run = () => fn().catch((e) => console.error("[cache refresh]", e));
  try {
    after(run);
  } catch {
    void run();
  }
}

export async function getRepo(owner: string, name: string, opts?: { clientKey?: string }): Promise<RepoInfo> {
  const o = owner.toLowerCase();
  const key = `repo:v1:${o}/${name.toLowerCase()}`;
  const now = Date.now();
  const cached = await readCache<RepoInfo>(key);
  if (cached && cached.freshUntil > now) {
    if (cached.data) return cached.data;
    if (cached.error) throw new GitHubError(cached.error.kind as GitHubError["kind"], cached.error.message, 404);
  }
  const { token } = await resolveToken(o);
  try {
    assertColdFetchAllowed(opts?.clientKey, "repository");
    const repo = await fetchRepo(owner, name, token);
    await writeCache(key, { data: repo, freshUntil: now + FRESH_PUBLIC_MS }, STALE_MS);
    return repo;
  } catch (e) {
    const ge = e instanceof GitHubError ? e : new GitHubError("other", (e as Error).message);
    if (ge.kind === "not_found") await writeCache(key, { data: null, error: { kind: ge.kind, message: ge.message }, freshUntil: now + NEG_MS }, NEG_MS);
    if (cached?.data) return cached.data;
    throw ge;
  }
}
