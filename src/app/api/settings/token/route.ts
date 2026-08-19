import { z } from "zod";
import { db } from "@/lib/db";
import { User } from "@/lib/models";
import { getCurrentUser, toPublicUser } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { bundleCacheKeys } from "@/lib/github/service";
import { cacheDel } from "@/lib/kv";
import { validateToken } from "@/lib/github/fetch";
import { err, json, parseBody } from "@/lib/http";

export const runtime = "nodejs";

/** Save (encrypted) a GitHub personal access token after validating it. */
export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return err("Not logged in", 401);
  const parsed = await parseBody(req, z.object({ token: z.string().trim().min(20).max(300) }));
  if (!parsed.ok) return parsed.res;
  const token = parsed.data.token;
  if (!/^(gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})$/.test(token)) {
    return err("That does not look like a GitHub token (expected ghp_…, gho_… or github_pat_…).");
  }
  let login: string;
  try {
    ({ login } = await validateToken(token));
  } catch {
    return err("GitHub rejected this token. Check that it has not expired and has read access to your profile.", 400);
  }
  const tokenLogin = login.toLowerCase();
  if (me.githubUsername && me.githubUsername !== tokenLogin) {
    return err(`This token belongs to "${login}" but your profile is set to "${me.githubUsername}". Update your GitHub username first.`, 409);
  }
  await db();
  // At most one account may hold a token for a given login, otherwise `resolveToken` has to
  // pick between them. Both accounts proved ownership of the same GitHub identity, so the
  // most recently verified one wins and any older claim is released.
  await User.updateMany(
    { _id: { $ne: me._id }, githubUsername: tokenLogin, githubTokenEnc: { $exists: true, $ne: null } },
    { $unset: { githubTokenEnc: 1, githubTokenHint: 1, githubTokenValidatedAt: 1 } },
  );
  const updated = await User.findByIdAndUpdate(
    me._id,
    {
      $set: {
        githubUsername: tokenLogin,
        githubTokenEnc: encrypt(token),
        githubTokenHint: token.slice(-4),
        githubTokenValidatedAt: new Date(),
      },
    },
    { new: true },
  ).lean();
  if (!updated) return err("User not found", 404);
  await cacheDel(bundleCacheKeys(tokenLogin));
  return json({ ok: true, user: toPublicUser(updated), login });
}

/** Remove the stored token. */
export async function DELETE() {
  const me = await getCurrentUser();
  if (!me) return err("Not logged in", 401);
  await db();
  const updated = await User.findByIdAndUpdate(me._id, { $unset: { githubTokenEnc: 1, githubTokenHint: 1, githubTokenValidatedAt: 1 } }, { new: true }).lean();
  if (!updated) return err("User not found", 404);
  return json({ ok: true, user: toPublicUser(updated) });
}
