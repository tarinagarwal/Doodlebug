import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";
import { Spinner } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Log in",
  description:
    "Log in to your Doodlebug account to build, save and edit your hand-drawn GitHub README cards.",
  path: "/login",
  ogTitle: "Welcome back",
  ogSubtitle: "Log in to build and edit your cards.",
  art: "cards",
});
export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return (
    <Suspense fallback={<Spinner />}>
      <LoginForm />
    </Suspense>
  );
}
