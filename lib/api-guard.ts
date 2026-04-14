import { NextResponse } from "next/server";

import { getAdminFromCookie } from "@/lib/auth";

export async function ensureAdminApi() {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return NextResponse.json({ message: "Non autorise" }, { status: 401 });
  }
  return null;
}
