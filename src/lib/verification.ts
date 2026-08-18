import { OneTimeToken } from "./models";
import { randomToken, sha256 } from "./crypto";
import { sendVerificationEmail } from "./mail";

export function appUrl(): string {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}

/** Creates a fresh verification token for the user and emails the link. */
export async function issueVerification(userId: string, email: string, name: string): Promise<void> {
  const raw = randomToken();
  await OneTimeToken.deleteMany({ userId, kind: "verify" });
  await OneTimeToken.create({ userId, kind: "verify", tokenHash: sha256(raw), expiresAt: new Date(Date.now() + 24 * 3600 * 1000) });
  await sendVerificationEmail(email, name, `${appUrl()}/verify?token=${raw}`);
}
