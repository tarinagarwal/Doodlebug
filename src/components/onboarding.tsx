"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert, Button, Field, Input, api } from "./ui";
import { Icon } from "./doodles";

/** First-run: connect a GitHub username (and optional token). */
export function Onboarding({ name }: { name: string }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (token.trim()) {
        await api("/api/settings/token", { method: "POST", json: { token: token.trim() } });
        if (username.trim()) await api("/api/settings/github", { method: "POST", json: { githubUsername: username.trim() } }).catch(() => {});
      } else {
        await api("/api/settings/github", { method: "POST", json: { githubUsername: username.trim() } });
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="sketch-2 tape relative p-6 md:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/empty.webp" alt="" width={140} height={150} className="float absolute -right-6 -top-10 hidden h-auto w-[140px] md:block" />
        <h1 className="title-hand text-4xl">Hi {name.split(" ")[0]}! Let&apos;s connect GitHub.</h1>
        <p className="mt-2 text-ink-soft">Tell Doodlebug which GitHub account to draw. A token is optional — public data works fine.</p>
        {error ? <Alert kind="error" className="mt-4">{error}</Alert> : null}
        <form onSubmit={submit} className="mt-5">
          <Field label="GitHub username" htmlFor="gh">
            <Input id="gh" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="octocat" required={!token} spellCheck={false} />
          </Field>
          <Field
            label="Personal access token (optional)"
            htmlFor="tok"
            hint={
              <>
                Stored encrypted (AES-256-GCM), used only to fetch your stats. Unlocks private-contribution counts and removes public rate limits.{" "}
                <a className="underline-squiggle" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
                  Create one <Icon name="external" size={12} className="inline" />
                </a>{" "}
                — no extra permissions needed for public data.
              </>
            }
          >
            <Input id="tok" type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_… or ghp_…" autoComplete="off" spellCheck={false} />
          </Field>
          <Button type="submit" variant="primary" loading={busy}>
            Save and start doodling
          </Button>
        </form>
      </div>
    </div>
  );
}
