import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SavedCard } from "@/lib/models";
import { serializeCard } from "@/lib/saved";
import { MyCards } from "@/components/dashboard/my-cards";
import { Icon } from "@/components/doodles";
import { appUrl } from "@/lib/verification";

export const metadata: Metadata = { title: "My cards" };

export default async function MyCardsPage() {
  const user = (await getCurrentUser())!;
  await db();
  const cards = (await SavedCard.find({ userId: user._id }).sort({ updatedAt: -1 }).lean()).map(serializeCard);
  return (
    <div>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="title-hand text-4xl md:text-5xl">My cards</h1>
          <p className="mt-1 text-ink-soft">Everything you saved. Edit any card and its markdown updates with it.</p>
        </div>
        <Link href="/dashboard?type=stats" className="btn btn-primary">
          <Icon name="plus" size={16} /> New card
        </Link>
      </div>
      <MyCards cards={JSON.parse(JSON.stringify(cards))} origin={appUrl()} />
    </div>
  );
}
