import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { toPublicOrder } from "@/lib/public-order";
import { Order } from "@/models/Order";

type RouteParams = {
  params: Promise<{ code: string }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const { code } = await params;
    const orderCode = String(code ?? "").trim();
    if (!orderCode || orderCode.length > 64) {
      return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    }

    await connectToDatabase();
    const order = await Order.findOne({ orderCode }).lean();

    if (!order) {
      return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    }

    return NextResponse.json(toPublicOrder(order as Record<string, unknown>));
  } catch {
    return NextResponse.json(
      { message: "Erreur lors du suivi de commande" },
      { status: 500 },
    );
  }
}
