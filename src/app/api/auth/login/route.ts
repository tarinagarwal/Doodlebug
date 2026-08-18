import { z } from "zod";
import { db } from "@/lib/db";
import { User } from "@/lib/models";
import { createSession, toPublicUser, verifyPassword } from "@/lib/auth";
import { clientIp, err, json, parseBody, rateLimit } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = await rateLimit(`login:${clientIp(req)}`, 30, 900);
  if (!rl.allowed) return err("Too many login attempts. Take a breather and try again in 15 minutes.", 429);
  const parsed = await parseBody(req, z.object({ email: z.string().trim().email(), password: z.string().min(1).max(200) }));
  if (!parsed.ok) return parsed.res;
  await db();
  const user = await User.findOne({ email: parsed.data.email });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) return err("Wrong email or password.", 401);
  if (!user.emailVerified) return err("Please verify your email first — check your inbox (and spam).", 403, { unverified: true });
  user.lastLoginAt = new Date();
  await user.save();
  await createSession(String(user._id));
  return json({ ok: true, user: toPublicUser(user.toObject()) });
}
