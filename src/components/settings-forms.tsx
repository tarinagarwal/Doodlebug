"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { PublicUser } from "@/lib/auth";
import { THEMES } from "@/lib/cards/theme";
import { Alert, Button, Field, Input, Select, api } from "./ui";
import { Icon } from "./doodles";

function useAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  async function run(fn: () => Promise<string>) {
    setBusy(true);
    setMsg(null);
    try {
      const text = await fn();
      setMsg({ kind: "success", text });
      router.refresh();
    } catch (e) {
      setMsg({ kind: "error", text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }
  return { busy, msg, run };
}

export function GithubForm({ user }: { user: PublicUser }) {
  const [username, setUsername] = useState(user.githubUsername ?? "");
  const [theme, setTheme] = useState(user.defaultTheme);
  const [name, setName] = useState(user.name);
  const { busy, msg, run } = useAction();
  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        run(async () => {
          await api("/api/settings/github", { method: "POST", json: { githubUsername: username, defaultTheme: theme, name } });
          return "Saved.";
        });
      }}
    >
      <h2 className="title-hand text-2xl sm:text-3xl">Profile</h2>
      {msg ? <Alert kind={msg.kind} className="my-3">{msg.text}</Alert> : null}
      <div className="mt-3 grid gap-x-4 md:grid-cols-2">
        <Field label="Display name">
          <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required />
        </Field>
        <Field label="GitHub username" hint="Cards for this login will use your saved token (if any).">
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="octocat" spellCheck={false} required />
        </Field>
        <Field label="Default theme">
          <Select value={theme} onChange={(e) => setTheme(e.target.value)}>
            {Object.values(THEMES).map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Email">
          <Input value={user.email} disabled />
        </Field>
      </div>
      <Button type="submit" variant="primary" loading={busy}>
        Save profile
      </Button>
    </form>
  );
}

export function TokenForm({ user }: { user: PublicUser }) {
  const [token, setToken] = useState("");
  const { busy, msg, run } = useAction();
  return (
    <div>
      <h2 className="title-hand text-2xl sm:text-3xl">GitHub token</h2>
      <p className="mt-1 text-ink-soft">
        Optional. Encrypted at rest with AES-256-GCM and only decrypted in memory to call GitHub. Unlocks the GraphQL API: private-contribution counts, accurate language bytes, review counts and no shared rate limits.
      </p>
      {msg ? <Alert kind={msg.kind} className="my-3">{msg.text}</Alert> : null}
      {user.hasToken ? (
        <div className="sketch-flat mt-3 flex flex-wrap items-center justify-between gap-3 bg-[#e6f4e9] px-4 py-3">
          <span>
            <Icon name="key" size={18} className="inline" /> Token saved (…{user.tokenHint}) — validated {user.tokenValidatedAt ? new Date(user.tokenValidatedAt).toLocaleDateString() : ""}
          </span>
          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={busy}
            onClick={() =>
              run(async () => {
                await api("/api/settings/token", { method: "DELETE" });
                return "Token removed. Cards now use public data.";
              })
            }
          >
            Remove token
          </Button>
        </div>
      ) : null}
      <form
        className="mt-4"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          run(async () => {
            const r = await api<{ login: string }>("/api/settings/token", { method: "POST", json: { token: token.trim() } });
            setToken("");
            return `Token saved and validated for @${r.login}.`;
          });
        }}
      >
        <Field
          label={user.hasToken ? "Replace token" : "Add token"}
          hint={
            <>
              <a className="underline-squiggle" href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer">
                Create a fine-grained token
              </a>{" "}
              (public data needs no permissions; for private contribution counts grant read access to repositories) or a classic token with <code className="code">read:user</code> (+ <code className="code">repo</code> for private).
            </>
          }
        >
          <Input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_… or ghp_…" autoComplete="off" spellCheck={false} required />
        </Field>
        <Button type="submit" variant="secondary" loading={busy}>
          Validate &amp; save
        </Button>
      </form>
    </div>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const { busy, msg, run } = useAction();
  return (
    <form
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        run(async () => {
          await api("/api/settings/password", { method: "POST", json: { current, next } });
          setCurrent("");
          setNext("");
          return "Password updated. Every other device has been signed out.";
        });
      }}
    >
      <h2 className="title-hand text-2xl sm:text-3xl">Password</h2>
      {msg ? <Alert kind={msg.kind} className="my-3">{msg.text}</Alert> : null}
      <div className="mt-3 grid gap-x-4 md:grid-cols-2">
        <Field label="Current password">
          <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
        </Field>
        <Field label="New password" hint="At least 8 characters.">
          <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8} autoComplete="new-password" />
        </Field>
      </div>
      <Button type="submit" loading={busy}>
        Change password
      </Button>
    </form>
  );
}

/** Revokes every session for the account by bumping the user's token version. */
export function SessionsForm() {
  const { busy, msg, run } = useAction();
  return (
    <div>
      <h2 className="title-hand text-2xl sm:text-3xl">Signed-in devices</h2>
      <p className="mt-1 text-ink-soft">
        Sessions last 30 days. If you think someone else has one, sign them all out — you will stay signed in here.
      </p>
      {msg ? <Alert kind={msg.kind} className="my-3">{msg.text}</Alert> : null}
      <Button
        type="button"
        className="mt-3"
        loading={busy}
        onClick={() =>
          run(async () => {
            await api("/api/auth/logout-all", { method: "POST" });
            return "Every other device has been signed out.";
          })
        }
      >
        <Icon name="logout" size={16} /> Sign out everywhere else
      </Button>
    </div>
  );
}

export function DangerZone() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  return (
    <div>
      <h2 className="title-hand text-2xl text-danger sm:text-3xl">Danger zone</h2>
      <p className="mt-1 text-ink-soft">Deleting your account removes your profile and encrypted token. Card URLs for your username keep working with public data.</p>
      {error ? <Alert kind="error" className="my-3">{error}</Alert> : null}
      {!confirm ? (
        <Button type="button" variant="danger" className="mt-3" onClick={() => setConfirm(true)}>
          <Icon name="trash" size={16} /> Delete my account
        </Button>
      ) : (
        <form
          className="mt-3 flex flex-wrap items-end gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError(null);
            try {
              await api("/api/settings/account", { method: "DELETE", json: { password } });
              router.push("/");
              router.refresh();
            } catch (err) {
              setError((err as Error).message);
              setBusy(false);
            }
          }}
        >
          <div className="w-64">
            <Field label="Confirm with your password">
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </Field>
          </div>
          <Button type="submit" variant="danger" loading={busy} className="mb-4">
            Yes, delete forever
          </Button>
          <Button type="button" className="mb-4" onClick={() => setConfirm(false)}>
            Cancel
          </Button>
        </form>
      )}
    </div>
  );
}
