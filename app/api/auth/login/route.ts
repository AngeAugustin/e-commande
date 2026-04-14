import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { comparePassword, getAuthCookieName, signAdminToken } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDatabase();

    const user = await User.findOne({ email: body.email });
    if (!user) {
      return NextResponse.json(
        { message: "Email ou mot de passe invalide" },
        { status: 401 },
      );
    }

    const valid = await comparePassword(body.password, user.password);
    if (!valid) {
      return NextResponse.json(
        { message: "Email ou mot de passe invalide" },
        { status: 401 },
      );
    }

    const token = signAdminToken(String(user._id));
    const cookieStore = await cookies();
    cookieStore.set(getAuthCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Connexion impossible" }, { status: 500 });
  }
}
