import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth";
import { defaultProducts } from "@/lib/mock-data";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { User } from "@/models/User";

function seedUnauthorized() {
  return NextResponse.json({ message: "Non autorise" }, { status: 403 });
}

export async function POST(request: Request) {
  try {
    const isProd = process.env.NODE_ENV === "production";
    const seedSecret = process.env.SEED_SECRET?.trim();

    if (isProd) {
      if (!seedSecret) {
        return seedUnauthorized();
      }
      const provided = request.headers.get("x-seed-secret")?.trim();
      if (!provided || provided !== seedSecret) {
        return seedUnauthorized();
      }
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

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

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!existingAdmin) {
      await User.create({
        firstName: "Admin",
        lastName: "Principal",
        email: adminEmail.toLowerCase(),
        password: await hashPassword(adminPassword),
        role: "admin",
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Seed termine",
    });
  } catch {
    return NextResponse.json({ message: "Seed impossible" }, { status: 500 });
  }
}
