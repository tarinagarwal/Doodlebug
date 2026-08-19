import { z } from "zod";
import { db } from "@/lib/db";
import { User } from "@/lib/models";
import { getCurrentUser, toPublicUser } from "@/lib/auth";
import { ghRest, GitHubError } from "@/lib/github/client";
import { bundleCacheKeys, normalizeLogin } from "@/lib/github/service";
import { cacheDel } from "@/lib/kv";
import { err, json, parseBody } from "@/lib/http";
import { THEMES } from "@/lib/cards/theme";

export const runtime = "nodejs";

const Schema = z.object({
  githubUsername: z.string().trim().min(1).max(60).optional(),
  defaultTheme: z.string().trim().max(30).optional(),
  name: z.string().trim().min(1).max(60).optional(),
});

/** Update profile-ish settings: GitHub username, default theme, display name. */
export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return err("Not logged in", 401);
  const parsed = await parseBody(req, Schema);
  if (!parsed.ok) return parsed.res;
  const { githubUsername, defaultTheme, name } = parsed.data;
  await db();
  const update: Record<string, unknown> = {};

  if (githubUsername !== undefined) {
    const login = normalizeLogin(githubUsername);
    if (!login) return err("That does not look like a valid GitHub username.");
    try {
      const u = await ghRest<{ login: string }>(`/users/${encodeURIComponent(login)}`, process.env.GITHUB_TOKEN || undefined);
      update.githubUsername = u.login.toLowerCase();
    } catch (e) {
      if (e instanceof GitHubError && e.kind === "not_found") return err(`GitHub has no user called "${login}".`, 404);
      if (e instanceof GitHubError && e.kind === "rate_limited") {
        // can't verify right now — accept the syntactically valid login
        update.githubUsername = login;
      } else {
        return err("Could not reach GitHub to verify that username. Try again shortly.", 502);
      }
    }
    // if a token is stored for a different account, drop it
    if (me.githubTokenEnc && me.githubUsername && me.githubUsername !== update.githubUsername) {
      update.githubTokenEnc = null;
      update.githubTokenHint = null;
      update.githubTokenValidatedAt = null;
    }
  }
  if (defaultTheme !== undefined) {
    if (!THEMES[defaultTheme]) return err("Unknown theme");
    update.defaultTheme = defaultTheme;
  }
  if (name !== undefined) update.name = name;

  const updated = await User.findByIdAndUpdate(me._id, { $set: update }, { new: true }).lean();
  if (!updated) return err("User not found", 404);
  if (update.githubUsername) await cacheDel(bundleCacheKeys(String(update.githubUsername)));
  return json({ ok: true, user: toPublicUser(updated) });
}
