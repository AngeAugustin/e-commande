import { NextResponse } from "next/server";

import { hashPassword } from "@/lib/auth";
import { defaultProducts } from "@/lib/mock-data";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { User } from "@/models/User";

export async function POST() {
  try {
    await connectToDatabase();

    const productCount = await Product.countDocuments();
    if (!productCount) {
      await Product.insertMany(defaultProducts);
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@ilosiwaju.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin1234!";

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        firstName: "Admin",
        lastName: "Principal",
        email: adminEmail,
        password: await hashPassword(adminPassword),
        role: "admin",
      });
    }

    return NextResponse.json({
      ok: true,
      adminEmail,
      message: "Seed termine",
    });
  } catch {
    return NextResponse.json({ message: "Seed impossible" }, { status: 500 });
  }
}
