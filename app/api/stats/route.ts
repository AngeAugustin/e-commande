import { NextResponse } from "next/server";

import { aggregateTopProducts, aggregateTotalVentes } from "@/lib/admin-order-stats";
import { paidOrdersFilter } from "@/lib/order-payment";
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
    const [totalCommandes, ventesRows, platsAgg] = await Promise.all([
      Order.countDocuments(paidOrdersFilter()),
      aggregateTotalVentes(),
      aggregateTopProducts(5),
    ]);

    const totalVentes = ventesRows[0]?.ventes ?? 0;
    const platsPopulaires = platsAgg.map((row) => ({
      name: row._id,
      quantity: row.quantity,
    }));

    return NextResponse.json({
      totalCommandes,
      totalVentes,
      platsPopulaires,
    });
  } catch {
    return NextResponse.json({ message: "Erreur stats" }, { status: 500 });
  }
}
