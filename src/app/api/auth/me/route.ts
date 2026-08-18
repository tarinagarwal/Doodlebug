import { getCurrentUser, toPublicUser } from "@/lib/auth";
import { json } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  return json({ user: user ? toPublicUser(user) : null });
}
