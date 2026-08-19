import { bumpTokenVersion, createSession, getCurrentUser } from "@/lib/auth";
import { err, json } from "@/lib/http";

export const runtime = "nodejs";

/** Invalidates every session for the account, then re-issues one for the current device. */
export async function POST() {
  const me = await getCurrentUser();
  if (!me) return err("Not logged in", 401);
  const version = await bumpTokenVersion(String(me._id));
  await createSession(String(me._id), version);
  return json({ ok: true });
}
