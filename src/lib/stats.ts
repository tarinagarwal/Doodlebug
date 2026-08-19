import { after } from "next/server";
import { db } from "./db";
import { RenderStat } from "./models";

/**
 * Buffered, anonymous render counters.
 *
 * `recordRender` costs a Map lookup and nothing else — no await, no database. Counts are
 * folded into per-day totals and flushed in one bulk write after the response has already
 * been sent, so the card hot path never waits on Mongo to log anything.
 *
 * Buffered counts live in instance memory, so a serverless instance that is frozen and
 * discarded loses whatever it was holding. That is an acceptable trade for usage numbers.
 */

const RETAIN_DAYS = 30;
const FLUSH_EVERY_MS = 15_000;
const FLUSH_AT_KEYS = 50;
/** If the buffer somehow grows past this we drop it rather than hold memory hostage. */
const MAX_KEYS = 5_000;

const buffer = new Map<string, number>();
let lastFlush = Date.now();
let inFlight: Promise<void> | null = null;

function utcDay(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Records one render. Cheap and synchronous; schedules a flush when one is due. */
export function recordRender(type: string, theme: string): void {
  const key = `${utcDay()}|${type}|${theme}`;
  buffer.set(key, (buffer.get(key) ?? 0) + 1);

  if (buffer.size < FLUSH_AT_KEYS && Date.now() - lastFlush < FLUSH_EVERY_MS) return;
  const run = () => {
    void flushRenderStats();
  };
  try {
    // Runs once the response is on the wire.
    after(run);
  } catch {
    run();
  }
}

/** Writes buffered counts as one bulk upsert. Safe to call concurrently. */
export async function flushRenderStats(): Promise<void> {
  if (inFlight) return inFlight;
  if (buffer.size === 0) return;

  // Take the buffer so renders arriving during the write are counted for the next flush.
  const batch = [...buffer.entries()];
  buffer.clear();
  lastFlush = Date.now();

  inFlight = (async () => {
    const expiresAt = new Date(Date.now() + RETAIN_DAYS * 24 * 3600 * 1000);
    try {
      await db();
      await RenderStat.bulkWrite(
        batch.map(([key, count]) => {
          const [day, type, theme] = key.split("|");
          return {
            updateOne: {
              filter: { day, type, theme },
              update: { $inc: { count }, $setOnInsert: { expiresAt } },
              upsert: true,
            },
          };
        }),
        { ordered: false },
      );
    } catch (e) {
      console.error("[stats] flush failed", e);
      // A duplicate-key error means concurrent upserts raced on the unique index and the
      // write almost certainly landed, so re-buffering would double-count. Anything else
      // (connection trouble) is worth retrying — unless we are already holding too much,
      // because losing analytics beats leaking memory.
      const raced = (e as { code?: number })?.code === 11000;
      if (!raced && buffer.size + batch.length <= MAX_KEYS) {
        for (const [key, count] of batch) buffer.set(key, (buffer.get(key) ?? 0) + count);
      }
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

/** Test helper — drops all buffered state. */
export function resetRenderStats(): void {
  buffer.clear();
  lastFlush = Date.now();
  inFlight = null;
}
