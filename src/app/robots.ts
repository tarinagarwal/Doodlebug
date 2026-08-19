import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/verification";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Session-only surfaces, plus the card endpoints, which are images rather than pages.
        disallow: ["/dashboard", "/dashboard/", "/api/", "/c/", "/reset", "/verify"],
      },
    ],
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
