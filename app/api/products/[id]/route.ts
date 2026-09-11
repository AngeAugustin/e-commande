import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { connectToDatabase } from "@/lib/mongodb";
import { pickProductFields } from "@/lib/product-fields";
import { Product } from "@/models/Product";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: RouteParams) {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await params;
    const body = (await request.json()) as Record<string, unknown>;
    const picked = pickProductFields(body);
    if (!picked.ok) {
      return NextResponse.json({ message: picked.message }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await Product.findByIdAndUpdate(id, picked.data, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { message: "Mise a jour du produit impossible" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { id } = await params;
    await connectToDatabase();
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Suppression du produit impossible" },
      { status: 500 },
    );
  }
}
