import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { connectToDatabase } from "@/lib/mongodb";
import { Product } from "@/models/Product";

export async function GET() {
  try {
    await connectToDatabase();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { message: "Erreur lors du chargement du menu" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await request.json();
    await connectToDatabase();
    const created = await Product.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Creation du produit impossible" },
      { status: 500 },
    );
  }
}
