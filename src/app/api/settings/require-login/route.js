import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ requireLogin: false, tunnelDashboardAccess: true, tunnelUrl: "", tailscaleUrl: "" });
}
