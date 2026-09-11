import { NextResponse } from "next/server";

import { requireStaffApi } from "@/lib/api-guard";
import { hashPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { isSuperAdmin, parseStaffRole } from "@/lib/roles";
import { User } from "@/models/User";
import type { StaffRole } from "@/types";

export async function GET() {
  const auth = await requireStaffApi();
  if (!auth.ok) return auth.response;
  if (!isSuperAdmin(auth.session.role)) {
    return NextResponse.json(
      { message: "Action reservee au super admin" },
      { status: 403 },
    );
  }

  try {
    await connectToDatabase();
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    return NextResponse.json(users);
  } catch {
    return NextResponse.json({ message: "Chargement impossible" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireStaffApi();
  if (!auth.ok) return auth.response;
  if (!isSuperAdmin(auth.session.role)) {
    return NextResponse.json(
      { message: "Action reservee au super admin" },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    let role: StaffRole = parseStaffRole(body.role, "admin");

    // Seul un super_admin peut creer un autre super_admin.
    if (role === "super_admin" && !isSuperAdmin(auth.session.role)) {
      role = "admin";
    }

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { message: "Nom, prenoms et email sont obligatoires" },
        { status: 400 },
      );
    }

    if (password.length < 10) {
      return NextResponse.json(
        { message: "Mot de passe trop court (min 10 caracteres)" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const exists = await User.findOne({ email });
    if (exists) {
      return NextResponse.json({ message: "Email deja utilise" }, { status: 409 });
    }

    const created = await User.create({
      firstName,
      lastName,
      email,
      password: await hashPassword(password),
      role,
    });

    return NextResponse.json(
      {
        _id: created._id,
        firstName: created.firstName,
        lastName: created.lastName,
        email: created.email,
        role: created.role,
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json({ message: "Creation impossible" }, { status: 500 });
  }
}
