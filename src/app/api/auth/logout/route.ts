import { destroySession } from "@/lib/auth";
import { json } from "@/lib/http";

export const runtime = "nodejs";

export async function POST() {
  await destroySession();
  return json({ ok: true });
}
