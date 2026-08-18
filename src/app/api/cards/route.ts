import { z } from "zod";
import { db } from "@/lib/db";
import { SavedCard } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth";
import { isCardType } from "@/lib/cards/meta";
import { err, json, parseBody } from "@/lib/http";
import { serializeCard } from "@/lib/saved";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  name: z.string().trim().min(1, "Give the card a name").max(60),
  type: z.string().refine(isCardType, "Unknown card type"),
  params: z.string().max(4000),
});


/** List my saved cards */
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return err("Not logged in", 401);
  await db();
  const cards = await SavedCard.find({ userId: me._id }).sort({ updatedAt: -1 }).lean();
  return json({ cards: cards.map(serializeCard) });
}

/** Save a new card */
export async function POST(req: Request) {
  const me = await getCurrentUser();
  if (!me) return err("Not logged in", 401);
  const parsed = await parseBody(req, Schema);
  if (!parsed.ok) return parsed.res;
  await db();
  const count = await SavedCard.countDocuments({ userId: me._id });
  if (count >= 100) return err("You have 100 saved cards already — delete a few first.", 400);
  const card = await SavedCard.create({ userId: me._id, ...parsed.data });
  return json({ ok: true, card: serializeCard(card.toObject()) });
}
