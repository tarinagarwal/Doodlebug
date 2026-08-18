import { z } from "zod";
import { db } from "@/lib/db";
import { OneTimeToken, User } from "@/lib/models";
import { randomToken, sha256 } from "@/lib/crypto";
import { sendPasswordResetEmail } from "@/lib/mail";
import { appUrl } from "@/lib/verification";
import { clientIp, err, json, parseBody, rateLimit } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = await rateLimit(`forgot:${clientIp(req)}`, 5, 900);
  if (!rl.allowed) return err("Please wait before requesting another reset email.", 429);
  const parsed = await parseBody(req, z.object({ email: z.string().trim().email() }));
  if (!parsed.ok) return parsed.res;
  await db();
  const user = await User.findOne({ email: parsed.data.email, emailVerified: true });
  if (user) {
    const raw = randomToken();
    await OneTimeToken.deleteMany({ userId: user._id, kind: "reset" });
    await OneTimeToken.create({ userId: user._id, kind: "reset", tokenHash: sha256(raw), expiresAt: new Date(Date.now() + 3600 * 1000) });
    try {
      await sendPasswordResetEmail(user.email, user.name, `${appUrl()}/reset?token=${raw}`);
    } catch (e) {
      console.error("[forgot] mail failed", e);
      return err("Could not send the email right now.", 502);
    }
  }
  return json({ ok: true });
}
