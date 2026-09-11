import { NextResponse } from "next/server";
import { Types } from "mongoose";

import { ensureSuperAdminApi } from "@/lib/api-guard";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, { params }: RouteParams) {
  const unauthorized = await ensureSuperAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    }

    await connectToDatabase();
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Suppression impossible" }, { status: 500 });
  }
}
