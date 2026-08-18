"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Alert, Button, Field, Input, api } from "./ui";
import { Icon, Loader } from "./doodles";

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [unverified, setUnverified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resent, setResent] = useState(false);
  const next = sp.get("next") || "/dashboard";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setUnverified(false);
    try {
      await api("/api/auth/login", { method: "POST", json: { email, password } });
      router.push(next);
      router.refresh();
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      if (/verify/i.test(msg)) setUnverified(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit}>
      <h1 className="title-hand text-4xl">Welcome back</h1>
      <p className="mb-5 mt-1 text-ink-soft">Log in to build and manage your cards.</p>
      {sp.get("reset") === "1" ? <Alert kind="success" className="mb-4">Password updated — you are logged in.</Alert> : null}
      {sp.get("verified") === "1" ? <Alert kind="success" className="mb-4">Email verified! Log in to continue.</Alert> : null}
      {error ? (
        <Alert kind="error" className="mb-4">
          {error}
          {unverified ? (
            <div className="mt-2">
              <Button
                type="button"
                size="sm"
                onClick={async () => {
                  try {
                    await api("/api/auth/resend", { method: "POST", json: { email } });
                    setResent(true);
                  } catch (e2) {
                    setError((e2 as Error).message);
                  }
                }}
                disabled={resent}
              >
                {resent ? "Sent — check your inbox" : "Resend verification email"}
              </Button>
            </div>
          ) : null}
        </Alert>
      ) : null}
      <Field label="Email" htmlFor="email">
        <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </Field>
      <Button type="submit" variant="primary" className="w-full" loading={busy}>
        Log in
      </Button>
      <div className="mt-4 flex justify-between text-[0.98rem] text-ink-soft">
        <Link href="/forgot" className="underline-squiggle">
          Forgot password?
        </Link>
        <Link href="/signup" className="underline-squiggle">
          Create an account
        </Link>
      </div>
    </form>
  );
}

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api("/api/auth/signup", { method: "POST", json: { name, email, password } });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <Icon name="mail" size={48} className="mx-auto text-accent-2" />
        <h1 className="title-hand mt-2 text-4xl">Check your inbox</h1>
        <p className="mt-2 text-ink-soft">
          We sent a verification link to <b>{email}</b>. Click it to activate your account. (Look in spam if it hides.)
        </p>
        <Button
          type="button"
          className="mt-5"
          onClick={async () => {
            try {
              await api("/api/auth/resend", { method: "POST", json: { email } });
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Resend email
        </Button>
        {error ? <Alert kind="error" className="mt-4">{error}</Alert> : null}
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <h1 className="title-hand text-4xl">Create your account</h1>
      <p className="mb-5 mt-1 text-ink-soft">Free forever. We only email you to verify or reset.</p>
      {error ? <Alert kind="error" className="mb-4">{error}</Alert> : null}
      <Field label="Name" htmlFor="name">
        <Input id="name" required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" autoComplete="name" />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
      </Field>
      <Field label="Password" htmlFor="password" hint="At least 8 characters.">
        <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" autoComplete="new-password" />
      </Field>
      <Button type="submit" variant="primary" className="w-full" loading={busy}>
        Sign up
      </Button>
      <p className="mt-4 text-center text-[0.98rem] text-ink-soft">
        Already have an account?{" "}
        <Link href="/login" className="underline-squiggle">
          Log in
        </Link>
      </p>
    </form>
  );
}

export function VerifyPanel() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") || "";
  const [state, setState] = useState<"working" | "ok" | "error">("working");
  const [error, setError] = useState<string>("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      setState("error");
      setError("Missing token. Open the link from your email.");
      return;
    }
    api("/api/auth/verify", { method: "POST", json: { token } })
      .then(() => {
        setState("ok");
        setTimeout(() => {
          router.push("/dashboard?welcome=1");
          router.refresh();
        }, 900);
      })
      .catch((e: Error) => {
        setState("error");
        setError(e.message);
      });
  }, [token, router]);

  return (
    <div className="text-center">
      {state === "working" ? (
        <>
          <Loader size={40} />
          <h1 className="title-hand mt-3 text-4xl">Verifying…</h1>
        </>
      ) : state === "ok" ? (
        <>
          <Icon name="check" size={48} className="mx-auto text-ok" />
          <h1 className="title-hand mt-2 text-4xl">You are verified!</h1>
          <p className="mt-1 text-ink-soft">Taking you to your dashboard…</p>
        </>
      ) : (
        <>
          <h1 className="title-hand text-4xl">Hmm, that did not work</h1>
          <Alert kind="error" className="mt-4">{error}</Alert>
          <div className="mt-4 flex justify-center gap-3">
            <Link href="/login" className="btn">
              Log in
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Sign up again
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          await api("/api/auth/forgot", { method: "POST", json: { email } });
          setDone(true);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h1 className="title-hand text-4xl">Forgot your password?</h1>
      <p className="mb-5 mt-1 text-ink-soft">Happens to the best of us. We will email you a reset link.</p>
      {done ? <Alert kind="success" className="mb-4">If that email has an account, a reset link is on its way.</Alert> : null}
      {error ? <Alert kind="error" className="mb-4">{error}</Alert> : null}
      <Field label="Email" htmlFor="email">
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </Field>
      <Button type="submit" variant="primary" className="w-full" loading={busy} disabled={done}>
        Send reset link
      </Button>
      <p className="mt-4 text-center text-[0.98rem]">
        <Link href="/login" className="underline-squiggle">
          Back to login
        </Link>
      </p>
    </form>
  );
}

export function ResetForm() {
  const sp = useSearchParams();
  const router = useRouter();
  const token = sp.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (password !== confirm) {
          setError("Passwords do not match.");
          return;
        }
        setBusy(true);
        setError(null);
        try {
          await api("/api/auth/reset", { method: "POST", json: { token, password } });
          router.push("/dashboard?reset=1");
          router.refresh();
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h1 className="title-hand text-4xl">Choose a new password</h1>
      <p className="mb-5 mt-1 text-ink-soft">Make it a good one this time ✍️</p>
      {!token ? <Alert kind="error" className="mb-4">Missing token — open the link from your email.</Alert> : null}
      {error ? <Alert kind="error" className="mb-4">{error}</Alert> : null}
      <Field label="New password" htmlFor="password">
        <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
      </Field>
      <Field label="Confirm password" htmlFor="confirm">
        <Input id="confirm" type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      </Field>
      <Button type="submit" variant="primary" className="w-full" loading={busy} disabled={!token}>
        Update password
      </Button>
    </form>
  );
}
