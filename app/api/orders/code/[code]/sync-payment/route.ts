import { NextResponse } from "next/server";

import { configureFedaPay, Transaction } from "@/lib/fedapay-server";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import type { OrderStatus } from "@/types";

export const runtime = "nodejs";

type RouteParams = {
  params: Promise<{ code: string }>;
};

function kitchenWorkflowStarted(status: string) {
  return (["en_preparation", "pret", "livre"] as OrderStatus[]).includes(status as OrderStatus);
}

function isDeclinedOrCanceled(status: string) {
  const s = status.toLowerCase();
  return s.includes("declined") || s === "canceled" || s === "cancelled";
}

/**
 * Interroge FedaPay puis met à jour la commande. Utile quand le webhook n’atteint pas le serveur
 * (ex. localhost), après le retour utilisateur depuis la page de paiement.
 */
export async function POST(_: Request, { params }: RouteParams) {
  try {
    const { code } = await params;
    await connectToDatabase();

    const order = await Order.findOne({ orderCode: code });
    if (!order) {
      return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
    }

    if (order.paymentStatus === "paid") {
      if (order.status === "en_attente") {
        await Order.updateOne({ _id: order._id }, { $set: { status: "paye" } });
      }
      return NextResponse.json(
        { paymentStatus: "paid" as const },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
    if (order.paymentStatus === "failed") {
      return NextResponse.json(
        { paymentStatus: "failed" as const },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    const txId = order.fedapayTransactionId?.trim();
    if (!txId) {
      return NextResponse.json(
        { paymentStatus: "pending" as const },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    configureFedaPay();
    const tx = await Transaction.retrieve(txId);
    const statusStr = String(tx.status ?? "");

    if (typeof tx.wasPaid === "function" && tx.wasPaid()) {
      const ref = tx.reference != null ? String(tx.reference).trim() : "";
      const $set: Record<string, unknown> = {
        paymentStatus: "paid",
        paidAt: new Date(),
      };
      if (ref) {
        $set.fedapayReference = ref;
      }
      if (!kitchenWorkflowStarted(String(order.status))) {
        $set.status = "paye";
      }
      await Order.updateOne({ _id: order._id }, { $set });
      return NextResponse.json(
        { paymentStatus: "paid" as const },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    if (isDeclinedOrCanceled(statusStr)) {
      await Order.updateOne(
        { _id: order._id, paymentStatus: "pending" },
        { $set: { paymentStatus: "failed" } },
      );
      return NextResponse.json(
        { paymentStatus: "failed" as const },
        { headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { paymentStatus: "pending" as const },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { paymentStatus: "pending" as const, message: "Synchronisation FedaPay impossible pour le moment" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
