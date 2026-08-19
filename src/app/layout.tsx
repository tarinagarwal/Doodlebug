import type { Metadata } from "next";
import { Caveat, Kalam, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { Footer, Nav } from "@/components/nav";
import { StarBar } from "@/components/star-bar";
import { ogImageUrl } from "@/lib/seo";

const patrick = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-patrick", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-caveat", display: "swap" });
const kalam = Kalam({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-kalam", display: "swap" });

const APP_URL = process.env.APP_URL || "http://localhost:3000";

const OG = ogImageUrl("Hand-drawn GitHub stats", "Sketchy, wobbly, lovable cards for your README.", "hero");

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: "Doodlebug — hand-drawn GitHub stats cards", template: "%s · Doodlebug" },
  description: "Turn your GitHub activity into hand-drawn SVG cards for your README — stats, streaks, languages, trophies, heatmaps and banners. Free, themeable and open source.",
  applicationName: "Doodlebug",
  keywords: ["github readme", "github stats card", "readme cards", "github profile readme", "hand drawn", "svg", "github streak", "top languages"],
  authors: [{ name: "Tarin Agarwal", url: "https://tarinagarwal.in" }],
  creator: "Tarin Agarwal",
  openGraph: {
    type: "website",
    title: "Doodlebug — hand-drawn GitHub stats cards",
    description: "Sketchy, wobbly, lovable GitHub README cards. Enter your username and go.",
    url: APP_URL,
    siteName: "Doodlebug",
    images: [{ url: OG, width: 1200, height: 630, alt: "Doodlebug — hand-drawn GitHub stats cards" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Doodlebug — hand-drawn GitHub stats cards",
    description: "Sketchy, wobbly, lovable GitHub README cards. Enter your username and go.",
    images: [OG],
  },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${patrick.variable} ${caveat.variable} ${kalam.variable}`}>
      <body className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-40">
          <StarBar />
          <Nav />
        </div>
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
