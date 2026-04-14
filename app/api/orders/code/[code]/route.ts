import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";

type RouteParams = {
  params: Promise<{ code: string }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const { code } = await params;
    await connectToDatabase();
    const order = await Order.findOne({ orderCode: code });

    if (!order) {
      return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { message: "Erreur lors du suivi de commande" },
      { status: 500 },
    );
  }
}
