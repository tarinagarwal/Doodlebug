import { z } from "zod";
import { db } from "@/lib/db";
import { User } from "@/lib/models";
import { issueVerification } from "@/lib/verification";
import { clientIp, err, json, parseBody, rateLimitSafe } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = await rateLimitSafe(`resend:${clientIp(req)}`, 5, 900);
  if (!rl.allowed) return err("Please wait a bit before requesting another email.", 429);
  const parsed = await parseBody(req, z.object({ email: z.string().trim().email() }));
  if (!parsed.ok) return parsed.res;
  await db();
  const user = await User.findOne({ email: parsed.data.email });
  // Always respond OK to avoid leaking which emails exist
  if (user && !user.emailVerified) {
    try {
      await issueVerification(String(user._id), user.email, user.name);
    } catch (e) {
      console.error("[resend] mail failed", e);
      return err("Could not send the email right now.", 502);
    }
  }
  return json({ ok: true });
}
