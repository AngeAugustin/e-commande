import { NextResponse } from "next/server";

import {
  configureFedaPay,
  extractPaymentUrlFromTokenResult,
  getPublicAppUrl,
  getResolvedFedapayMode,
  splitCustomerName,
  Transaction,
} from "@/lib/fedapay-server";
import { formatFedapaySdkError } from "@/lib/fedapay-errors";
import { generateOrderCode } from "@/lib/utils";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";

/**
 * Crée une commande en attente de paiement et retourne le lien FedaPay (redirection navigateur).
 */
export async function createOrderWithFedaPayCheckout(request: Request): Promise<NextResponse> {
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

    const total = Number(body.total);
    const minXof = Number.parseInt(process.env.FEDAPAY_MIN_AMOUNT_XOF ?? "100", 10);
    const minAmount = Number.isFinite(minXof) && minXof >= 1 ? minXof : 100;
    if (!Number.isFinite(total) || total < minAmount) {
      return NextResponse.json(
        {
          message: `Montant de commande invalide (minimum ${minAmount} XOF). En local vous pouvez definir FEDAPAY_MIN_AMOUNT_XOF=1 dans .env.local pour les tests.`,
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const orderCode = generateOrderCode();
    const orderPayload = {
      items: body.items,
      total,
      deliveryType: body.deliveryType,
      customerInfo: {
        name: String(body.customerInfo.name).trim(),
        phone: String(body.customerInfo.phone).trim(),
        address: String(body.customerInfo.address ?? "").trim(),
      },
      orderCode,
      status: "en_attente" as const,
      paymentStatus: "pending" as const,
      fedapayTransactionId: "",
    };

    const created = await Order.create(orderPayload);
    const appUrl = getPublicAppUrl();
    const callbackUrl = `${appUrl}/commande/${orderCode}/paiement`;

    let paymentUrl: string;
    try {
      configureFedaPay();
      const { firstname, lastname } = splitCustomerName(orderPayload.customerInfo.name);
      const mode = getResolvedFedapayMode();

      const txParams: Record<string, unknown> = {
        description: `Commande ${orderCode}`,
        amount: Math.round(total),
        currency: { iso: "XOF" },
        callback_url: callbackUrl,
        custom_metadata: { orderCode },
        customer: {
          firstname,
          lastname,
        },
      };
      if (mode) {
        txParams.mode = mode;
      }

      const transaction = await Transaction.create(txParams);
      const txId = transaction.id != null ? String(transaction.id) : "";
      if (!txId) {
        throw new Error("Transaction FedaPay sans identifiant");
      }

      await Order.updateOne({ _id: created._id }, { $set: { fedapayTransactionId: txId } });

      const tokenResult = await transaction.generateToken();
      const url = extractPaymentUrlFromTokenResult(tokenResult);

      if (!url) {
        const keys =
          tokenResult && typeof tokenResult === "object"
            ? Object.keys(tokenResult as object).join(",")
            : "";
        throw new Error(
          keys
            ? `Lien de paiement FedaPay introuvable (champs recus: ${keys}). Verifiez la cle API et l'environnement (sandbox/live).`
            : "Lien de paiement FedaPay introuvable (reponse vide). Verifiez la cle API et l'environnement (sandbox/live).",
        );
      }
      paymentUrl = url;
    } catch (err) {
      await Order.deleteOne({ _id: created._id });
      const msg = formatFedapaySdkError(err);
      return NextResponse.json({ message: msg }, { status: 502 });
    }

    return NextResponse.json(
      { orderCode, paymentUrl },
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
