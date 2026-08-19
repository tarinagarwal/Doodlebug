import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyPanel } from "@/components/auth-forms";
import { Spinner } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Verify email",
  description:
    "Confirm your email address to finish setting up your Doodlebug account.",
  path: "/verify",
  og: "login",
  noIndex: true,
});
export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <VerifyPanel />
    </Suspense>
  );
}
