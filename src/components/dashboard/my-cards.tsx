"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CARD_META } from "@/lib/cards/meta";
import type { SavedCardDTO } from "@/lib/saved";
import { Icon } from "../doodles";
import { Alert, Button, CopyButton, api, cx } from "../ui";

export function MyCards({ cards: initial, origin }: { cards: SavedCardDTO[]; origin: string }) {
  const router = useRouter();
  const [cards, setCards] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function remove(id: string) {
    if (!confirm("Delete this card?\n\nAny README using its /c/<id>.svg link will start showing a “card not found” image.")) return;
    setBusy(id);
    try {
      await api(`/api/cards/${id}`, { method: "DELETE" });
      setCards((c) => c.filter((x) => x.id !== id));
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  if (!cards.length) {
    return (
      <div className="mx-auto max-w-lg text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/empty.webp" alt="" width={180} height={192} className="mx-auto h-auto w-[180px] float" />
        <h2 className="title-hand mt-3 text-3xl sm:text-4xl">No saved cards yet</h2>
        <p className="mt-2 text-ink-soft">Build a card, hit “Save card”, and it shows up here so you can come back and edit it any time.</p>
        <Link href="/dashboard?type=stats" className="btn btn-primary mt-5">
          <Icon name="plus" size={16} /> Build my first card
        </Link>
      </div>
    );
  }

  return (
    <div>
      {error ? <Alert kind="error" className="mb-4">{error}</Alert> : null}
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {cards.map((c, i) => {
          const meta = CARD_META.find((m) => m.type === c.type);
          const preview = `/api/card/${c.type}${c.params ? "?" + c.params : ""}`;
          // The short URL is the one worth pasting: it points at the saved design rather than
          // at a frozen set of params, so editing this card updates every README using it.
          const url = `${origin}/c/${c.id}.svg`;
          const md = `[![${c.name}](${url})](https://github.com/)`;
          return (
            <div key={c.id} className={cx(i % 3 === 0 ? "sketch" : i % 3 === 1 ? "sketch-2" : "sketch-3", "flex flex-col p-4")}>
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon name={meta?.icon ?? "cards"} size={18} />
                    <h3 className="truncate title-hand text-2xl">{c.name}</h3>
                  </div>
                  <div className="text-sm text-muted">
                    {meta?.label ?? c.type} · updated {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "—"}
                  </div>
                </div>
                <Link href={`/dashboard?type=${c.type}&edit=${c.id}`} className="btn btn-sm btn-primary shrink-0">
                  <Icon name="edit" size={14} /> Edit
                </Link>
              </div>
              <div className="checker flex-1 rounded-lg p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt={c.name} className="mx-auto h-auto max-w-full" loading="lazy" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <CopyButton text={md} label="Copy markdown" variant="primary" />
                <CopyButton text={url} label="Copy link" />
                <a href={url} target="_blank" rel="noreferrer" className="btn btn-sm" aria-label="Open card in a new tab">
                  <Icon name="external" size={14} />
                </a>
                <Button type="button" size="sm" variant="danger" className="ml-auto" loading={busy === c.id} onClick={() => remove(c.id)} aria-label="Delete">
                  <Icon name="trash" size={14} />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted">
                Paste it once — <code className="code break-all">/c/{c.id}.svg</code> keeps working after you edit this card.
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
