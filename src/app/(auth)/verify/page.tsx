import { Suspense } from "react";
import type { Metadata } from "next";
import { VerifyPanel } from "@/components/auth-forms";
import { Spinner } from "@/components/ui";

export const metadata: Metadata = { title: "Verify email" };
export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <VerifyPanel />
    </Suspense>
  );
}
