import { randomBytes } from "crypto";

import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDateTime(value: string | Date) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(typeof value === "string" ? new Date(value) : value);
}

/** Code commande haute entropie (pas de timestamp / Math.random). */
export function generateOrderCode() {
  return `ILO-${randomBytes(9).toString("base64url")}`;
}
