import { db } from "../db";
import { CacheEntry, User } from "../models";
import { decrypt } from "../crypto";
import { fetchRepo, fetchUserBundle } from "./fetch";
import { GitHubError } from "./client";
import type { RepoInfo, UserBundle } from "./types";

const FRESH_AUTH_MS = 30 * 60 * 1000;
const FRESH_PUBLIC_MS = 60 * 60 * 1000;
const STALE_MS = 24 * 60 * 60 * 1000;
const NEG_MS = 10 * 60 * 1000;

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
  const u = await User.findOne({ githubUsername: login, githubTokenEnc: { $exists: true, $ne: null }, emailVerified: true })
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
  await db();
  const doc = await CacheEntry.findOne({ key }).lean<{ value: Wrapped<T> }>();
  return doc?.value ?? null;
}

async function writeCache<T>(key: string, value: Wrapped<T>, ttlMs: number): Promise<void> {
  await db();
  await CacheEntry.updateOne({ key }, { $set: { value, expiresAt: new Date(Date.now() + ttlMs) } }, { upsert: true });
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
export async function getBundle(login: string, opts?: { token?: string; bypassCache?: boolean }): Promise<BundleResult> {
  const resolved = opts?.token ? { token: opts.token, owner: true } : await resolveToken(login);
  const authed = Boolean(resolved.token);
  const key = `bundle:v2:${login}:${authed ? "auth" : "pub"}`;
  const now = Date.now();

  const cached = opts?.bypassCache ? null : await readCache<UserBundle>(key);
  if (cached && cached.freshUntil > now) {
    if (cached.data) return { bundle: cached.data, cached: true, authed };
    if (cached.error) throw new GitHubError(cached.error.kind as GitHubError["kind"], cached.error.message, cached.error.kind === "not_found" ? 404 : 0);
  }

  try {
    const bundle = await fetchUserBundle(login, resolved.token);
    await writeCache(key, { data: bundle, freshUntil: now + (authed ? FRESH_AUTH_MS : FRESH_PUBLIC_MS) }, STALE_MS);
    return { bundle, cached: false, authed };
  } catch (e) {
    const ge = e instanceof GitHubError ? e : new GitHubError("other", (e as Error).message);
    if (ge.kind === "not_found") {
      await writeCache(key, { data: null, error: { kind: ge.kind, message: ge.message }, freshUntil: now + NEG_MS }, NEG_MS);
      throw ge;
    }
    if (cached?.data) return { bundle: cached.data, cached: true, authed }; // stale but usable
    throw ge;
  }
}

export async function getRepo(owner: string, name: string): Promise<RepoInfo> {
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
