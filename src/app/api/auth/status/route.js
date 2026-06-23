import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    requireLogin: false,
    authMode: "password",
    oidcConfigured: false,
    oidcLoginLabel: "Sign in with OIDC",
    hasPassword: false,
    displayName: "",
    loginMethod: "",
    oidcName: null,
    oidcEmail: null,
    oidcLogin: false,
  });
}
