import { timingSafeEqual } from "crypto";

import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth";
import { defaultProducts } from "@/lib/mock-data";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { User } from "@/models/User";

function seedUnauthorized() {
  return NextResponse.json({ message: "Non autorise" }, { status: 403 });
}

function secretsEqual(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Évite un early-return trop évident sur la longueur seule.
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  try {
    const seedSecret = process.env.SEED_SECRET?.trim();
    if (!seedSecret || seedSecret.length < 16) {
      return seedUnauthorized();
    }

    const provided = request.headers.get("x-seed-secret")?.trim() ?? "";
    if (!secretsEqual(provided, seedSecret)) {
      return seedUnauthorized();
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    // Ne pas trimmer le mot de passe : espaces intentionnels possibles.
    // Sur Vercel, éviter les # non quotés si tu colles via un fichier .env.
    const adminPassword = process.env.ADMIN_PASSWORD ?? "";
    const resetAdmin =
      request.headers.get("x-seed-reset-admin")?.trim() === "1";

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { message: "ADMIN_EMAIL et ADMIN_PASSWORD sont obligatoires pour le seed" },
        { status: 500 },
      );
    }

    if (adminPassword.length < 10) {
      return NextResponse.json(
        { message: "ADMIN_PASSWORD trop court (min 10 caracteres)" },
        { status: 500 },
      );
    }

    await connectToDatabase();

    const productCount = await Product.countDocuments();
    if (!productCount) {
      await Product.insertMany(defaultProducts);
    }

    const email = adminEmail.toLowerCase();
    const existingAdmin = await User.findOne({ email });
    let adminAction: "created" | "password_reset" | "unchanged" = "unchanged";

    if (!existingAdmin) {
      await User.create({
        firstName: "Admin",
        lastName: "Principal",
        email,
        password: await hashPassword(adminPassword),
        role: "admin",
      });
      adminAction = "created";
    } else if (resetAdmin) {
      existingAdmin.password = await hashPassword(adminPassword);
      existingAdmin.role = "admin";
      await existingAdmin.save();
      adminAction = "password_reset";
    }

    return NextResponse.json({
      ok: true,
      message: "Seed termine",
      adminAction,
    });
  } catch {
    return NextResponse.json({ message: "Seed impossible" }, { status: 500 });
  }
}
