import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-10">
      <h1 className="title-hand text-6xl">Privacy, in plain handwriting</h1>
      <div className="mt-6 space-y-5 sketch p-6 text-ink-soft">
        <p>
          <b className="text-ink">What we store.</b> Your name, email, a bcrypt hash of your password, your GitHub username, your default theme, and — only if you add one — your GitHub token encrypted with AES-256-GCM. We also keep a short-lived cache of the public GitHub data used to draw your cards, and an anonymous log of which card types were rendered (kept 30 days) to see what people use.
        </p>
        <p>
          <b className="text-ink">What we do with your token.</b> It is decrypted in memory only when Doodlebug fetches your GitHub data, then discarded. It is never logged, never sent anywhere except api.github.com, and you can remove it in Settings at any time.
        </p>
        <p>
          <b className="text-ink">Email.</b> We send email only to verify your address and for password resets. No newsletters, no marketing.
        </p>
        <p>
          <b className="text-ink">Cookies.</b> A single httpOnly session cookie keeps you logged in. No analytics or third-party trackers.
        </p>
        <p>
          <b className="text-ink">Card images.</b> Card URLs are public by design so they can render in READMEs. They only contain data GitHub already shows publicly (or, with your token, counts you chose to expose).
        </p>
        <p>
          <b className="text-ink">Deleting your account</b> removes your profile and token immediately. Questions? Open an issue on the GitHub repo.
        </p>
      </div>
    </div>
  );
}
