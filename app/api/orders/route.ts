import { NextResponse } from "next/server";

import { ensureAdminApi } from "@/lib/api-guard";
import { generateOrderCode } from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";

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
  try {
    const body = await request.json();

    if (!body?.items?.length) {
      return NextResponse.json({ message: "Panier vide" }, { status: 400 });
    }
    if (!body?.customerInfo?.name || !body?.customerInfo?.phone) {
      return NextResponse.json(
        { message: "Nom et telephone client obligatoires" },
        { status: 400 },
      );
    }
    if (body.deliveryType === "livraison" && !body?.customerInfo?.address?.trim()) {
      return NextResponse.json(
        { message: "Adresse de livraison obligatoire" },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const orderCode = generateOrderCode();
    const created = await Order.create({
      ...body,
      orderCode,
      status: "en_attente",
    });

    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Creation de commande impossible" },
      { status: 500 },
    );
  }
}
