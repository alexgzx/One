import { NextResponse } from "next/server";
import { getSettings } from "@/lib/localDb";

export function isLocalRequest() {
  return true;
}

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Always block direct access to settings/database export (dangerous).
  if (pathname === "/api/auth/oidc/start") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Root redirects to dashboard.
  if (pathname === "/" || pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}
