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

export function generateOrderCode() {
  const now = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 900 + 100);
  return `ILO-${now}-${random}`;
}
