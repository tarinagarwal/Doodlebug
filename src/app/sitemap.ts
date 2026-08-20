import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/verification";

/**
 * `lastModified` is a per-page constant, deliberately not `new Date()`.
 *
 * Building the date at deploy time stamps every URL with a fresh timestamp on every deploy,
 * including pages whose content did not change. Google treats a lastmod that always moves as
 * noise and stops trusting it, which costs you the one signal the sitemap actually provides.
 * Bump the entry for a page when that page's content genuinely changes.
 */
const PAGES: { path: string; lastModified: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
  { path: "/", lastModified: "2026-08-20", changeFrequency: "weekly", priority: 1 },
  { path: "/docs", lastModified: "2026-08-20", changeFrequency: "weekly", priority: 0.9 },
  { path: "/themes", lastModified: "2026-08-19", changeFrequency: "monthly", priority: 0.8 },
  { path: "/signup", lastModified: "2026-08-19", changeFrequency: "monthly", priority: 0.6 },
  { path: "/login", lastModified: "2026-08-19", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy", lastModified: "2026-08-18", changeFrequency: "yearly", priority: 0.2 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = appUrl();
  return PAGES.map((p) => ({
    // Next normalises the homepage canonical to a bare origin with no trailing slash, so the
    // <loc> is written the same way rather than forcing trailingSlash site-wide.
    url: p.path === "/" ? base : `${base}${p.path}`,
    lastModified: new Date(`${p.lastModified}T00:00:00Z`),
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
