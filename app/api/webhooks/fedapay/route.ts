import { NextResponse } from "next/server";
import { Webhook } from "fedapay";

import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import type { OrderStatus } from "@/types";

function kitchenWorkflowStarted(status: string) {
  return (["en_preparation", "pret", "livre"] as OrderStatus[]).includes(status as OrderStatus);
}

export const runtime = "nodejs";

type JsonRecord = Record<string, unknown>;

function readHeaderSig(headers: Headers) {
  return (
    headers.get("x-fedapay-signature") ??
    headers.get("X-FEDAPAY-SIGNATURE") ??
    ""
  );
}

function getNestedString(obj: unknown, keys: string[]): string | undefined {
  let cur: unknown = obj;
  for (const k of keys) {
    if (!cur || typeof cur !== "object") {
      return undefined;
    }
    cur = (cur as JsonRecord)[k];
  }
  return typeof cur === "string" ? cur : undefined;
}

function extractOrderCodeFromTransaction(tx: JsonRecord | undefined): string | undefined {
  if (!tx) {
    return undefined;
  }
  const meta = tx.custom_metadata;
  if (meta && typeof meta === "object") {
    const m = meta as JsonRecord;
    const a = m.orderCode;
    const b = m.order_code;
    if (typeof a === "string" && a.trim()) {
      return a.trim();
    }
    if (typeof b === "string" && b.trim()) {
      return b.trim();
    }
  }
  return undefined;
}

function transactionPayloadFromEvent(event: JsonRecord): JsonRecord | undefined {
  const entity = event.entity;
  if (entity && typeof entity === "object") {
    return entity as JsonRecord;
  }
  const data = event.data;
  if (data && typeof data === "object") {
    const d = data as JsonRecord;
    const inner = d.object ?? d.transaction;
    if (inner && typeof inner === "object") {
      return inner as JsonRecord;
    }
  }
  const obj = event.object;
  if (obj && typeof obj === "object") {
    return obj as JsonRecord;
  }
  return undefined;
}

export async function POST(request: Request) {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json({ message: "Webhook non configure" }, { status: 500 });
  }

  const rawBody = await request.text();
  const sig = readHeaderSig(request.headers);

  let event: JsonRecord;
  try {
    event = Webhook.constructEvent(rawBody, sig, secret) as JsonRecord;
  } catch {
    return NextResponse.json({ message: "Signature invalide" }, { status: 400 });
  }

  const name = typeof event.name === "string" ? event.name : "";
  const tx = transactionPayloadFromEvent(event);
  const orderCode =
    extractOrderCodeFromTransaction(tx) ??
    getNestedString(event, ["entity", "custom_metadata", "orderCode"]) ??
    getNestedString(event, ["entity", "custom_metadata", "order_code"]);

  const fedapayId =
    tx && typeof tx.id === "number"
      ? String(tx.id)
      : tx && typeof tx.id === "string"
        ? tx.id
        : undefined;

  if (!orderCode && !fedapayId) {
    return NextResponse.json({ received: true });
  }

  try {
    await connectToDatabase();
  } catch {
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }

  if (name === "transaction.approved") {
    const filter = orderCode
      ? { orderCode }
      : fedapayId
        ? { fedapayTransactionId: fedapayId }
        : null;
    if (filter) {
      const ord = await Order.findOne(filter);
      if (ord) {
        const ref =
          tx && typeof tx.reference === "string" && tx.reference.trim()
            ? tx.reference.trim()
            : "";
        const $set: Record<string, unknown> = {
          paymentStatus: "paid",
          paidAt: new Date(),
        };
        if (ref) {
          $set.fedapayReference = ref;
        }
        if (!kitchenWorkflowStarted(String(ord.status))) {
          $set.status = "paye";
        }
        await Order.updateOne({ _id: ord._id }, { $set });
      }
    }
    return NextResponse.json({ received: true });
  }

  if (name === "transaction.declined" || name === "transaction.canceled") {
    const filter = orderCode
      ? { orderCode }
      : fedapayId
        ? { fedapayTransactionId: fedapayId }
        : null;
    if (filter) {
      await Order.updateOne(
        { ...filter, paymentStatus: "pending" },
        { $set: { paymentStatus: "failed" } },
      );
    }
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
