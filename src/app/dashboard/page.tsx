import type { Metadata } from "next";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { Builder } from "@/components/dashboard/builder";
import { Onboarding } from "@/components/onboarding";
import { Spinner } from "@/components/ui";
import { appUrl } from "@/lib/verification";

export const metadata: Metadata = { title: "Card builder" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const user = (await getCurrentUser())!;
  const sp = await searchParams;
  if (!user.githubUsername) return <Onboarding name={user.name} />;
  return (
    <div>
      {sp.welcome ? <div className="sketch-flat mb-4 bg-[#e6f4e9] px-4 py-3">Welcome aboard, {user.name.split(" ")[0]}! Pick a card on the left, tweak it, copy the markdown. That&apos;s it.</div> : null}
      <Suspense fallback={<Spinner />}>
        <Builder username={user.githubUsername} defaultTheme={user.defaultTheme ?? "paper"} origin={appUrl()} hasToken={Boolean(user.githubTokenEnc)} />
      </Suspense>
    </div>
  );
}
