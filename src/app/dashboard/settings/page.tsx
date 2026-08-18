import Link from "next/link";
import type { Metadata } from "next";
import { getCurrentUser, toPublicUser } from "@/lib/auth";
import { DangerZone, GithubForm, PasswordForm, TokenForm } from "@/components/settings-forms";
import { Icon } from "@/components/doodles";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = toPublicUser((await getCurrentUser())!);
  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="title-hand text-5xl">Settings</h1>
        <Link href="/dashboard" className="btn btn-sm">
          <Icon name="cards" size={16} /> Builder
        </Link>
      </div>
      <div className="space-y-6">
        <section className="sketch p-6">
          <GithubForm user={user} />
        </section>
        <section className="sketch-2 p-6">
          <TokenForm user={user} />
        </section>
        <section className="sketch-3 p-6">
          <PasswordForm />
        </section>
        <section className="sketch-flat border-danger p-6" style={{ borderColor: "#d1495b" }}>
          <DangerZone />
        </section>
      </div>
    </div>
  );
}
