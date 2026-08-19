import type { Metadata } from "next";

/**
 * Page metadata helper.
 *
 * Every page gets a title, a description and a raster Open Graph image. The image has to be
 * PNG rather than one of our own SVG cards: WhatsApp, X, Discord, iMessage, LinkedIn and
 * Slack all refuse to render an SVG preview, so an SVG here means no preview at all.
 */

export type OgArt = "hero" | "cards" | "palette";

export interface PageSeo {
  title: string;
  description: string;
  /** path relative to the site root, e.g. "/docs" */
  path: string;
  /** headline drawn into the preview image; defaults to `title` */
  ogTitle?: string;
  /** sub-line drawn into the preview image; defaults to `description` */
  ogSubtitle?: string;
  art?: OgArt;
  /** set for pages that should not appear in search results */
  noIndex?: boolean;
}

export function ogImageUrl(title: string, subtitle: string, art: OgArt = "hero"): string {
  const p = new URLSearchParams({ title, subtitle, art });
  return `/api/og?${p.toString()}`;
}

export function pageMetadata(seo: PageSeo): Metadata {
  const ogTitle = seo.ogTitle ?? seo.title;
  // Preview images are read at a glance, so keep the sub-line shorter than the meta one.
  const ogSubtitle = seo.ogSubtitle ?? seo.description;
  const image = ogImageUrl(ogTitle, ogSubtitle, seo.art ?? "hero");

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
      images: [{ url: image, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [image],
    },
  };
}
