import { z } from "zod";
import mongoose from "mongoose";
import { db } from "@/lib/db";
import { SavedCard } from "@/lib/models";
import { getCurrentUser } from "@/lib/auth";
import { isCardType } from "@/lib/cards/meta";
import { err, json, parseBody } from "@/lib/http";
import { serializeCard } from "@/lib/saved";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  type: z.string().refine(isCardType, "Unknown card type").optional(),
  params: z.string().max(4000).optional(),
});

async function load(id: string, userId: mongoose.Types.ObjectId) {
  if (!mongoose.isValidObjectId(id)) return null;
  await db();
  return SavedCard.findOne({ _id: id, userId });
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) return err("Not logged in", 401);
  const { id } = await ctx.params;
  const card = await load(id, me._id);
  if (!card) return err("Card not found", 404);
  return json({ card: serializeCard(card.toObject()) });
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) return err("Not logged in", 401);
  const { id } = await ctx.params;
  const parsed = await parseBody(req, Schema);
  if (!parsed.ok) return parsed.res;
  const card = await load(id, me._id);
  if (!card) return err("Card not found", 404);
  if (parsed.data.name !== undefined) card.name = parsed.data.name;
  if (parsed.data.type !== undefined) card.type = parsed.data.type;
  if (parsed.data.params !== undefined) card.params = parsed.data.params;
  await card.save();
  return json({ ok: true, card: serializeCard(card.toObject()) });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await getCurrentUser();
  if (!me) return err("Not logged in", 401);
  const { id } = await ctx.params;
  const card = await load(id, me._id);
  if (!card) return err("Card not found", 404);
  await card.deleteOne();
  return json({ ok: true });
}
