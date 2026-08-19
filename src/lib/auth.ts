import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { User, type UserDoc } from "./models";

const COOKIE = "db_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret(): Uint8Array {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET must be set (>=32 chars)");
  return new TextEncoder().encode(s);
}

export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 12);
}
export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}

export async function createSession(userId: string, tokenVersion = 0): Promise<void> {
  const jwt = await new SignJWT({ sub: userId, v: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());
  const jar = await cookies();
  jar.set(COOKIE, jwt, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

interface SessionClaims {
  id: string;
  /** token version the session was issued at; older versions are rejected */
  v: number;
}

async function readSession(): Promise<SessionClaims | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (typeof payload.sub !== "string") return null;
    return { id: payload.sub, v: typeof payload.v === "number" ? payload.v : 0 };
  } catch {
    return null;
  }
}

export async function getSessionUserId(): Promise<string | null> {
  return (await readSession())?.id ?? null;
}

/** Invalidates every session for a user and returns the new version. */
export async function bumpTokenVersion(userId: string): Promise<number> {
  await db();
  const updated = await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } }, { new: true })
    .select("tokenVersion")
    .lean<{ tokenVersion?: number }>();
  return updated?.tokenVersion ?? 0;
}

/** Returns the logged-in, email-verified user whose session is still current, or null. */
export async function getCurrentUser(): Promise<UserDoc | null> {
  const session = await readSession();
  if (!session) return null;
  await db();
  const user = await User.findById(session.id).lean<UserDoc>();
  if (!user || !user.emailVerified) return null;
  // A password reset or "log out everywhere" bumps tokenVersion, which strands every JWT
  // issued before it — including one an attacker is still holding.
  if ((user.tokenVersion ?? 0) !== session.v) return null;
  return user;
}

export type PublicUser = {
  id: string;
  email: string;
  name: string;
  githubUsername: string | null;
  hasToken: boolean;
  tokenHint: string | null;
  tokenValidatedAt: string | null;
  defaultTheme: string;
  createdAt: string;
};

export function toPublicUser(u: UserDoc): PublicUser {
  return {
    id: String(u._id),
    email: u.email,
    name: u.name,
    githubUsername: u.githubUsername ?? null,
    hasToken: Boolean(u.githubTokenEnc),
    tokenHint: u.githubTokenHint ?? null,
    tokenValidatedAt: u.githubTokenValidatedAt ? new Date(u.githubTokenValidatedAt).toISOString() : null,
    defaultTheme: u.defaultTheme ?? "paper",
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
  };
}
