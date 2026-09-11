import { NextResponse } from "next/server";

import { requireStaffApi } from "@/lib/api-guard";
import { connectToDatabase } from "@/lib/mongodb";
import { isStaffRole, isSuperAdmin, parseStaffRole } from "@/lib/roles";
import { User } from "@/models/User";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteParams) {
  const auth = await requireStaffApi();
  if (!auth.ok) return auth.response;
  if (!isSuperAdmin(auth.session.role)) {
    return NextResponse.json(
      { message: "Action reservee au super admin" },
      { status: 403 },
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { message: "Nom, prenoms et email sont obligatoires" },
        { status: 400 },
      );
    }

    await connectToDatabase();
    const existing = await User.findById(id);
    if (!existing) {
      return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
    }

    const duplicate = await User.findOne({ email, _id: { $ne: id } });
    if (duplicate) {
      return NextResponse.json({ message: "Email deja utilise" }, { status: 409 });
    }

    let nextRole = existing.role;
    if (body.role !== undefined && isStaffRole(body.role)) {
      nextRole = parseStaffRole(body.role, existing.role);
      if (nextRole === "super_admin" && !isSuperAdmin(auth.session.role)) {
        return NextResponse.json(
          { message: "Seul un super admin peut attribuer ce role" },
          { status: 403 },
        );
      }
      if (
        existing.role === "super_admin" &&
        nextRole !== "super_admin" &&
        !isSuperAdmin(auth.session.role)
      ) {
        return NextResponse.json(
          { message: "Seul un super admin peut modifier ce role" },
          { status: 403 },
        );
      }
      if (existing.role === "super_admin" && nextRole !== "super_admin") {
        const superCount = await User.countDocuments({ role: "super_admin" });
        if (superCount <= 1) {
          return NextResponse.json(
            { message: "Impossible de retirer le dernier super admin" },
            { status: 400 },
          );
        }
      }
    }

    existing.firstName = firstName;
    existing.lastName = lastName;
    existing.email = email;
    existing.role = nextRole;
    await existing.save();

    return NextResponse.json({
      _id: existing._id,
      firstName: existing.firstName,
      lastName: existing.lastName,
      email: existing.email,
      role: existing.role,
      createdAt: existing.createdAt,
    });
  } catch {
    return NextResponse.json({ message: "Mise a jour impossible" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const auth = await requireStaffApi();
  if (!auth.ok) return auth.response;
  if (!isSuperAdmin(auth.session.role)) {
    return NextResponse.json(
      { message: "Action reservee au super admin" },
      { status: 403 },
    );
  }

  try {
    const { id } = await params;
    await connectToDatabase();

    if (auth.session.userId === id) {
      return NextResponse.json(
        { message: "Impossible de supprimer votre propre compte" },
        { status: 400 },
      );
    }

    const target = await User.findById(id);
    if (!target) {
      return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
    }

    if (target.role === "super_admin") {
      const superCount = await User.countDocuments({ role: "super_admin" });
      if (superCount <= 1) {
        return NextResponse.json(
          { message: "Impossible de supprimer le dernier super admin" },
          { status: 400 },
        );
      }
      if (!isSuperAdmin(auth.session.role)) {
        return NextResponse.json(
          { message: "Seul un super admin peut supprimer un super admin" },
          { status: 403 },
        );
      }
    }

    await User.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Suppression impossible" }, { status: 500 });
  }
}
