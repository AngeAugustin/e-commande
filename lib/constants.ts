import type { OrderStatus } from "@/types";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente: "Attente paiement",
  paye: "Payé",
  en_preparation: "En preparation",
  pret: "Pret",
  livre: "Livre",
};

export const ORDER_STATUSES: OrderStatus[] = [
  "paye",
  "en_attente",
  "en_preparation",
  "pret",
  "livre",
];

export const DELIVERY_TYPES = [
  { value: "livraison", label: "Livraison" },
  { value: "retrait", label: "Retrait" },
] as const;
