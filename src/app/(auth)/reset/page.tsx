import { Suspense } from "react";
import type { Metadata } from "next";
import { ResetForm } from "@/components/auth-forms";
import { Spinner } from "@/components/ui";

export const metadata: Metadata = { title: "Reset password" };
export const dynamic = "force-dynamic";

export default async function Page() {
  return (
    <Suspense fallback={<Spinner />}>
      <ResetForm />
    </Suspense>
  );
}
