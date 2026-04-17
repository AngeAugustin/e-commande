import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const unauthorized = await ensureAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  try {
    const { searchParams } = new URL(request.url);
    const limitRaw = Number.parseInt(searchParams.get("limit") ?? "100", 10);
    const skipRaw = Number.parseInt(searchParams.get("skip") ?? "0", 10);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(500, Math.max(1, Math.floor(limitRaw)))
      : 100;
    const skip = Number.isFinite(skipRaw) ? Math.max(0, Math.floor(skipRaw)) : 0;

    await connectToDatabase();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json(
      { message: "Erreur lors du chargement des commandes" },
      { status: 500 },
    );
  }
}

/**
 * L’ancien flux passait par POST /api/orders sans FedaPay. Les bundles JS mis en cache
 * continuaient d’appeler cette URL : ils recevront cette erreur jusqu’à rechargement forcé.
 */
export async function POST() {
  return NextResponse.json(
    {
      message:
        "Mise a jour requise : rechargez la page avec Ctrl+Maj+R (Windows) ou Cmd+Maj+R (Mac), puis reessayez. Le paiement passe maintenant par FedaPay.",
    },
    { status: 410 },
  );
}
