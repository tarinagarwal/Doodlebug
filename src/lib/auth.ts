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

export async function createSession(userId: string): Promise<void> {
  const jwt = await new SignJWT({ sub: userId })
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

export async function getSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Returns the logged-in, email-verified user or null. */
export async function getCurrentUser(): Promise<UserDoc | null> {
  const id = await getSessionUserId();
  if (!id) return null;
  await db();
  const user = await User.findById(id).lean<UserDoc>();
  if (!user || !user.emailVerified) return null;
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
