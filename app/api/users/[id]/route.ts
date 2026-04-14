import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { getAdminFromCookie } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteParams) {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) return unauthorized;

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
    const duplicate = await User.findOne({ email, _id: { $ne: id } });
    if (duplicate) {
      return NextResponse.json({ message: "Email deja utilise" }, { status: 409 });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email, role: "admin" },
      { new: true },
    ).select("-password");

    if (!updated) {
      return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "Mise a jour impossible" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const admin = await getAdminFromCookie();
    await connectToDatabase();

    const adminsCount = await User.countDocuments({ role: "admin" });
    if (adminsCount <= 1) {
      return NextResponse.json(
        { message: "Impossible de supprimer le dernier admin" },
        { status: 400 },
      );
    }

    if (admin?.userId === id) {
      return NextResponse.json(
        { message: "Impossible de supprimer votre propre compte" },
        { status: 400 },
      );
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Suppression impossible" }, { status: 500 });
  }
}
