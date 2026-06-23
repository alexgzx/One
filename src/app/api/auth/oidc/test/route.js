import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    ok: true,
    discoveryOk: true,
    clientSecretTested: false,
    clientSecretValid: null,
    message: "OIDC is not required for dashboard access.",
  });
}
