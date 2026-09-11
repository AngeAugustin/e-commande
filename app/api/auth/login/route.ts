import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  comparePassword,
  getAuthCookieName,
  getAuthCookieOptions,
  signAdminToken,
} from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const ip = clientIpFromRequest(request);
    const limited = rateLimit(`login:${ip}`, { limit: 8, windowMs: 15 * 60 * 1000 });
    if (!limited.ok) {
      return NextResponse.json(
        { message: "Trop de tentatives. Reessayez plus tard." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        },
      );
    }

    const body = await request.json();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email ou mot de passe invalide" },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { message: "Email ou mot de passe invalide" },
        { status: 401 },
      );
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { message: "Email ou mot de passe invalide" },
        { status: 401 },
      );
    }

    const token = signAdminToken(String(user._id));
    const cookieStore = await cookies();
    cookieStore.set(getAuthCookieName(), token, getAuthCookieOptions());

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Connexion impossible" }, { status: 500 });
  }
}
