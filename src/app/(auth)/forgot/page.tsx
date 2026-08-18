import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ForgotForm } from "@/components/auth-forms";
import { getCurrentUser } from "@/lib/auth";
import { Spinner } from "@/components/ui";

export const metadata: Metadata = { title: "Forgot password" };
export const dynamic = "force-dynamic";

export default async function Page() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return (
    <Suspense fallback={<Spinner />}>
      <ForgotForm />
    </Suspense>
  );
}
