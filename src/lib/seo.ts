import type { Metadata } from "next";
import OG_PAGES from "./og-pages.json";

/**
 * Page metadata helper.
 *
 * Preview images are **static PNG files**, not the dynamic /api/og endpoint. Two reasons:
 * the image has to be raster, because WhatsApp, X, Discord, iMessage, LinkedIn and Slack all
 * refuse to render an SVG preview; and it has to be fast, because a cold render of /api/og
 * took about four seconds and WhatsApp's crawler gives up long before that, which is why the
 * preview arrived with a title and no picture. A file on the CDN answers in milliseconds.
 *
 * Regenerate the files with `pnpm gen:og` after editing og-pages.json.
 */

export type OgKey = keyof typeof OG_PAGES;

export interface PageSeo {
  title: string;
  description: string;
  /** path relative to the site root, e.g. "/docs" */
  path: string;
  /** which pre-rendered preview image to use; see og-pages.json */
  og?: OgKey;
  /** set for pages that should not appear in search results */
  noIndex?: boolean;
}

export function ogImagePath(key: OgKey = "app"): string {
  return `/og/pages/${key}.png`;
}

export function pageMetadata(seo: PageSeo): Metadata {
  const key: OgKey = seo.og ?? "app";
  const image = ogImagePath(key);
  const alt = OG_PAGES[key].title;

  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: seo.path },
    robots: seo.noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      title: seo.title,
      description: seo.description,
      url: seo.path,
      siteName: "Doodlebug",
      images: [{ url: image, width: 1200, height: 630, alt, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [image],
    },
  };
}
