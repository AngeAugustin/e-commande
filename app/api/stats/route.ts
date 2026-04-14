import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";

export async function GET() {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    await connectToDatabase();
    const orders = await Order.find();

    const totalCommandes = orders.length;
    const totalVentes = orders.reduce((acc, order) => acc + order.total, 0);
    const productsMap = new Map<string, number>();

    for (const order of orders) {
      for (const item of order.items) {
        productsMap.set(item.name, (productsMap.get(item.name) || 0) + item.quantity);
      }
    }

    const platsPopulaires = [...productsMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }));

    return NextResponse.json({
      totalCommandes,
      totalVentes,
      platsPopulaires,
    });
  } catch {
    return NextResponse.json({ message: "Erreur stats" }, { status: 500 });
  }
}
