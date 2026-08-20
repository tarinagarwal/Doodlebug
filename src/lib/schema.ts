import OG_PAGES from "./og-pages.json";

/**
 * JSON-LD builders.
 *
 * Everything here describes what is genuinely on the page. Schema that claims more than the
 * visible content is a manual-action risk, so the FAQ entries below are the single source the
 * homepage renders from — the markup cannot drift away from the copy.
 */

const APP_URL = (process.env.APP_URL || "https://doodlebug.tarinagarwal.in").replace(/\/$/, "");
const REPO = "https://github.com/tarinagarwal/Doodlebug";
const DEVSBAZAAR = "https://devsbazaar.com";

export interface Faq {
  q: string;
  a: string;
}

/** Rendered on the homepage AND emitted as FAQPage schema. Keep them one list. */
export const FAQS: Faq[] = [
  {
    q: "Do I need a GitHub token?",
    a: "No. Public data works for everyone. Without a token, Doodlebug uses GitHub's public API and the public contribution graph, which has shared rate limits — heavy traffic can occasionally show a 'rate limited' card. Adding a token in Settings fixes that permanently and adds private-contribution counts.",
  },
  {
    q: "Why do I have to log in to use the site?",
    a: "Your account stores your GitHub username, your (encrypted) token and your preferences, and lets Doodlebug prefer your token whenever anyone loads a card for your username. Card image URLs themselves are public so they render in READMEs.",
  },
  {
    q: "Which token scopes do I need?",
    a: "None. A classic token with every scope box left unchecked already lifts the rate limit and reads public data — that is all most cards need. Only add read:user (and repo, if you want private repositories counted) when you want private-contribution numbers.",
  },
  {
    q: "How fresh is the data?",
    a: "Cards refresh every 30 minutes (60 for public fetching) and are served with cache headers GitHub respects. Change a param — like &seed=2 — to force a new image.",
  },
  {
    q: "Can I customise colours?",
    a: "Yes: pick a theme, then override any of bg, ink, accent, accent2 or muted with a hex value, e.g. &accent=ff5da2.",
  },
  {
    q: "Can one card work in both light and dark mode?",
    a: "Yes — use theme=auto. The card is drawn in the paper palette and recolours itself to midnight when the reader prefers dark, from a single URL. One caveat: an SVG loaded through an img tag follows the reader's browser or OS setting rather than GitHub's own light/dark toggle, so it matches most people but not everyone.",
  },
  {
    q: "Can I change a card after pasting it into my README?",
    a: "Yes. Save a card and it also gets a short link like /c/<id>.svg. Paste that once, then restyle the card in the dashboard whenever you like — every README using the link updates on its own, and you never edit the markdown again.",
  },
  {
    q: "Is Doodlebug really free?",
    a: "Yes, and it is open source under the MIT licence — a DevsBazaar product, open sourced. There is no paid tier, no seat limit and no feature held back. If you would rather not depend on the hosted version, clone the repository and run the whole thing yourself.",
  },
  {
    q: "Is it really hand-drawn?",
    a: "Every stroke is generated with rough.js and a per-user seed, so your card is unique. Fonts are real handwriting fonts embedded into the SVG.",
  },
];

const publisher = {
  "@type": "Organization",
  name: "DevsBazaar",
  url: DEVSBAZAAR,
};

/** The product itself. Free developer tool, so price 0 with a real Offer. */
export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Doodlebug",
    url: APP_URL,
    applicationCategory: "DeveloperApplication",
    applicationSubCategory: "GitHub README tools",
    operatingSystem: "Any",
    description:
      "Generate hand-drawn SVG cards from your GitHub activity — stats, streaks, top languages, trophies, contribution heatmaps, repo pins and banners — for your README.",
    image: `${APP_URL}${ogImage("home")}`,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    license: "https://opensource.org/licenses/MIT",
    isAccessibleForFree: true,
    codeRepository: REPO,
    author: { "@type": "Person", name: "Tarin Agarwal", url: "https://tarinagarwal.in" },
    publisher,
  };
}

export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Breadcrumbs still render in Google results, unlike FAQ rich results for most sites. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${APP_URL}${t.path === "/" ? "" : t.path}`,
    })),
  };
}

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Doodlebug",
    url: APP_URL,
    description: "Hand-drawn GitHub stats cards for your README.",
    publisher,
    inLanguage: "en",
  };
}

function ogImage(key: keyof typeof OG_PAGES): string {
  return `/og/pages/${key}.png`;
}
