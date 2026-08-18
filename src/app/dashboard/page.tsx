import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { CardBuilder } from "@/components/card-builder";
import { Onboarding } from "@/components/onboarding";
import { ReadmeKit } from "@/components/readme-kit";
import { Icon, Sparkle } from "@/components/doodles";
import { appUrl } from "@/lib/verification";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = (await getCurrentUser())!;
  const sp = await searchParams;
  const origin = appUrl();

  if (!user.githubUsername) {
    return <Onboarding name={user.name} />;
  }

  return (
    <div>
      {sp.welcome ? (
        <div className="sketch-flat mb-6 bg-[#e6f4e9] px-4 py-3">
          Welcome aboard, {user.name.split(" ")[0]}! Your email is verified. <Sparkle className="inline" size={18} />
        </div>
      ) : null}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="title-hand text-5xl">Card builder</h1>
          <p className="mt-1 text-ink-soft">
            Drawing for <b>@{user.githubUsername}</b>
            {user.githubTokenEnc ? (
              <span className="ml-2 sketch-flat bg-[#cfe9e5] px-2 py-0.5 text-sm">token saved ✓</span>
            ) : (
              <span className="ml-2 sketch-flat bg-[#fde9b6] px-2 py-0.5 text-sm">
                public mode ·{" "}
                <Link href="/dashboard/settings" className="underline-squiggle">
                  add a token
                </Link>
              </span>
            )}
          </p>
        </div>
        <Link href="/dashboard/settings" className="btn btn-sm">
          <Icon name="settings" size={16} /> Settings
        </Link>
      </div>
      <CardBuilder username={user.githubUsername} defaultTheme={user.defaultTheme ?? "paper"} origin={origin} hasToken={Boolean(user.githubTokenEnc)} />
      <ReadmeKit username={user.githubUsername} theme={user.defaultTheme ?? "paper"} origin={origin} name={user.name} />
    </div>
  );
}
