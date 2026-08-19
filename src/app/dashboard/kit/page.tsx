import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { ReadmeKit } from "@/components/readme-kit";
import { appUrl } from "@/lib/verification";

export const metadata: Metadata = { title: "README starter kit" };

export default async function KitPage() {
  const user = (await getCurrentUser())!;
  return (
    <div>
      <h1 className="title-hand text-3xl sm:text-4xl md:text-5xl">README starter kit</h1>
      <p className="mt-1 mb-5 text-ink-soft">A complete profile block in one copy — banner, stats, streak, languages, graph, trophies and heatmap. Pick a theme, copy, paste.</p>
      <ReadmeKit username={user.githubUsername ?? ""} theme={user.defaultTheme ?? "paper"} origin={appUrl()} name={user.name} />
    </div>
  );
}
