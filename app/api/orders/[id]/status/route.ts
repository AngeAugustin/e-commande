import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const body = await request.json();
    const { id } = await params;
    await connectToDatabase();

    const updated = await Order.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true },
    );
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { message: "Mise a jour du statut impossible" },
      { status: 500 },
    );
  }
}
