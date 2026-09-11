import { Types } from "mongoose";

import { Product } from "@/models/Product";
import type { CartItem, DeliveryType } from "@/types";

const MAX_RAW_LINES = 80;
const MAX_DISTINCT_PRODUCTS = 40;
const MAX_QTY_PER_PRODUCT = 99;
const MAX_NAME_LEN = 80;
const MAX_PHONE_LEN = 30;
const MAX_ADDRESS_LEN = 200;

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
  if (rawItems.length > MAX_RAW_LINES) {
    return { ok: false, message: "Panier trop volumineux" };
  }

  const customerInfo = body.customerInfo as Record<string, unknown> | undefined;
  const name = String(customerInfo?.name ?? "").trim();
  const phone = String(customerInfo?.phone ?? "").trim();
  const address = String(customerInfo?.address ?? "").trim();

  if (!name || !phone) {
    return { ok: false, message: "Nom et telephone client obligatoires" };
  }
  if (name.length > MAX_NAME_LEN || phone.length > MAX_PHONE_LEN || address.length > MAX_ADDRESS_LEN) {
    return { ok: false, message: "Informations client trop longues" };
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
    if (quantity > MAX_QTY_PER_PRODUCT) {
      return { ok: false, message: "Quantite trop elevee" };
    }
    const next = (quantityByProductId.get(productId) ?? 0) + quantity;
    if (next > MAX_QTY_PER_PRODUCT) {
      return { ok: false, message: "Quantite trop elevee" };
    }
    quantityByProductId.set(productId, next);
  }

  if (quantityByProductId.size > MAX_DISTINCT_PRODUCTS) {
    return { ok: false, message: "Trop de produits dans le panier" };
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
