import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { createOrder } from "@/lib/create-order";
import { connectToDatabase } from "@/lib/mongodb";
import { clientIpFromRequest, rateLimit } from "@/lib/rate-limit";
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

export async function POST(request: Request) {
  const ip = clientIpFromRequest(request);
  const limited = rateLimit(`orders:${ip}`, { limit: 15, windowMs: 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { message: "Trop de commandes. Reessayez dans un instant." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );
  }
  return createOrder(request);
}
