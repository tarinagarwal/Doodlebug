import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { SavedCard } from "@/lib/models";
import { DashboardShell } from "@/components/dashboard/shell";
import { Spinner } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");
  await db();
  const savedCount = await SavedCard.countDocuments({ userId: user._id });
  return (
    <Suspense fallback={<Spinner />}>
      <DashboardShell savedCount={savedCount} githubUsername={user.githubUsername ?? ""} hasToken={Boolean(user.githubTokenEnc)}>
        {children}
      </DashboardShell>
    </Suspense>
  );
}
