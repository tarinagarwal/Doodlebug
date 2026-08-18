import { CARD_META, ICON_NAMES } from "@/lib/cards";
import { THEMES } from "@/lib/cards/theme";
import { json } from "@/lib/http";

export const runtime = "nodejs";

export async function GET() {
  return json({
    cards: CARD_META,
    themes: Object.values(THEMES).map((t) => ({ key: t.key, label: t.label, bg: t.bg, ink: t.ink, accent: t.accent, accent2: t.accent2, dark: t.dark })),
    icons: ICON_NAMES,
  });
}
