import { NextResponse } from "next/server";

import { resolveMomoPayment } from "@/lib/contact";
import { generateOrderCode } from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import { resolveOrderFromRequestBody } from "@/lib/resolve-order-items";
import { Order } from "@/models/Order";

/**
 * Crée une commande en attente de dépôt MoMo (pas de paiement en ligne).
 */
const MAX_BODY_BYTES = 64 * 1024;

export async function createOrder(request: Request): Promise<NextResponse> {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
      return NextResponse.json({ message: "Payload trop volumineux" }, { status: 413 });
    }

    const body = (await request.json()) as Record<string, unknown>;

    await connectToDatabase();
    const resolved = await resolveOrderFromRequestBody(body);
    if (!resolved.ok) {
      return NextResponse.json({ message: resolved.message }, { status: 400 });
    }

    const momo = await resolveMomoPayment(body.momoNetwork);
    if (!momo.ok) {
      return NextResponse.json({ message: momo.message }, { status: 400 });
    }

    const { items, total, deliveryType, customerInfo } = resolved.data;
    const orderCode = generateOrderCode();

    await Order.create({
      items,
      total,
      deliveryType,
      customerInfo,
      orderCode,
      momoPayment: momo.data,
      status: "en_attente" as const,
      paymentStatus: "pending" as const,
    });

    return NextResponse.json(
      { orderCode, total, momoPayment: momo.data },
      {
        status: 201,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    return NextResponse.json(
      { message: "Creation de commande impossible" },
      { status: 500 },
    );
  }
}
