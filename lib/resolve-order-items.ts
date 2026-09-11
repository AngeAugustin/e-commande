import { Types } from "mongoose";

import { Product } from "@/models/Product";
import type { CartItem, DeliveryType } from "@/types";

type RawCartLine = {
  productId?: unknown;
  quantity?: unknown;
};

export type ResolvedOrderPayload = {
  items: CartItem[];
  total: number;
  deliveryType: DeliveryType;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
  };
};

function asPositiveInt(value: unknown): number | null {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1) return null;
  return n;
}

/**
 * Reconstruit panier + total depuis la DB (ignore prix/noms envoyés par le client).
 */
export async function resolveOrderFromRequestBody(
  body: Record<string, unknown>,
): Promise<{ ok: true; data: ResolvedOrderPayload } | { ok: false; message: string }> {
  const rawItems = body.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return { ok: false, message: "Panier vide" };
  }

  const customerInfo = body.customerInfo as Record<string, unknown> | undefined;
  const name = String(customerInfo?.name ?? "").trim();
  const phone = String(customerInfo?.phone ?? "").trim();
  const address = String(customerInfo?.address ?? "").trim();

  if (!name || !phone) {
    return { ok: false, message: "Nom et telephone client obligatoires" };
  }

  const deliveryType = body.deliveryType;
  if (deliveryType !== "livraison" && deliveryType !== "retrait") {
    return { ok: false, message: "Type de livraison invalide" };
  }

  if (deliveryType === "livraison" && !address) {
    return { ok: false, message: "Adresse de livraison obligatoire" };
  }

  const quantityByProductId = new Map<string, number>();
  for (const line of rawItems as RawCartLine[]) {
    const productId = String(line.productId ?? "").trim();
    const quantity = asPositiveInt(line.quantity);
    if (!productId || !Types.ObjectId.isValid(productId) || quantity == null) {
      return { ok: false, message: "Ligne de panier invalide" };
    }
    if (quantity > 99) {
      return { ok: false, message: "Quantite trop elevee" };
    }
    quantityByProductId.set(
      productId,
      (quantityByProductId.get(productId) ?? 0) + quantity,
    );
  }

  const productIds = [...quantityByProductId.keys()];
  const products = await Product.find({
    _id: { $in: productIds },
    available: true,
  }).lean();

  if (products.length !== productIds.length) {
    return {
      ok: false,
      message: "Un ou plusieurs produits sont indisponibles",
    };
  }

  const byId = new Map(products.map((p) => [String(p._id), p]));
  const items: CartItem[] = [];
  let total = 0;

  for (const [productId, quantity] of quantityByProductId) {
    const product = byId.get(productId);
    if (!product) {
      return { ok: false, message: "Produit introuvable" };
    }
    const price = Number(product.price);
    if (!Number.isFinite(price) || price < 0) {
      return { ok: false, message: "Prix produit invalide" };
    }
    items.push({
      productId,
      name: product.name,
      price,
      image: product.image,
      quantity,
    });
    total += price * quantity;
  }

  total = Math.round(total);
  if (total < 1) {
    return { ok: false, message: "Montant de commande invalide" };
  }

  return {
    ok: true,
    data: {
      items,
      total,
      deliveryType,
      customerInfo: { name, phone, address },
    },
  };
}
