import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAuthCookieName, getAuthCookieOptions } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.set(getAuthCookieName(), "", {
    ...getAuthCookieOptions(0),
    maxAge: 0,
  });
  return NextResponse.json({ ok: true });
}
