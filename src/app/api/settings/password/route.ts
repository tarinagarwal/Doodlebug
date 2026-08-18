import { z } from "zod";
import { db } from "@/lib/db";
import { User } from "@/lib/models";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { err, json, parseBody } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return err("Not logged in", 401);
  const parsed = await parseBody(req, z.object({ current: z.string().min(1).max(200), next: z.string().min(8, "New password needs at least 8 characters").max(200) }));
  if (!parsed.ok) return parsed.res;
  await db();
  const user = await User.findById(me._id);
  if (!user) return err("User not found", 404);
  if (!(await verifyPassword(parsed.data.current, user.passwordHash))) return err("Current password is wrong.", 400);
  user.passwordHash = await hashPassword(parsed.data.next);
  await user.save();
  return json({ ok: true });
}
