import type { Metadata } from "next";
import { Caveat, Kalam, Patrick_Hand } from "next/font/google";
import "./globals.css";
import { Footer, Nav } from "@/components/nav";

const patrick = Patrick_Hand({ subsets: ["latin"], weight: "400", variable: "--font-patrick", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-caveat", display: "swap" });
const kalam = Kalam({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-kalam", display: "swap" });

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: "Doodlebug — hand-drawn GitHub stats cards", template: "%s · Doodlebug" },
  description: "Generate hand-drawn GitHub stats, streak, language, trophy and banner cards for your README. Free, themeable, and doodly.",
  openGraph: {
    title: "Doodlebug — hand-drawn GitHub stats cards",
    description: "Sketchy, wobbly, lovable GitHub README cards. Enter your username and go.",
    url: APP_URL,
    siteName: "Doodlebug",
    images: [{ url: "/api/card/banner?name=Doodlebug&text=Hand-drawn%20GitHub%20stats%20cards%20for%20your%20README&theme=paper", width: 900, height: 230 }],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${patrick.variable} ${caveat.variable} ${kalam.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
