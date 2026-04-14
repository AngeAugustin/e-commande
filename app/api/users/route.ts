import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { hashPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function GET() {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) return unauthorized;

  try {
    await connectToDatabase();
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ message: "Chargement impossible" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const role = "admin";

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { message: "Nom, prenoms et email sont obligatoires" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ message: "Email deja utilise" }, { status: 409 });
    }

    const defaultPassword = process.env.DEFAULT_NEW_ADMIN_PASSWORD || "Admin1234!";
    const password = await hashPassword(defaultPassword);

    const created = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    });

    return NextResponse.json(
      {
        _id: created._id,
        firstName: created.firstName,
        lastName: created.lastName,
        email: created.email,
        role: created.role,
        defaultPassword,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ message: "Creation impossible" }, { status: 500 });
  }
}
