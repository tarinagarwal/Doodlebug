import { z } from "zod";
import { db } from "@/lib/db";
import { User } from "@/lib/models";
import { hashPassword } from "@/lib/auth";
import { issueVerification } from "@/lib/verification";
import { clientIp, err, json, parseBody, rateLimit } from "@/lib/http";

export const runtime = "nodejs";

const Schema = z.object({
  name: z.string().trim().min(1, "Tell us your name").max(60),
  email: z.string().trim().email("That email looks off").max(120),
  password: z.string().min(8, "Password needs at least 8 characters").max(200),
});

export async function POST(req: Request) {
  const rl = await rateLimit(`signup:${clientIp(req)}`, 10, 3600);
  if (!rl.allowed) return err("Too many sign-ups from this network. Try again later.", 429);
  const parsed = await parseBody(req, Schema);
  if (!parsed.ok) return parsed.res;
  const { name, email, password } = parsed.data;
  await db();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.emailVerified) return err("An account with this email already exists. Try logging in.", 409);
    existing.name = name;
    existing.passwordHash = await hashPassword(password);
    await existing.save();
    try {
      await issueVerification(String(existing._id), email, name);
    } catch (e) {
      console.error("[signup] mail failed", e);
      return err("Could not send the verification email. Please try again in a minute.", 502);
    }
    return json({ ok: true, resent: true });
  }
  const user = await User.create({ name, email, passwordHash: await hashPassword(password), emailVerified: false });
  try {
    await issueVerification(String(user._id), email, name);
  } catch (e) {
    console.error("[signup] mail failed", e);
    return err("Account created but the verification email could not be sent. Use resend in a minute.", 502);
  }
  return json({ ok: true });
}
