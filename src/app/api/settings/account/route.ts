import { z } from "zod";
import { db } from "@/lib/db";
import { OneTimeToken, SavedCard, User } from "@/lib/models";
import { destroySession, getCurrentUser, verifyPassword } from "@/lib/auth";
import { err, json, parseBody } from "@/lib/http";

export const runtime = "nodejs";

/** Permanently delete the account (requires password). */
export async function DELETE(req: Request) {
  const me = await getCurrentUser();
  if (!me) return err("Not logged in", 401);
  const parsed = await parseBody(req, z.object({ password: z.string().min(1).max(200) }));
  if (!parsed.ok) return parsed.res;
  await db();
  const user = await User.findById(me._id);
  if (!user) return err("User not found", 404);
  if (!(await verifyPassword(parsed.data.password, user.passwordHash))) return err("Password is wrong.", 400);
  // Remove every document that belongs to this user before dropping the account itself,
  // otherwise saved cards stay behind keyed to an ObjectId that no longer resolves.
  await Promise.all([OneTimeToken.deleteMany({ userId: user._id }), SavedCard.deleteMany({ userId: user._id })]);
  await User.deleteOne({ _id: user._id });
  await destroySession();
  return json({ ok: true });
}
