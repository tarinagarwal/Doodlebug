import { z } from "zod";
import { db } from "@/lib/db";
import { OneTimeToken, User } from "@/lib/models";
import { createSession, hashPassword } from "@/lib/auth";
import { sha256 } from "@/lib/crypto";
import { err, json, parseBody } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const parsed = await parseBody(
    req,
    z.object({ token: z.string().min(10).max(200), password: z.string().min(8, "Password needs at least 8 characters").max(200) }),
  );
  if (!parsed.ok) return parsed.res;
  await db();
  const t = await OneTimeToken.findOne({ tokenHash: sha256(parsed.data.token), kind: "reset" });
  if (!t || t.expiresAt.getTime() < Date.now()) return err("This reset link is invalid or has expired.", 400);
  const user = await User.findById(t.userId);
  if (!user) return err("Account no longer exists.", 404);
  user.passwordHash = await hashPassword(parsed.data.password);
  user.emailVerified = true;
  await user.save();
  await OneTimeToken.deleteMany({ userId: user._id });
  await createSession(String(user._id));
  return json({ ok: true });
}
