import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { ORDER_STATUSES } from "@/lib/constants";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import type { OrderStatus } from "@/types";

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

    const nextStatus = body.status as string | undefined;
    if (!nextStatus || !(ORDER_STATUSES as string[]).includes(nextStatus)) {
      return NextResponse.json({ message: "Statut invalide" }, { status: 400 });
    }

    const status = nextStatus as OrderStatus;
    const update: Record<string, unknown> = { status };
    if (status === "paye" || status === "pret") {
      update.paymentStatus = "paid";
    }

    const updated = await Order.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { message: "Mise a jour du statut impossible" },
      { status: 500 },
    );
  }
}
