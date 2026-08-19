import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetForm } from "@/components/auth-forms";
import { Spinner } from "@/components/ui";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Reset password",
  description:
    "Choose a new password for your Doodlebug account. Resetting also signs out every other device.",
  path: "/reset",
  og: "login",
  noIndex: true,
});
export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <ResetForm />
    </Suspense>
  );
}
