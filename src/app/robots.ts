import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/verification";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Session-only surfaces and non-page endpoints. /api/card is deliberately NOT
        // blocked: the cards are the product, and blocking them forfeits Google Images and
        // stops Googlebot seeing the main visual content when it renders a page.
        disallow: ["/dashboard", "/dashboard/", "/api/auth/", "/api/cards", "/api/settings/", "/api/meta", "/api/og", "/c/", "/reset", "/verify", "/forgot"],
      },
    ],
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
