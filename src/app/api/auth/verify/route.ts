import { z } from "zod";
import { db } from "@/lib/db";
import { OneTimeToken, User } from "@/lib/models";
import { createSession, toPublicUser } from "@/lib/auth";
import { sha256 } from "@/lib/crypto";
import { err, json, parseBody } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = await parseBody(req, z.object({ token: z.string().min(10).max(200) }));
  if (!parsed.ok) return parsed.res;
  await db();
  const t = await OneTimeToken.findOne({ tokenHash: sha256(parsed.data.token), kind: "verify" });
  if (!t || t.expiresAt.getTime() < Date.now()) return err("This verification link is invalid or has expired.", 400);
  const user = await User.findById(t.userId);
  if (!user) return err("Account no longer exists.", 404);
  user.emailVerified = true;
  user.lastLoginAt = new Date();
  await user.save();
  await OneTimeToken.deleteMany({ userId: user._id, kind: "verify" });
  await createSession(String(user._id), user.tokenVersion ?? 0);
  return json({ ok: true, user: toPublicUser(user.toObject()) });
}
