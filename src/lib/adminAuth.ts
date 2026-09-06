import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "hf_admin_session";
const MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return secret;
}

/** Signs a session token: `<expiry-timestamp>.<hmac>`. No session store needed for a single-user admin gate. */
export function createSessionToken(): string {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const sig = createHmac("sha256", getSecret()).update(String(expires)).digest("hex");
  return `${expires}.${sig}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expiresStr, sig] = token.split(".");
  if (!expiresStr || !sig) return false;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  const expected = createHmac("sha256", getSecret()).update(expiresStr).digest("hex");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function checkPassword(candidate: string): boolean {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) throw new Error("ADMIN_PASSWORD is not set");
  const a = Buffer.from(candidate);
  const b = Buffer.from(real);
  return a.length === b.length && timingSafeEqual(a, b);
}

export { COOKIE_NAME, MAX_AGE_SECONDS };
