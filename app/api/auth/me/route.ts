import { NextResponse } from "next/server";

import { getAdminFromCookie } from "@/lib/auth";

export async function GET() {
  const admin = await getAdminFromCookie();
  return NextResponse.json({ authenticated: Boolean(admin) });
}
