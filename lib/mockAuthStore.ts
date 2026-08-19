import crypto from "crypto";
import type { CustomerProfile } from "@/lib/types";

/**
 * A tiny in-memory user store so login/register work out of the box in
 * mock mode (NEXT_PUBLIC_BACKEND_ENABLED=false), without needing Google
 * Sheets set up. This lives only in server memory for the lifetime of
 * the running process — it resets on restart and won't work across
 * separate serverless function instances in production. It exists purely
 * for local development and demos; real persistence is
 * apps-script/Customers.gs once the backend is connected.
 */

type MockUser = {
  customerId: string;
  fullName: string;
  email: string;
  mobile: string;
  gender: string;
  dob: string;
  passwordHash: string;
  salt: string;
};

const g = globalThis as unknown as { __kartmeMockUsers?: MockUser[] };
if (!g.__kartmeMockUsers) g.__kartmeMockUsers = [];
const users = g.__kartmeMockUsers;

const SESSION_SECRET = "kartme-mock-dev-secret-do-not-use-in-production";

function hash(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 32, "sha256").toString("base64");
}

export function findUser(identifier: string): MockUser | undefined {
  return users.find((u) => u.mobile === identifier || u.email === identifier.toLowerCase());
}

export function registerMockUser(input: {
  fullName: string;
  mobile: string;
  email: string;
  password: string;
  gender: string;
  dob?: string;
}): { error?: string; profile?: CustomerProfile; sessionToken?: string } {
  if (!/^[6-9]\d{9}$/.test(input.mobile)) return { error: "Enter a valid 10-digit mobile number" };
  if (!/^\S+@\S+\.\S+$/.test(input.email)) return { error: "Enter a valid email address" };
  if (!input.password || input.password.length < 8) return { error: "Password must be at least 8 characters" };
  if (findUser(input.mobile) || findUser(input.email)) {
    return { error: "An account with this mobile number or email already exists" };
  }

  const salt = crypto.randomBytes(16).toString("base64");
  const customerId = "CUS-" + String(users.length + 1).padStart(6, "0");
  const user: MockUser = {
    customerId,
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    mobile: input.mobile,
    gender: input.gender || "",
    dob: input.dob || "",
    passwordHash: hash(input.password, salt),
    salt,
  };
  users.push(user);

  return {
    profile: toProfile(user),
    sessionToken: issueMockSession(customerId),
  };
}

export function loginMockUser(identifier: string, password: string): { error?: string; profile?: CustomerProfile; sessionToken?: string } {
  const user = findUser(identifier);
  if (!user || hash(password, user.salt) !== user.passwordHash) {
    return { error: "Invalid mobile/email or password" };
  }
  return { profile: toProfile(user), sessionToken: issueMockSession(user.customerId) };
}

export function issueMockSession(customerId: string): string {
  const payload = JSON.stringify({ customerId, expiresAt: Date.now() + 7 * 86400000 });
  const payloadB64 = Buffer.from(payload).toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export function verifyMockSession(token: string | undefined): string | null {
  if (!token || !token.includes(".")) return null;
  const [payloadB64, sig] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(payloadB64).digest("base64url");
  if (sig !== expectedSig) return null;
  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (Date.now() > payload.expiresAt) return null;
    return payload.customerId;
  } catch {
    return null;
  }
}

export function getMockProfile(customerId: string): CustomerProfile | null {
  const user = users.find((u) => u.customerId === customerId);
  return user ? toProfile(user) : null;
}

function toProfile(user: MockUser): CustomerProfile {
  return {
    customerId: user.customerId,
    fullName: user.fullName,
    email: user.email,
    mobile: user.mobile,
    gender: user.gender,
    dateOfBirth: user.dob,
    profileImage: "",
  };
}
