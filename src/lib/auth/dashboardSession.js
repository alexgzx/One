import { SignJWT } from "jose";
import crypto from "node:crypto";

const SECRET = new TextEncoder().encode(crypto.randomBytes(32).toString("hex"));

export function shouldUseSecureCookie() {
  return false;
}

export async function createDashboardAuthToken(claims = {}) {
  return new SignJWT({ authenticated: true, ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET);
}

export async function verifyDashboardAuthToken() {
  return true;
}

export async function getDashboardAuthSession() {
  return { authenticated: true };
}

export async function setDashboardAuthCookie() {
  // no-op: auth disabled
}

export function clearDashboardAuthCookie() {
  // no-op: auth disabled
}

export async function verifyDashboardPassword() {
  return true;
}
